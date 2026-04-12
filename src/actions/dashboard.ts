"use server";

import { prisma } from "@/lib/prisma";
import { isMoisEcheance } from "@/lib/utils";

export async function getDashboardStats() {
  const [appartements, bauxActifs, paiementsMois] = await Promise.all([
    prisma.appartement.groupBy({ by: ["statut"], _count: true }),
    prisma.bail.findMany({ where: { statut: "ACTIF" }, include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } }, paiements: true } }),
    prisma.paiement.findMany({ where: { moisConcerne: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
  ]);

  const total = appartements.reduce((s, a) => s + a._count, 0);
  const occupes = appartements.find((a) => a.statut === "OCCUPE")?._count || 0;

  const now = new Date();
  const revenusMois = paiementsMois.reduce((s, p) => s + p.montant, 0);
  // Revenus attendus : seulement les baux dont ce mois est un mois d'échéance
  const moisCourantDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const revenusAttendus = bauxActifs.filter((b) => isMoisEcheance(moisCourantDate, b.dateDebut, b.periodicite)).reduce((s, b) => s + b.totalMensuel, 0);
  const revenusLoyers = paiementsMois.reduce((s, p) => s + p.montantLoyer, 0);
  const revenusCharges = paiementsMois.reduce((s, p) => s + p.montantCharges, 0);
  const revenusCautions = paiementsMois.reduce((s, p) => s + p.montantCaution, 0);

  const loyersAttendus = bauxActifs.filter((b) => isMoisEcheance(moisCourantDate, b.dateDebut, b.periodicite)).reduce((s, b) => s + b.montantLoyer, 0);
  const chargesAttendues = bauxActifs.filter((b) => isMoisEcheance(moisCourantDate, b.dateDebut, b.periodicite)).reduce((s, b) => s + b.totalCharges, 0);
  const cautionsNonPayees = bauxActifs.filter((b) => !b.cautionPayee).reduce((s, b) => s + b.montantCaution, 0);

  const dans30j = new Date();
  dans30j.setDate(dans30j.getDate() + 30);

  const bauxExpirants = bauxActifs
    .filter((b) => b.dateFin <= dans30j && b.dateFin >= now)
    .map((b) => ({ bailId: b.id, locataire: `${b.locataire.prenom} ${b.locataire.nom}`, appartement: b.appartement.numero, dateFin: b.dateFin, joursRestants: Math.ceil((b.dateFin.getTime() - now.getTime()) / 86400000) }));

  const moisCourant = new Date(now.getFullYear(), now.getMonth(), 1);
  const jourDuMois = now.getDate();
  const impayesLocataires = bauxActifs
    .filter((b) => {
      if (jourDuMois <= b.jourLimitePaiement) return false;
      if (!isMoisEcheance(moisCourant, b.dateDebut, b.periodicite)) return false;
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
  const now = new Date();
  const debut = new Date(now.getFullYear(), now.getMonth() - mois + 1, 1);
  const fin = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Single query instead of N+1
  const [paiements, baux] = await Promise.all([
    prisma.paiement.findMany({ where: { moisConcerne: { gte: debut, lt: fin } } }),
    prisma.bail.findMany({ where: { statut: { in: ["ACTIF", "SUSPENDU"] }, dateDebut: { lte: fin }, dateFin: { gte: debut } } }),
  ]);

  const result = [];
  for (let i = mois - 1; i >= 0; i--) {
    const mDebut = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mFin = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const moisLabel = mDebut.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

    const revenus = paiements
      .filter((p) => p.moisConcerne >= mDebut && p.moisConcerne < mFin)
      .reduce((s, p) => s + p.montant, 0);

    const attendus = baux
      .filter((b) => b.dateDebut <= mFin && b.dateFin >= mDebut && isMoisEcheance(mDebut, b.dateDebut, b.periodicite))
      .reduce((s, b) => s + b.totalMensuel, 0);

    result.push({ mois: moisLabel, revenus, attendus });
  }
  return result;
}
