"use server";

import { prisma } from "@/lib/prisma";
import { paiementSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { envoyerRecuPaiement } from "./emails";

export async function getPaiements(filters?: { bailId?: string; locataireId?: string }) {
  const where: any = {};
  if (filters?.bailId) where.bailId = filters.bailId;
  if (filters?.locataireId) where.bail = { locataireId: filters.locataireId };

  return prisma.paiement.findMany({
    where,
    include: { bail: { include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } } } } },
    orderBy: { moisConcerne: "desc" },
  });
}

export async function enregistrerPaiement(formData: FormData) {
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

  let premierPaiement: any = null;

  for (let i = 0; i < nbMois; i++) {
    const moisConcerne = new Date(moisDepart.getFullYear(), moisDepart.getMonth() + i, 1);
    const resteDu = Math.max(0, bail.totalMensuel - montantParMois);
    const statut = resteDu > 0 ? "PARTIELLEMENT_PAYE" : "PAYE";

    const paiement = await prisma.paiement.create({
      data: {
        bailId: parsed.data.bailId,
        montant: montantParMois + (i === 0 ? (parsed.data.montantCaution || 0) + (parsed.data.montantAutres || 0) : 0),
        montantLoyer: loyerParMois,
        montantCharges: chargesParMois,
        montantCaution: i === 0 ? (parsed.data.montantCaution || 0) : 0,
        montantAutres: i === 0 ? (parsed.data.montantAutres || 0) : 0,
        notesAutres: i === 0 ? (parsed.data.notesAutres || null) : null,
        moisConcerne,
        modePaiement: parsed.data.modePaiement,
        resteDu,
        statut,
        preuvePaiement: parsed.data.preuvePaiement || null,
        notes: i === 0 ? (parsed.data.notes || null) : `Ventilation mois ${i + 1}/${nbMois}`,
      },
    });
    if (i === 0) premierPaiement = paiement;
  }

  // Marquer caution payée si montant caution > 0
  if (parsed.data.montantCaution && parsed.data.montantCaution > 0) {
    await prisma.bail.update({ where: { id: parsed.data.bailId }, data: { cautionPayee: true } });
  }

  if (premierPaiement) envoyerRecuPaiement(premierPaiement.id).catch(() => {});

  revalidatePath("/paiements");
  return { success: true };
}

export async function modifierPaiement(id: string, formData: FormData) {
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
}

export async function supprimerPaiement(id: string) {
  await prisma.paiement.delete({ where: { id } });
  revalidatePath("/paiements");
  return { success: true };
}

export async function validerPaiement(id: string) {
  await prisma.paiement.update({ where: { id }, data: { valide: true } });
  revalidatePath("/paiements");
  return { success: true };
}

export async function rejeterPaiement(id: string) {
  const paiement = await prisma.paiement.findUnique({ where: { id }, include: { bail: true } });
  if (!paiement) return { error: "Paiement introuvable" };
  await prisma.paiement.delete({ where: { id } });
  revalidatePath("/paiements");
  return { success: true };
}
