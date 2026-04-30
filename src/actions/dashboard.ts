"use server";

import { prisma } from "@/lib/prisma";
import { isMoisEcheance, PERIODICITE_MOIS } from "@/lib/utils";

export async function getDashboardStats() {
  const [appartements, bauxActifs, paiementsMois] = await Promise.all([
    prisma.appartement.groupBy({ by: ["statut"], _count: true }),
    prisma.bail.findMany({ where: { statut: "ACTIF" }, include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } }, paiements: true } }),
    prisma.paiement.findMany({ where: { moisConcerne: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1) } } }),
  ]);

  const total = appartements.reduce((s, a) => s + a._count, 0);
  const occupes = appartements.find((a) => a.statut === "OCCUPE")?._count || 0;

  const now = new Date();
  const revenusMois = paiementsMois.reduce((s, p) => s + p.montant, 0);
  // Revenus attendus : seulement les baux dont ce mois est un mois d'échéance, multiplié par la fréquence
  const moisCourantDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const bauxEcheance = bauxActifs.filter((b) => isMoisEcheance(moisCourantDate, b.dateDebut, b.periodicite));
  const revenusAttendus = bauxEcheance.reduce((s, b) => s + b.totalMensuel * (PERIODICITE_MOIS[b.periodicite] || 1), 0);
  const revenusLoyers = paiementsMois.reduce((s, p) => s + p.montantLoyer, 0);
  const revenusCharges = paiementsMois.reduce((s, p) => s + p.montantCharges, 0);
  const revenusCautions = paiementsMois.reduce((s, p) => s + p.montantCaution, 0);

  const loyersAttendus = bauxEcheance.reduce((s, b) => s + b.montantLoyer * (PERIODICITE_MOIS[b.periodicite] || 1), 0);
  const chargesAttendues = bauxEcheance.reduce((s, b) => s + b.totalCharges * (PERIODICITE_MOIS[b.periodicite] || 1), 0);
  const cautionsNonPayees = bauxActifs.filter((b) => !b.cautionPayee).reduce((s, b) => s + b.montantCaution, 0);

  const dans30j = new Date();
  dans30j.setDate(dans30j.getDate() + 30);

  const bauxExpirants = bauxActifs
    .filter((b) => b.dateFin <= dans30j && b.dateFin >= now)
    .map((b) => ({ bailId: b.id, locataire: `${b.locataire.prenom} ${b.locataire.nom}`, appartement: b.appartement.numero, dateFin: b.dateFin, joursRestants: Math.ceil((b.dateFin.getTime() - now.getTime()) / 86400000) }));

  const moisCourant = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Logique du fichier Excel du boss :
  // Impayés = Loyers attendus - Loyers effectivement payés (la différence)
  // Pas de condition sur le jour limite — on montre toujours la différence
  const impayesLocataires = bauxActifs
    .filter((b) => {
      if (!isMoisEcheance(moisCourant, b.dateDebut, b.periodicite)) return false;
      const freq = PERIODICITE_MOIS[b.periodicite] || 1;
      const attendu = b.totalMensuel * (freq > 0 ? freq : 1);
      // Trouver le paiement du mois courant
      const paiementMois = b.paiements.filter((p) => {
        const mc = new Date(p.moisConcerne);
        return mc.getMonth() === moisCourant.getMonth() && mc.getFullYear() === moisCourant.getFullYear();
      });
      const totalPaye = paiementMois.reduce((s, p) => s + p.montant, 0);
      return totalPaye < attendu;
    })
    .map((b) => {
      const freq = PERIODICITE_MOIS[b.periodicite] || 1;
      const loyerAttendu = b.montantLoyer * (freq > 0 ? freq : 1);
      const chargesAttendues = b.totalCharges * (freq > 0 ? freq : 1);
      // Calculer ce qui a été payé ce mois
      const paiementMois = b.paiements.filter((p) => {
        const mc = new Date(p.moisConcerne);
        return mc.getMonth() === moisCourant.getMonth() && mc.getFullYear() === moisCourant.getFullYear();
      });
      const loyerPaye = paiementMois.reduce((s, p) => s + p.montantLoyer, 0);
      const chargesPaye = paiementMois.reduce((s, p) => s + p.montantCharges, 0);
      return {
        locataireId: b.locataireId,
        nom: `${b.locataire.prenom} ${b.locataire.nom}`,
        montantDu: Math.max(0, (loyerAttendu + chargesAttendues) - (loyerPaye + chargesPaye)),
        loyerDu: Math.max(0, loyerAttendu - loyerPaye),
        chargesDu: Math.max(0, chargesAttendues - chargesPaye),
      };
    })
    .filter((l) => l.montantDu > 0)
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

  // Impayés = différence entre loyers attendus et loyers effectivement payés par locataire
  const impayesMois = impayesLocataires.reduce((s, l) => s + l.montantDu, 0);
  const impayesLoyers = impayesLocataires.reduce((s, l) => s + l.loyerDu, 0);
  const impayesCharges = impayesLocataires.reduce((s, l) => s + l.chargesDu, 0);

  const moisLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return {
    appartements: { total, occupes, libres: total - occupes, tauxOccupation: total > 0 ? Math.round((occupes / total) * 100) : 0 },
    finances: {
      revenusMois, revenusAttendus,
      revenusLoyers, revenusCharges, revenusCautions,
      loyersAttendus, chargesAttendues, cautionsNonPayees,
      impayesMois,
      impayesLoyers,
      impayesCharges,
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
      .reduce((s, b) => s + b.totalMensuel * (PERIODICITE_MOIS[b.periodicite] || 1), 0);

    result.push({ mois: moisLabel, revenus, attendus });
  }
  return result;
}
