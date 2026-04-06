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

  const existing = await prisma.paiement.findUnique({
    where: { bailId_moisConcerne: { bailId: parsed.data.bailId, moisConcerne: parsed.data.moisConcerne } },
  });

  const montantTotal = (existing?.montant || 0) + parsed.data.montant;
  const resteDu = Math.max(0, bail.montantLoyer - montantTotal);
  const statut = resteDu > 0 ? "PARTIELLEMENT_PAYE" : "PAYE";

  let paiement;
  if (existing) {
    paiement = await prisma.paiement.update({ where: { id: existing.id }, data: { montant: montantTotal, resteDu, statut, modePaiement: parsed.data.modePaiement, preuvePaiement: parsed.data.preuvePaiement || existing.preuvePaiement, notes: parsed.data.notes } });
  } else {
    paiement = await prisma.paiement.create({ data: { bailId: parsed.data.bailId, montant: parsed.data.montant, moisConcerne: parsed.data.moisConcerne, modePaiement: parsed.data.modePaiement, resteDu, statut, preuvePaiement: parsed.data.preuvePaiement || null, notes: parsed.data.notes } });
  }

  // Envoi automatique du reçu par email
  envoyerRecuPaiement(paiement.id).catch(() => {});

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

