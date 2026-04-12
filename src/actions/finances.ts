"use server";

import { prisma } from "@/lib/prisma";

export async function getFinancesStats(annee?: number) {
  const year = annee || new Date().getFullYear();
  const debut = new Date(year, 0, 1);
  const fin = new Date(year + 1, 0, 1);

  const [paiements, baux, allBaux, depenses] = await Promise.all([
    prisma.paiement.findMany({ where: { moisConcerne: { gte: debut, lt: fin } }, include: { bail: { include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } } } } } }),
    prisma.bail.findMany({ where: { statut: { in: ["ACTIF", "SUSPENDU"] } }, include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true, immeubleId: true } } } }),
    prisma.bail.findMany({ where: { dateDebut: { lte: fin }, dateFin: { gte: debut } }, include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true, immeubleId: true } } } }),
    prisma.depense.findMany({ where: { date: { gte: debut, lt: fin } } }),
  ]);

  // Totaux annuels
  const totalLoyers = paiements.reduce((s, p) => s + p.montantLoyer, 0);
  const totalCharges = paiements.reduce((s, p) => s + p.montantCharges, 0);
  const totalCautions = paiements.reduce((s, p) => s + p.montantCaution, 0);
  const totalAutres = paiements.reduce((s, p) => s + p.montantAutres, 0);
  const totalEncaisse = paiements.reduce((s, p) => s + p.montant, 0);

  // Attendus annuels (mois par mois pour chaque bail actif sur la période)
  let totalLoyersAttendus = 0;
  let totalChargesAttendues = 0;
  for (const b of allBaux) {
    const bDebut = new Date(Math.max(b.dateDebut.getTime(), debut.getTime()));
    const bFin = new Date(Math.min(b.dateFin.getTime(), fin.getTime()));
    const mois = Math.max(0, Math.ceil((bFin.getTime() - bDebut.getTime()) / (30.5 * 86400000)));
    totalLoyersAttendus += b.montantLoyer * mois;
    totalChargesAttendues += b.totalCharges * mois;
  }
  const totalAttendu = totalLoyersAttendus + totalChargesAttendues;

  // Détail par mois
  const parMois = Array.from({ length: 12 }, (_, i) => {
    const mDebut = new Date(year, i, 1);
    const mFin = new Date(year, i + 1, 1);
    const moisLabel = mDebut.toLocaleDateString("fr-FR", { month: "short" });
    const mp = paiements.filter((p) => p.moisConcerne >= mDebut && p.moisConcerne < mFin);
    const loyers = mp.reduce((s, p) => s + p.montantLoyer, 0);
    const charges = mp.reduce((s, p) => s + p.montantCharges, 0);
    const cautions = mp.reduce((s, p) => s + p.montantCaution, 0);
    const total = mp.reduce((s, p) => s + p.montant, 0);

    const attendu = allBaux.filter((b) => b.dateDebut <= mFin && b.dateFin >= mDebut).reduce((s, b) => s + b.totalMensuel, 0);

    return { mois: moisLabel, loyers, charges, cautions, total, attendu, impaye: Math.max(0, attendu - total) };
  });

  // Top impayés par locataire
  const now = new Date();
  const impayesParLocataire = baux.map((b) => {
    const bp = paiements.filter((p) => p.bailId === b.id);
    const moisDepuis = Math.max(0, Math.ceil((Math.min(now.getTime(), fin.getTime()) - Math.max(b.dateDebut.getTime(), debut.getTime())) / (30.5 * 86400000)));
    const attendu = b.totalMensuel * moisDepuis;
    const paye = bp.reduce((s, p) => s + p.montant, 0);
    const du = Math.max(0, attendu - paye);
    return { locataire: `${b.locataire.prenom} ${b.locataire.nom}`, appartement: b.appartement.numero, attendu, paye, du, taux: attendu > 0 ? Math.round((paye / attendu) * 100) : 100 };
  }).filter((l) => l.du > 0).sort((a, b) => b.du - a.du);

  // Répartition par mode de paiement
  const parMode = paiements.reduce((acc, p) => {
    acc[p.modePaiement] = (acc[p.modePaiement] || 0) + p.montant;
    return acc;
  }, {} as Record<string, number>);

  const totalDepenses = depenses.reduce((s, d) => s + d.montant, 0);

  return {
    annee: year,
    totaux: { totalEncaisse, totalAttendu, totalLoyers, totalCharges, totalCautions, totalAutres, totalLoyersAttendus, totalChargesAttendues, totalDepenses, resultatNet: totalEncaisse - totalDepenses, tauxRecouvrement: totalAttendu > 0 ? Math.round((totalEncaisse / totalAttendu) * 100) : 100 },
    parMois,
    impayesParLocataire,
    parMode,
    nbBauxActifs: baux.length,
    revenuMensuelAttendu: baux.reduce((s, b) => s + b.totalMensuel, 0),
  };
}
