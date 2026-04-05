"use server";

import { prisma } from "@/lib/prisma";
import { bailSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getBaux(filters?: { statut?: string; expirantDans?: number }) {
  const where: any = {};
  if (filters?.statut) where.statut = filters.statut;
  if (filters?.expirantDans) {
    const limit = new Date();
    limit.setDate(limit.getDate() + filters.expirantDans);
    where.dateFin = { lte: limit };
    where.statut = "ACTIF";
  }

  return prisma.bail.findMany({
    where,
    include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true, etage: true } } },
    orderBy: { creeLe: "desc" },
  });
}

export async function getBail(id: string) {
  return prisma.bail.findUnique({
    where: { id },
    include: { locataire: true, appartement: true, paiements: { orderBy: { moisConcerne: "desc" } } },
  });
}

export async function creerBail(formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = bailSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const dateFin = new Date(parsed.data.dateDebut);
  dateFin.setMonth(dateFin.getMonth() + parsed.data.dureeMois);

  await prisma.bail.create({ data: { ...parsed.data, dateFin } });
  await prisma.appartement.update({ where: { id: parsed.data.appartementId }, data: { statut: "OCCUPE" } });
  revalidatePath("/baux");
  return { success: true };
}

export async function resilierBail(id: string) {
  const bail = await prisma.bail.findUnique({ where: { id } });
  if (!bail) return { error: "Bail introuvable" };

  await prisma.bail.update({ where: { id }, data: { statut: "RESILIE" } });
  await prisma.appartement.update({ where: { id: bail.appartementId }, data: { statut: "LIBRE" } });

  const autreBail = await prisma.bail.findFirst({ where: { locataireId: bail.locataireId, statut: "ACTIF" } });
  if (!autreBail) await prisma.locataire.update({ where: { id: bail.locataireId }, data: { statut: "ARCHIVE", dateSortie: new Date() } });

  revalidatePath("/baux");
  return { success: true };
}

export async function renouvelerBail(id: string, formData: FormData) {
  const bail = await prisma.bail.findUnique({ where: { id } });
  if (!bail) return { error: "Bail introuvable" };

  const dureeMois = parseInt(formData.get("dureeMois") as string);
  const montantLoyer = parseInt(formData.get("montantLoyer") as string) || bail.montantLoyer;

  const dateDebut = bail.dateFin;
  const dateFin = new Date(dateDebut);
  dateFin.setMonth(dateFin.getMonth() + dureeMois);

  await prisma.bail.update({ where: { id }, data: { statut: "TERMINE" } });
  await prisma.bail.create({ data: { locataireId: bail.locataireId, appartementId: bail.appartementId, dateDebut, dureeMois, dateFin, montantLoyer, montantCaution: bail.montantCaution } });

  revalidatePath("/baux");
  return { success: true };
}
