"use server";

import { prisma, safeAction } from "@/lib/prisma";
import { paiementSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { envoyerRecuPaiement } from "./emails";

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
    const moisDepart = new Date(parsed.data.moisConcerne);
    const loyerParMois = Math.round(parsed.data.montantLoyer / nbMois);
    const chargesParMois = Math.round(parsed.data.montantCharges / nbMois);
    const montantParMois = loyerParMois + chargesParMois;

    const paiements = await prisma.$transaction(
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
    );

    if (parsed.data.montantCaution && parsed.data.montantCaution > 0) {
      await prisma.bail.update({ where: { id: parsed.data.bailId }, data: { cautionPayee: true } });
    }

    envoyerRecuPaiement(paiements[0].id).catch(() => {});
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
    await prisma.paiement.delete({ where: { id } });
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
