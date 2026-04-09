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

  const bail = await prisma.bail.findFirst({
    where: { locataireId, statut: { in: ["ACTIF", "SUSPENDU"] } },
    include: { paiements: true, penalites: { where: { payee: false } } },
  });
  if (!bail) return null;

  const now = new Date();
  let moisImpayes = 0, montantDu = 0;
  for (let i = 0; i < 12; i++) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    if (m < bail.dateDebut) break;
    const p = bail.paiements.find((pay) => pay.moisConcerne.getTime() === m.getTime() && pay.statut === "PAYE");
    if (!p) { moisImpayes++; montantDu += bail.totalMensuel; }
  }
  const penalitesTotal = bail.penalites.reduce((s, p) => s + p.montant, 0);
  const prochainePenalite = moisImpayes > 0 ? new Date(now.getFullYear(), now.getMonth(), bail.jourLimitePaiement + bail.delaiGrace) : null;

  return { moisImpayes, montantDu, penalitesTotal, totalDu: montantDu + penalitesTotal, prochainePenalite, jourLimite: bail.jourLimitePaiement, statut: bail.statut };
}
