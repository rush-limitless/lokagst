"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getEtatsDesLieux(bailId: string) {
  return prisma.etatDesLieux.findMany({ where: { bailId }, orderBy: { date: "desc" } });
}

export async function creerEtatDesLieux(formData: FormData) {
  const bailId = formData.get("bailId") as string;
  const type = formData.get("type") as string;
  const observations = formData.get("observations") as string;
  const piecesStr = formData.get("pieces") as string;
  const photosStr = formData.get("photos") as string;
  const signatureLocataire = formData.get("signatureLocataire") as string;
  const signatureGestionnaire = formData.get("signatureGestionnaire") as string;

  const pieces = piecesStr ? JSON.parse(piecesStr) : [];
  const photos = photosStr ? JSON.parse(photosStr) : [];

  await prisma.etatDesLieux.create({
    data: {
      bailId, type: type as any, observations: observations || null,
      pieces, photos,
      signatureLocataire: signatureLocataire || null,
      signatureGestionnaire: signatureGestionnaire || null,
    },
  });
  revalidatePath(`/baux/${bailId}`);
  return { success: true };
}
