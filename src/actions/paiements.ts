"use server";

import { prisma, safeAction } from "@/lib/prisma";
import { paiementSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { envoyerRecuPaiement } from "./emails";
import { logAction } from "@/lib/audit";

export async function getPaiements(filters?: { bailId?: string; locataireId?: string; page?: number; limit?: number }) {
  const where: any = {};
  if (filters?.bailId) where.bailId = filters.bailId;
  if (filters?.locataireId) where.bail = { locataireId: filters.locataireId };

  const limit = filters?.limit || 50;
  const page = filters?.page || 1;
  const skip = (page - 1) * limit;

  const [paiements, total] = await Promise.all([
    prisma.paiement.findMany({
      where,
      include: { bail: { include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } } } } },
      orderBy: { moisConcerne: "desc" },
      take: limit,
      skip,
    }),
    prisma.paiement.count({ where }),
  ]);

  return { paiements, total, pages: Math.ceil(total / limit), page };
}

export async function enregistrerPaiement(formData: FormData) {
  return safeAction(async () => {
    const data = Object.fromEntries(formData);
    const parsed = paiementSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const bail = await prisma.bail.findUnique({ where: { id: parsed.data.bailId } });
    if (!bail) return { error: "Bail introuvable" };

    const nbMois = parsed.data.nbMois || 1;
    // Règle du 15: si la date est après le 15, le mois de départ est le mois suivant
    const dateRef = new Date(parsed.data.moisConcerne);
    const moisDepart = dateRef.getDate() > 15
      ? new Date(dateRef.getFullYear(), dateRef.getMonth() + 1, 1)
      : new Date(dateRef.getFullYear(), dateRef.getMonth(), 1);
    const loyerTotal = parsed.data.montantLoyer;
    const chargesTotal = parsed.data.montantCharges;

    // Find incomplete months to fill first
    const existingPaiements = await prisma.paiement.findMany({
      where: { bailId: parsed.data.bailId, statut: "PARTIELLEMENT_PAYE" },
      orderBy: { moisConcerne: "asc" },
    });

    let remainingLoyer = loyerTotal;
    let remainingCharges = chargesTotal;
    const updates: { id: string; addLoyer: number; addCharges: number }[] = [];

    // First: complete incomplete months
    for (const ep of existingPaiements) {
      if (remainingLoyer <= 0 && remainingCharges <= 0) break;
      const loyerManquant = Math.max(0, bail.montantLoyer - ep.montantLoyer);
      const chargesManquantes = Math.max(0, bail.totalCharges - ep.montantCharges);
      const addLoyer = Math.min(remainingLoyer, loyerManquant);
      const addCharges = Math.min(remainingCharges, chargesManquantes);
      if (addLoyer > 0 || addCharges > 0) {
        updates.push({ id: ep.id, addLoyer, addCharges });
        remainingLoyer -= addLoyer;
        remainingCharges -= addCharges;
      }
    }

    // Apply updates to incomplete months
    for (const u of updates) {
      const ep = existingPaiements.find((p) => p.id === u.id)!;
      const newLoyer = ep.montantLoyer + u.addLoyer;
      const newCharges = ep.montantCharges + u.addCharges;
      const newMontant = ep.montant + u.addLoyer + u.addCharges;
      const resteDu = Math.max(0, bail.totalMensuel - (newLoyer + newCharges));
      await prisma.paiement.update({
        where: { id: u.id },
        data: { montantLoyer: newLoyer, montantCharges: newCharges, montant: newMontant, resteDu, statut: resteDu > 0 ? "PARTIELLEMENT_PAYE" : "PAYE" },
      });
    }

    // Then: create new month entries with remaining amounts
    const loyerParMois = nbMois > 0 && remainingLoyer > 0 ? Math.round(remainingLoyer / nbMois) : 0;
    const chargesParMois = nbMois > 0 && remainingCharges > 0 ? Math.round(remainingCharges / nbMois) : 0;
    const montantParMois = loyerParMois + chargesParMois;

    const paiements = montantParMois > 0 ? await prisma.$transaction(
      Array.from({ length: nbMois }, (_, i) => {
        const moisConcerne = new Date(moisDepart.getFullYear(), moisDepart.getMonth() + i, 1);
        const resteDu = Math.max(0, bail.totalMensuel - montantParMois);
        return prisma.paiement.create({
          data: {
            bailId: parsed.data.bailId,
            montant: montantParMois + (i === 0 ? (parsed.data.montantCaution || 0) + (parsed.data.montantAutres || 0) : 0),
            montantLoyer: loyerParMois, montantCharges: chargesParMois,
            montantCaution: i === 0 ? (parsed.data.montantCaution || 0) : 0,
            montantAutres: i === 0 ? (parsed.data.montantAutres || 0) : 0,
            notesAutres: i === 0 ? (parsed.data.notesAutres || null) : null,
            moisConcerne, modePaiement: parsed.data.modePaiement,
            resteDu, statut: resteDu > 0 ? "PARTIELLEMENT_PAYE" : "PAYE",
            preuvePaiement: parsed.data.preuvePaiement || null,
            notes: i === 0 ? (parsed.data.notes || null) : `Ventilation mois ${i + 1}/${nbMois}`,
          },
        });
      })
    ) : [];

    if (parsed.data.montantCaution && parsed.data.montantCaution > 0) {
      await prisma.bail.update({ where: { id: parsed.data.bailId }, data: { cautionPayee: true } });
    }

    const firstId = paiements.length > 0 ? paiements[0].id : updates.length > 0 ? updates[0].id : "unknown";
    if (paiements.length > 0) envoyerRecuPaiement(paiements[0].id).catch(() => {});
    logAction("Paiement", "Paiement", firstId, `${nbMois} mois — ${parsed.data.montant} FCFA — Bail ${parsed.data.bailId.slice(0, 8)}${updates.length > 0 ? ` (${updates.length} mois complétés)` : ""}`);
    revalidatePath("/paiements");
    return { success: true };
  });
}

export async function modifierPaiement(id: string, formData: FormData) {
  return safeAction(async () => {
    const montant = parseInt(formData.get("montant") as string);
    const montantLoyer = parseInt(formData.get("montantLoyer") as string) || 0;
    const montantCharges = parseInt(formData.get("montantCharges") as string) || 0;
    const montantCaution = parseInt(formData.get("montantCaution") as string) || 0;
    const montantAutres = parseInt(formData.get("montantAutres") as string) || 0;
    const notes = formData.get("notes") as string;

    if (!montant || montant <= 0) return { error: "Montant invalide" };

    const paiement = await prisma.paiement.findUnique({ where: { id }, include: { bail: true } });
    if (!paiement) return { error: "Paiement introuvable" };

    const resteDu = Math.max(0, paiement.bail.totalMensuel - montant);
    await prisma.paiement.update({
      where: { id },
      data: { montant, montantLoyer, montantCharges, montantCaution, montantAutres, notes, resteDu, statut: resteDu > 0 ? "PARTIELLEMENT_PAYE" : "PAYE" },
    });

    revalidatePath("/paiements");
    return { success: true };
  });
}

export async function supprimerPaiement(id: string) {
  return safeAction(async () => {
    const p = await prisma.paiement.findUnique({ where: { id }, select: { montant: true, bailId: true, moisConcerne: true } });
    await prisma.paiement.delete({ where: { id } });
    if (p) logAction("Suppression", "Paiement", id, `${p.montant} FCFA — ${p.moisConcerne.toISOString().slice(0, 7)}`);
    revalidatePath("/paiements");
    return { success: true };
  });
}

export async function validerPaiement(id: string) {
  await prisma.paiement.update({ where: { id }, data: { valide: true } });
  revalidatePath("/paiements");
  return { success: true };
}

export async function rejeterPaiement(id: string) {
  return safeAction(async () => {
    await prisma.paiement.delete({ where: { id } });
    revalidatePath("/paiements");
    return { success: true };
  });
}
