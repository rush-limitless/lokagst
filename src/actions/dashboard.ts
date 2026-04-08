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
  const revenusAttendus = bauxActifs.reduce((s, b) => s + b.totalMensuel, 0);
  const revenusLoyers = paiementsMois.reduce((s, p) => s + p.montantLoyer, 0);
  const revenusCharges = paiementsMois.reduce((s, p) => s + p.montantCharges, 0);
  const revenusCautions = paiementsMois.reduce((s, p) => s + p.montantCaution, 0);

  const loyersAttendus = bauxActifs.reduce((s, b) => s + b.montantLoyer, 0);
  const chargesAttendues = bauxActifs.reduce((s, b) => s + b.totalCharges, 0);
  const cautionsNonPayees = bauxActifs.filter((b) => !b.cautionPayee).reduce((s, b) => s + b.montantCaution, 0);

  const now = new Date();
  const dans30j = new Date();
  dans30j.setDate(dans30j.getDate() + 30);

  const bauxExpirants = bauxActifs
    .filter((b) => b.dateFin <= dans30j && b.dateFin >= now)
    .map((b) => ({ bailId: b.id, locataire: `${b.locataire.prenom} ${b.locataire.nom}`, appartement: b.appartement.numero, dateFin: b.dateFin, joursRestants: Math.ceil((b.dateFin.getTime() - now.getTime()) / 86400000) }));

  const moisCourant = new Date(now.getFullYear(), now.getMonth(), 1);
  const jourDuMois = now.getDate();
  const impayesLocataires = bauxActifs
    .filter((b) => {
      // Ne considérer comme impayé que si le jour limite est dépassé
      if (jourDuMois <= b.jourLimitePaiement) return false;
      return !b.paiements.some((p) => p.moisConcerne.getTime() === moisCourant.getTime() && p.statut === "PAYE");
    })
    .map((b) => ({ locataireId: b.locataireId, nom: `${b.locataire.prenom} ${b.locataire.nom}`, montantDu: b.totalMensuel || b.montantLoyer }));

  const moisLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return {
    appartements: { total, occupes, libres: total - occupes, tauxOccupation: total > 0 ? Math.round((occupes / total) * 100) : 0 },
    finances: {
      revenusMois, revenusAttendus,
      revenusLoyers, revenusCharges, revenusCautions,
      loyersAttendus, chargesAttendues, cautionsNonPayees,
      impayesMois: jourDuMois > 5 ? Math.max(0, revenusAttendus - revenusMois) : 0,
      impayesLoyers: jourDuMois > 5 ? Math.max(0, loyersAttendus - revenusLoyers) : 0,
      impayesCharges: jourDuMois > 5 ? Math.max(0, chargesAttendues - revenusCharges) : 0,
      periode: moisLabel,
    },
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
    const bauxActifs = await prisma.bail.findMany({ where: { statut: { in: ["ACTIF", "SUSPENDU"] }, dateDebut: { lte: fin }, dateFin: { gte: debut } } });
    const attendus = bauxActifs.reduce((s, b) => s + b.totalMensuel, 0);
    result.push({
      mois: debut.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
      revenus: paiements.reduce((s, p) => s + p.montant, 0),
      attendus,
    });
  }
  return result;
}
