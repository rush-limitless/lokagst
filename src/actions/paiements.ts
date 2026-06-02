"use server";

import { prisma, safeAction } from "@/lib/prisma";
import { paiementSchema } from "@/lib/validations";
import { revalidatePath, revalidateTag } from "next/cache";
import { envoyerRecuPaiement } from "./emails";
import { logAction } from "@/lib/audit";
import { requireGestionnaire } from "@/lib/auth-guard";

export async function getPaiements(filters?: { bailId?: string; locataireId?: string; page?: number; limit?: number; valide?: boolean; moisConcerne?: { gte: Date; lt: Date }; bail?: any }) {
  const where: any = {};
  if (filters?.bailId) where.bailId = filters.bailId;
  if (filters?.locataireId) where.bail = { locataireId: filters.locataireId };
  if (filters?.valide !== undefined) where.valide = filters.valide;
  if (filters?.moisConcerne) where.moisConcerne = filters.moisConcerne;
  if (filters?.bail) where.bail = { ...where.bail, ...filters.bail };

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
    await requireGestionnaire();
    const data = Object.fromEntries(formData);
    const parsed = paiementSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const montantServeur = (parsed.data.montantLoyer || 0) + (parsed.data.montantCharges || 0) + (parsed.data.montantCaution || 0) + (parsed.data.montantAutres || 0);
    if (montantServeur <= 0) return { error: "Montant invalide" };

    const result = await prisma.$transaction(async (tx) => {
      const bail = await tx.bail.findUnique({ where: { id: parsed.data.bailId } });
      if (!bail) return { error: "Bail introuvable" };

      const nbMois = parsed.data.nbMois || 1;
      const jourEntree = bail.dateDebut.getDate();
      const moisConcerneInput = new Date(parsed.data.moisConcerne);
      const moisDepart = new Date(moisConcerneInput.getFullYear(), moisConcerneInput.getMonth(), jourEntree);

      // Vérifier doublons dans la transaction
      for (let i = 0; i < nbMois; i++) {
        const mois = new Date(moisDepart.getFullYear(), moisDepart.getMonth() + i, jourEntree);
        const moisDebut = new Date(mois.getFullYear(), mois.getMonth(), 1);
        const moisFin = new Date(mois.getFullYear(), mois.getMonth() + 1, 0);
        const existing = await tx.paiement.findFirst({
          where: { bailId: parsed.data.bailId, moisConcerne: { gte: moisDebut, lte: moisFin }, statut: "PAYE" },
        });
        if (existing) {
          const moisLabel = mois.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
          return { error: `Le mois de ${moisLabel} est déjà entièrement payé` };
        }
      }

      let remainingLoyer = parsed.data.montantLoyer;
      let remainingCharges = parsed.data.montantCharges;
      const updatedIds: string[] = [];

      // 1. Compléter les mois partiels existants
      const existingPartial = await tx.paiement.findMany({
        where: { bailId: parsed.data.bailId, statut: "PARTIELLEMENT_PAYE" },
        orderBy: { moisConcerne: "asc" },
      });
      for (const ep of existingPartial) {
        if (remainingLoyer <= 0 && remainingCharges <= 0) break;
        const addLoyer = Math.min(remainingLoyer, Math.max(0, bail.montantLoyer - ep.montantLoyer));
        const addCharges = Math.min(remainingCharges, Math.max(0, bail.totalCharges - ep.montantCharges));
        if (addLoyer > 0 || addCharges > 0) {
          const newLoyer = ep.montantLoyer + addLoyer;
          const newCharges = ep.montantCharges + addCharges;
          const newMontant = ep.montant + addLoyer + addCharges;
          const resteDu = Math.max(0, bail.totalMensuel - (newLoyer + newCharges));
          await tx.paiement.update({
            where: { id: ep.id },
            data: { montantLoyer: newLoyer, montantCharges: newCharges, montant: newMontant, resteDu, statut: resteDu > 0 ? "PARTIELLEMENT_PAYE" : "PAYE" },
          });
          updatedIds.push(ep.id);
          remainingLoyer -= addLoyer;
          remainingCharges -= addCharges;
        }
      }

      // 2. Créer les nouveaux mois
      const paiements: any[] = [];
      const isJournalier = bail.periodicite === "JOURNALIER";

      if (isJournalier) {
        const totalLoyer = Math.min(remainingLoyer, bail.montantLoyer * nbMois);
        const totalChargesP = Math.min(remainingCharges, bail.totalCharges * nbMois);
        if (totalLoyer > 0 || totalChargesP > 0) {
          const montant = totalLoyer + totalChargesP + (parsed.data.montantCaution || 0) + (parsed.data.montantAutres || 0);
          const attendu = bail.totalMensuel * nbMois;
          const resteDu = Math.max(0, attendu - (totalLoyer + totalChargesP));
          const p = await tx.paiement.create({
            data: {
              bailId: bail.id, montant, montantLoyer: totalLoyer, montantCharges: totalChargesP,
              montantCaution: parsed.data.montantCaution || 0, montantAutres: parsed.data.montantAutres || 0,
              notesAutres: parsed.data.notesAutres || null, moisConcerne: moisDepart,
              modePaiement: parsed.data.modePaiement, resteDu,
              statut: resteDu > 0 ? "PARTIELLEMENT_PAYE" : "PAYE",
              preuvePaiement: parsed.data.preuvePaiement || null,
              notes: parsed.data.notes || `Paiement ${nbMois} jour(s)`,
            },
          });
          paiements.push(p);
        }
      } else {
        for (let i = 0; i < nbMois && (remainingLoyer > 0 || remainingCharges > 0); i++) {
          const moisConcerne = new Date(moisDepart.getFullYear(), moisDepart.getMonth() + i, jourEntree);
          const loyerCeMois = Math.min(remainingLoyer, bail.montantLoyer);
          const chargesCeMois = Math.min(remainingCharges, bail.totalCharges);
          if (loyerCeMois <= 0 && chargesCeMois <= 0) break;
          const montant = loyerCeMois + chargesCeMois + (i === 0 ? (parsed.data.montantCaution || 0) + (parsed.data.montantAutres || 0) : 0);
          const resteDu = Math.max(0, bail.totalMensuel - (loyerCeMois + chargesCeMois));
          const p = await tx.paiement.create({
            data: {
              bailId: bail.id, montant, montantLoyer: loyerCeMois, montantCharges: chargesCeMois,
              montantCaution: i === 0 ? (parsed.data.montantCaution || 0) : 0,
              montantAutres: i === 0 ? (parsed.data.montantAutres || 0) : 0,
              notesAutres: i === 0 ? (parsed.data.notesAutres || null) : null,
              moisConcerne, modePaiement: parsed.data.modePaiement, resteDu,
              statut: resteDu > 0 ? "PARTIELLEMENT_PAYE" : "PAYE",
              preuvePaiement: parsed.data.preuvePaiement || null,
              notes: i === 0 ? (parsed.data.notes || null) : `Ventilation mois ${i + 1}/${nbMois}`,
            },
          });
          paiements.push(p);
          remainingLoyer -= loyerCeMois;
          remainingCharges -= chargesCeMois;
        }
      }

      // Caution
      if (parsed.data.montantCaution && parsed.data.montantCaution > 0) {
        const totalCautionPayee = (await tx.paiement.aggregate({ where: { bailId: bail.id }, _sum: { montantCaution: true } }))._sum.montantCaution || 0;
        if (totalCautionPayee >= bail.montantCaution) {
          await tx.bail.update({ where: { id: bail.id }, data: { cautionPayee: true } });
        }
      }

      // Pénalité
      if (data.appliquerPenalite === "on") {
        const montantPenalite = bail.penaliteType === "POURCENTAGE"
          ? Math.round(bail.montantLoyer * bail.penaliteMontant / 100)
          : bail.penaliteMontant;
        if (montantPenalite > 0) {
          await tx.penalite.create({
            data: { bailId: bail.id, moisConcerne: moisDepart, montant: montantPenalite, motif: `Pénalité de retard (${bail.penaliteMontant}${bail.penaliteType === "POURCENTAGE" ? "%" : " FCFA"})` },
          });
        }
      }

      return { success: true, paiements, updatedIds };
    });

    if ("error" in result) return { error: result.error };

    const firstId = result.paiements.length > 0 ? result.paiements[0].id : result.updatedIds[0] || "unknown";
    if (result.paiements.length > 0) envoyerRecuPaiement(result.paiements[0].id).catch(() => {});
    logAction("Paiement", "Paiement", firstId, `${parsed.data.nbMois || 1} mois — ${montantServeur} FCFA — Bail ${parsed.data.bailId.slice(0, 8)}`);
    revalidatePath("/paiements"); revalidateTag("dashboard"); revalidateTag("situation");
    return { success: true };
  });
}

export async function modifierPaiement(id: string, formData: FormData) {
  return safeAction(async () => {
    await requireGestionnaire();
    const montant = parseInt(formData.get("montant") as string);
    const montantLoyer = parseInt(formData.get("montantLoyer") as string) || 0;
    const montantCharges = parseInt(formData.get("montantCharges") as string) || 0;
    const montantCaution = parseInt(formData.get("montantCaution") as string) || 0;
    const montantAutres = parseInt(formData.get("montantAutres") as string) || 0;
    const notes = formData.get("notes") as string;
    const moisConcerneRaw = formData.get("moisConcerne") as string;

    if (!montant || montant <= 0) return { error: "Montant invalide" };

    const paiement = await prisma.paiement.findUnique({ where: { id }, include: { bail: true } });
    if (!paiement) return { error: "Paiement introuvable" };

    const moisConcerne = moisConcerneRaw ? new Date(moisConcerneRaw) : paiement.moisConcerne;
    const resteDu = Math.max(0, paiement.bail.totalMensuel - montant);
    await prisma.paiement.update({
      where: { id },
      data: { montant, montantLoyer, montantCharges, montantCaution, montantAutres, notes, moisConcerne, resteDu, statut: resteDu > 0 ? "PARTIELLEMENT_PAYE" : "PAYE" },
    });

    revalidatePath("/paiements"); revalidateTag("dashboard"); revalidateTag("situation");
    return { success: true };
  });
}

export async function supprimerPaiement(id: string) {
  return safeAction(async () => {
    await requireGestionnaire();
    const p = await prisma.paiement.findUnique({ where: { id }, select: { montant: true, bailId: true, moisConcerne: true } });
    await prisma.paiement.delete({ where: { id } });
    if (p) logAction("Suppression", "Paiement", id, `${p.montant} FCFA — ${p.moisConcerne.toISOString().slice(0, 7)}`);
    revalidatePath("/paiements"); revalidateTag("dashboard"); revalidateTag("situation");
    return { success: true };
  });
}

export async function validerPaiement(id: string) {
  await requireGestionnaire();
  await prisma.paiement.update({ where: { id }, data: { valide: true } });
  revalidatePath("/paiements"); revalidateTag("dashboard"); revalidateTag("situation");
  return { success: true };
}

export async function rejeterPaiement(id: string) {
  return safeAction(async () => {
    await requireGestionnaire();
    await prisma.paiement.delete({ where: { id } });
    revalidatePath("/paiements"); revalidateTag("dashboard"); revalidateTag("situation");
    return { success: true };
  });
}
