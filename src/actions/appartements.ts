"use server";

import { prisma } from "@/lib/prisma";
import { appartementSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";

export async function getAppartements(filters?: { etage?: string; statut?: string; recherche?: string }) {
  const where: any = {};
  if (filters?.etage) where.etage = filters.etage;
  if (filters?.statut) where.statut = filters.statut;
  if (filters?.recherche) where.numero = { contains: filters.recherche, mode: "insensitive" };

  const appartements = await prisma.appartement.findMany({
    where,
    include: { baux: { where: { statut: "ACTIF" }, include: { locataire: { select: { nom: true, prenom: true } } } } },
    orderBy: { numero: "asc" },
  });

  return appartements.map((a) => ({
    ...a,
    locataireActuel: a.baux[0]?.locataire || null,
  }));
}

export async function getAppartement(id: string) {
  return prisma.appartement.findUnique({
    where: { id },
    include: { baux: { include: { locataire: true, paiements: true }, orderBy: { creeLe: "desc" } } },
  });
}

export async function creerAppartement(formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = appartementSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const exists = await prisma.appartement.findUnique({ where: { numero: parsed.data.numero } });
  if (exists) return { error: "Ce numéro d'appartement existe déjà" };

  await prisma.appartement.create({ data: parsed.data });
  await logAction("Création", "Appartement", parsed.data.numero, `${parsed.data.type} — ${parsed.data.loyerBase} FCFA`);
  revalidatePath("/appartements");
  return { success: true };
}

export async function modifierAppartement(id: string, formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = appartementSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.appartement.update({ where: { id }, data: parsed.data });
  await logAction("Modification", "Appartement", id);
  revalidatePath("/appartements");
  return { success: true };
}

export async function supprimerAppartement(id: string) {
  const bailActif = await prisma.bail.findFirst({ where: { appartementId: id, statut: "ACTIF" } });
  if (bailActif) return { error: "Cet appartement a un bail actif. Résiliez d'abord le bail." };

  await prisma.appartement.delete({ where: { id } });
  revalidatePath("/appartements");
  return { success: true };
}
