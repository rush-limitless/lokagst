"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getMesTickets() {
  const session = await auth();
  if (!session?.user?.locataireId) return [];
  return prisma.maintenance.findMany({
    where: { locataireId: session.user.locataireId },
    include: { appartement: { select: { numero: true } } },
    orderBy: { creeLe: "desc" },
  });
}

export async function signalerProbleme(formData: FormData) {
  const session = await auth();
  if (!session?.user?.locataireId) return { error: "Non autorisé" };

  const titre = formData.get("titre") as string;
  const description = formData.get("description") as string;
  const priorite = (formData.get("priorite") as string) || "NORMALE";
  const photosStr = formData.get("photos") as string;
  const photos = photosStr ? JSON.parse(photosStr) : [];

  if (!titre || !description) return { error: "Titre et description requis" };

  // Trouver l'appartement du locataire
  const bail = await prisma.bail.findFirst({
    where: { locataireId: session.user.locataireId, statut: "ACTIF" },
  });
  if (!bail) return { error: "Aucun bail actif" };

  await prisma.maintenance.create({
    data: { titre, description, appartementId: bail.appartementId, locataireId: session.user.locataireId, priorite: priorite as any, photos },
  });
  revalidatePath("/mon-espace/maintenance");
  return { success: true };
}
