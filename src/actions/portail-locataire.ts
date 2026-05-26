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
          penalites: { where: { payee: false }, orderBy: { appliqueLe: "desc" } },
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

export async function getMesPenalites() {
  const locataireId = await getLocataireId();
  if (!locataireId) return [];

  return prisma.penalite.findMany({
    where: { bail: { locataireId } },
    orderBy: { appliqueLe: "desc" },
  });
}

export async function getMaSituation() {
  const locataireId = await getLocataireId();
  if (!locataireId) return null;

  const { getSituationLocataire } = await import("./situation");
  const situation = await getSituationLocataire(locataireId);
  if (!situation) return null;

  const bail = situation.bail;
  const moisImpayes = situation.loyer.moisImpayes;
  const montantDu = situation.loyer.montantDu + situation.charges.montantDu;
  const penalitesTotal = situation.penalites.montant;
  const prochainePenalite = moisImpayes > 0 ? new Date(new Date().getFullYear(), new Date().getMonth(), bail.jourLimitePaiement + bail.delaiGrace) : null;

  return { moisImpayes, montantDu, penalitesTotal, totalDu: situation.totalDu, prochainePenalite, jourLimite: bail.jourLimitePaiement, statut: bail.statut };
}
