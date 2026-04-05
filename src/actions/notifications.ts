"use server";

import { prisma } from "@/lib/prisma";

export async function getNotifications() {
  const now = new Date();
  const moisCourant = new Date(now.getFullYear(), now.getMonth(), 1);
  const dans30j = new Date(); dans30j.setDate(dans30j.getDate() + 30);

  const [impayes, bauxExpirants, bauxSuspendus, ticketsOuverts] = await Promise.all([
    prisma.bail.findMany({
      where: { statut: "ACTIF" },
      include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } }, paiements: true },
    }).then((baux) => baux.filter((b) => !b.paiements.some((p) => p.moisConcerne.getTime() === moisCourant.getTime() && p.statut === "PAYE"))),
    prisma.bail.findMany({ where: { statut: "ACTIF", dateFin: { lte: dans30j, gte: now } }, include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } } } }),
    prisma.bail.count({ where: { statut: "SUSPENDU" } }),
    prisma.maintenance.count({ where: { statut: { in: ["SIGNALE", "EN_COURS"] } } }),
  ]);

  const notifications = [
    ...impayes.map((b) => ({ type: "impaye" as const, message: `${b.locataire.prenom} ${b.locataire.nom} — Loyer impayé (${b.appartement.numero})` })),
    ...bauxExpirants.map((b) => ({ type: "expiration" as const, message: `Bail ${b.locataire.prenom} ${b.locataire.nom} expire bientôt (${b.appartement.numero})` })),
    ...(bauxSuspendus > 0 ? [{ type: "suspension" as const, message: `${bauxSuspendus} bail(s) suspendu(s)` }] : []),
    ...(ticketsOuverts > 0 ? [{ type: "maintenance" as const, message: `${ticketsOuverts} ticket(s) de maintenance ouvert(s)` }] : []),
  ];

  return { notifications, count: notifications.length };
}
