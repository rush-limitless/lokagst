"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function getLocataireId() {
  const session = await auth();
  if (!session?.user?.locataireId) return null;
  return session.user.locataireId;
}

export async function getMonEspace() {
  const locataireId = await getLocataireId();
  if (!locataireId) return null;

  return prisma.locataire.findUnique({
    where: { id: locataireId },
    include: {
      baux: {
        where: { statut: "ACTIF" },
        include: {
          appartement: true,
          paiements: { orderBy: { moisConcerne: "desc" }, take: 5 },
        },
      },
    },
  });
}

export async function getMonBail() {
  const locataireId = await getLocataireId();
  if (!locataireId) return null;

  return prisma.bail.findFirst({
    where: { locataireId, statut: "ACTIF" },
    include: { appartement: true },
  });
}

export async function getMesPaiements() {
  const locataireId = await getLocataireId();
  if (!locataireId) return [];

  return prisma.paiement.findMany({
    where: { bail: { locataireId } },
    include: { bail: { include: { appartement: { select: { numero: true } } } } },
    orderBy: { moisConcerne: "desc" },
  });
}
