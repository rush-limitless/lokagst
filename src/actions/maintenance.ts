"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMaintenances(filters?: { statut?: string; appartementId?: string }) {
  const where: any = {};
  if (filters?.statut) where.statut = filters.statut;
  if (filters?.appartementId) where.appartementId = filters.appartementId;

  return prisma.maintenance.findMany({
    where,
    include: { appartement: { select: { numero: true } }, locataire: { select: { nom: true, prenom: true, photo: true } } },
    orderBy: { creeLe: "desc" },
  });
}

export async function getMaintenance(id: string) {
  return prisma.maintenance.findUnique({
    where: { id },
    include: { appartement: true, locataire: true },
  });
}

export async function creerMaintenance(formData: FormData) {
  const titre = formData.get("titre") as string;
  const description = formData.get("description") as string;
  const appartementId = formData.get("appartementId") as string;
  const locataireId = formData.get("locataireId") as string;
  const priorite = (formData.get("priorite") as string) || "NORMALE";
  const photosStr = formData.get("photos") as string;
  const photos = photosStr ? JSON.parse(photosStr) : [];

  if (!titre || !description || !appartementId || !locataireId) return { error: "Champs requis manquants" };

  await prisma.maintenance.create({
    data: { titre, description, appartementId, locataireId, priorite: priorite as any, photos },
  });
  revalidatePath("/maintenance");
  return { success: true };
}

export async function mettreAJourMaintenance(id: string, formData: FormData) {
  const statut = formData.get("statut") as string;
  const technicien = formData.get("technicien") as string;
  const commentaire = formData.get("commentaire") as string;

  const data: any = {};
  if (statut) data.statut = statut;
  if (technicien) data.technicien = technicien;
  if (commentaire) data.commentaire = commentaire;

  await prisma.maintenance.update({ where: { id }, data });
  revalidatePath("/maintenance");
  return { success: true };
}
