"use server";

import { prisma } from "@/lib/prisma";

export async function getNotifications() {
  const now = new Date();
  const jourDuMois = now.getDate();
  const moisCourant = new Date(now.getFullYear(), now.getMonth(), 1);
  const dans30j = new Date(); dans30j.setDate(dans30j.getDate() + 30);
  const dans60j = new Date(); dans60j.setDate(dans60j.getDate() + 60);

  const [bauxActifs, bauxExpirants, bauxSuspendus, ticketsOuverts, messagesNonLus, paiementsEnAttente] = await Promise.all([
    prisma.bail.findMany({
      where: { statut: "ACTIF" },
      include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } }, paiements: true },
    }),
    prisma.bail.findMany({ where: { statut: "ACTIF", dateFin: { lte: dans60j, gte: now } }, include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } } } }),
    prisma.bail.findMany({ where: { statut: "SUSPENDU" }, include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } } } }),
    prisma.maintenance.findMany({ where: { statut: { in: ["SIGNALE", "EN_COURS"] } }, include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } } }, take: 10 }),
    prisma.message.count({ where: { expediteur: "LOCATAIRE", lu: false } }),
    prisma.paiement.count({ where: { valide: false } }),
  ]);

  // Impayés : seulement si jour limite dépassé
  const impayes = bauxActifs.filter((b) => {
    if (jourDuMois <= b.jourLimitePaiement) return false;
    return !b.paiements.some((p) => p.moisConcerne.getTime() === moisCourant.getTime() && p.statut === "PAYE");
  });

  const notifications: { type: string; icon: string; message: string; link: string; urgence: "haute" | "moyenne" | "basse"; date: Date }[] = [];

  // Impayés (haute urgence)
  impayes.forEach((b) => {
    notifications.push({
      type: "impaye", icon: "🔴",
      message: `${b.locataire.prenom} ${b.locataire.nom} — Loyer impayé (${b.appartement.numero})`,
      link: `/locataires`, urgence: "haute", date: now,
    });
  });

  // Baux suspendus (haute urgence)
  bauxSuspendus.forEach((b) => {
    notifications.push({
      type: "suspension", icon: "⛔",
      message: `Bail suspendu — ${b.locataire.prenom} ${b.locataire.nom} (${b.appartement.numero})`,
      link: `/baux/${b.id}`, urgence: "haute", date: now,
    });
  });

  // Paiements en attente de validation
  if (paiementsEnAttente > 0) {
    notifications.push({
      type: "validation", icon: "⏳",
      message: `${paiementsEnAttente} paiement(s) en attente de validation`,
      link: `/paiements`, urgence: "moyenne", date: now,
    });
  }

  // Baux expirants (moyenne urgence)
  bauxExpirants.forEach((b) => {
    const jours = Math.ceil((new Date(b.dateFin).getTime() - now.getTime()) / 86400000);
    notifications.push({
      type: "expiration", icon: "🟠",
      message: `Bail expire dans ${jours}j — ${b.locataire.prenom} ${b.locataire.nom} (${b.appartement.numero})`,
      link: `/baux/${b.id}`, urgence: jours <= 15 ? "haute" : "moyenne", date: now,
    });
  });

  // Tickets maintenance (moyenne urgence)
  ticketsOuverts.forEach((t) => {
    notifications.push({
      type: "maintenance", icon: "🔧",
      message: `Ticket ${t.statut === "SIGNALE" ? "signalé" : "en cours"} — ${t.locataire.prenom} ${t.locataire.nom} (${t.appartement.numero})`,
      link: `/maintenance/${t.id}`, urgence: "moyenne", date: new Date(t.creeLe),
    });
  });

  // Messages non lus (basse urgence)
  if (messagesNonLus > 0) {
    notifications.push({
      type: "message", icon: "💬",
      message: `${messagesNonLus} message(s) non lu(s)`,
      link: `/messagerie`, urgence: "basse", date: now,
    });
  }

  // Trier par urgence puis date
  const order = { haute: 0, moyenne: 1, basse: 2 };
  notifications.sort((a, b) => order[a.urgence] - order[b.urgence]);

  return { notifications, count: notifications.length };
}
