"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const [appartements, bauxActifs, paiementsMois] = await Promise.all([
    prisma.appartement.groupBy({ by: ["statut"], _count: true }),
    prisma.bail.findMany({ where: { statut: "ACTIF" }, include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } }, paiements: true } }),
    prisma.paiement.findMany({ where: { moisConcerne: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
  ]);

  const total = appartements.reduce((s, a) => s + a._count, 0);
  const occupes = appartements.find((a) => a.statut === "OCCUPE")?._count || 0;

  const revenusMois = paiementsMois.reduce((s, p) => s + p.montant, 0);
  const revenusAttendus = bauxActifs.reduce((s, b) => s + b.montantLoyer, 0);

  const now = new Date();
  const dans30j = new Date();
  dans30j.setDate(dans30j.getDate() + 30);

  const bauxExpirants = bauxActifs
    .filter((b) => b.dateFin <= dans30j && b.dateFin >= now)
    .map((b) => ({ bailId: b.id, locataire: `${b.locataire.prenom} ${b.locataire.nom}`, appartement: b.appartement.numero, dateFin: b.dateFin, joursRestants: Math.ceil((b.dateFin.getTime() - now.getTime()) / 86400000) }));

  const moisCourant = new Date(now.getFullYear(), now.getMonth(), 1);
  const impayesLocataires = bauxActifs
    .filter((b) => !b.paiements.some((p) => p.moisConcerne.getTime() === moisCourant.getTime()))
    .map((b) => ({ locataireId: b.locataireId, nom: `${b.locataire.prenom} ${b.locataire.nom}`, montantDu: b.montantLoyer }));

  return {
    appartements: { total, occupes, libres: total - occupes, tauxOccupation: total > 0 ? Math.round((occupes / total) * 100) : 0 },
    finances: { revenusMois, impayesMois: revenusAttendus - revenusMois, revenusAttendus },
    alertes: { bauxExpirants, impayesLocataires },
  };
}

export async function getRevenusEvolution(mois: number = 6) {
  const result = [];
  const now = new Date();
  for (let i = mois - 1; i >= 0; i--) {
    const debut = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const fin = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const paiements = await prisma.paiement.findMany({ where: { moisConcerne: { gte: debut, lt: fin } } });
    const bauxActifs = await prisma.bail.count({ where: { statut: "ACTIF", dateDebut: { lte: fin }, dateFin: { gte: debut } } });
    result.push({
      mois: debut.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
      revenus: paiements.reduce((s, p) => s + p.montant, 0),
      attendus: bauxActifs * 50000, // approximation
    });
  }
  return result;
}
