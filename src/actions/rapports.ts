"use server";

import { prisma } from "@/lib/prisma";
import { requireGestionnaire } from "@/lib/auth-guard";
import { isMoisEcheance, nbEcheancesEntre, PERIODICITE_MOIS } from "@/lib/utils";

export async function getBilanImpayes() {
  await requireGestionnaire();
  const now = new Date();
  const bauxActifs = await prisma.bail.findMany({
    where: { statut: { in: ["ACTIF", "SUSPENDU"] } },
    include: { locataire: true, appartement: true, paiements: true, penalites: { where: { payee: false } } },
  });

  return bauxActifs.map((b) => {
    const freq = PERIODICITE_MOIS[b.periodicite] || 1;
    let moisImpayes = 0;
    let montantDu = 0;
    for (let i = 0; i < 12; i++) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      if (m < new Date(b.dateDebut)) break;
      if (!isMoisEcheance(m, b.dateDebut, b.periodicite)) continue;
      const montantPaye = b.paiements
        .filter((pay) => new Date(pay.moisConcerne).getMonth() === m.getMonth() && new Date(pay.moisConcerne).getFullYear() === m.getFullYear())
        .reduce((s, p) => s + p.montant, 0);
      const attenduPeriode = b.totalMensuel * freq;
      if (montantPaye < attenduPeriode) { moisImpayes++; montantDu += attenduPeriode - montantPaye; }
    }
    const penalites = b.penalites.reduce((s, p) => s + p.montant, 0);
    return {
      locataire: `${b.locataire.prenom} ${b.locataire.nom}`,
      logement: b.appartement.numero,
      etage: b.appartement.etage,
      loyerMensuel: b.montantLoyer,
      totalMensuel: b.totalMensuel,
      moisImpayes,
      montantDu,
      penalites,
      totalDu: montantDu + penalites,
      statut: b.statut,
    };
  }).filter((r) => r.moisImpayes > 0).sort((a, b) => b.totalDu - a.totalDu);
}

export async function getRapportCautions() {
  await requireGestionnaire();
  const baux = await prisma.bail.findMany({
    include: { locataire: true, appartement: { include: { immeuble: true } } },
    orderBy: [{ appartement: { immeuble: { nom: "asc" } } }, { appartement: { etage: "asc" } }, { appartement: { numero: "asc" } }],
  });

  const actifs = baux.filter((b) => b.statut === "ACTIF" || b.statut === "SUSPENDU");
  const anciens = baux.filter((b) => b.statut !== "ACTIF" && b.statut !== "SUSPENDU");

  return {
    actifs: actifs.map((b) => ({
      locataire: `${b.locataire.prenom} ${b.locataire.nom}`,
      logement: b.appartement.numero,
      caution: b.montantCaution,
      payee: b.cautionPayee,
      statut: b.statut,
    })),
    anciens: anciens.map((b) => ({
      locataire: `${b.locataire.prenom} ${b.locataire.nom}`,
      logement: b.appartement.numero,
      caution: b.montantCaution,
      statut: b.statut,
    })),
    totalCautionsActives: actifs.reduce((s, b) => s + b.montantCaution, 0),
    totalPayees: actifs.filter((b) => b.cautionPayee).reduce((s, b) => s + b.montantCaution, 0),
    totalNonPayees: actifs.filter((b) => !b.cautionPayee).reduce((s, b) => s + b.montantCaution, 0),
  };
}

export async function getRecouvrementParEtage() {
  await requireGestionnaire();
  const bauxActifs = await prisma.bail.findMany({
    where: { statut: { in: ["ACTIF", "SUSPENDU"] } },
    include: { appartement: true, paiements: true },
  });

  const now = new Date();
  const etages: Record<string, { attendu: number; regle: number }> = {};

  bauxActifs.forEach((b) => {
    const e = b.appartement.etage;
    if (!etages[e]) etages[e] = { attendu: 0, regle: 0 };
    const freq = PERIODICITE_MOIS[b.periodicite] || 1;
    const echeances = nbEcheancesEntre(new Date(b.dateDebut), now, new Date(b.dateDebut), b.periodicite);
    etages[e].attendu += b.totalMensuel * freq * echeances;
    etages[e].regle += b.paiements.reduce((s, p) => s + p.montant, 0);
  });

  return Object.entries(etages).map(([etage, data]) => ({
    etage,
    attendu: data.attendu,
    regle: data.regle,
    taux: data.attendu > 0 ? Math.round(data.regle / data.attendu * 100) : 0,
  })).sort((a, b) => {
    const order = ["RDC", "PREMIER", "DEUXIEME", "TROISIEME", "QUATRIEME"];
    return order.indexOf(a.etage) - order.indexOf(b.etage);
  });
}

export async function getTopPayeurs() {
  await requireGestionnaire();
  const bauxActifs = await prisma.bail.findMany({
    where: { statut: { in: ["ACTIF", "SUSPENDU"] } },
    include: { locataire: true, appartement: true, paiements: true },
  });

  const now = new Date();
  return bauxActifs.map((b) => {
    const freq = PERIODICITE_MOIS[b.periodicite] || 1;
    const echeances = nbEcheancesEntre(new Date(b.dateDebut), now, new Date(b.dateDebut), b.periodicite);
    const attendu = b.totalMensuel * freq * echeances;
    const regle = b.paiements.reduce((s, p) => s + p.montant, 0);
    return {
      locataire: `${b.locataire.prenom} ${b.locataire.nom}`,
      logement: b.appartement.numero,
      attendu,
      regle,
      taux: attendu > 0 ? Math.round(regle / attendu * 100) : 0,
    };
  }).sort((a, b) => b.taux - a.taux);
}

export async function getRentabiliteParAppartement() {
  await requireGestionnaire();
  const baux = await prisma.bail.findMany({
    where: { statut: { in: ["ACTIF", "SUSPENDU"] } },
    include: { appartement: true, paiements: true, locataire: true },
  });

  const now = new Date();
  return baux.map((b) => {
    const freq = PERIODICITE_MOIS[b.periodicite] || 1;
    const echeances = nbEcheancesEntre(new Date(b.dateDebut), now, new Date(b.dateDebut), b.periodicite);
    const mois = Math.max(1, Math.ceil((now.getTime() - new Date(b.dateDebut).getTime()) / (30.5 * 86400000)));
    const attendu = b.totalMensuel * freq * echeances;
    const regle = b.paiements.reduce((s, p) => s + p.montant, 0);
    const rentabilite = attendu > 0 ? Math.round(regle / attendu * 100) : 0;
    return {
      logement: b.appartement.numero,
      etage: b.appartement.etage,
      locataire: `${b.locataire.prenom} ${b.locataire.nom}`,
      loyerMensuel: b.montantLoyer,
      totalMensuel: b.totalMensuel,
      moisOccupation: mois,
      attendu,
      regle,
      difference: regle - attendu,
      rentabilite,
    };
  }).sort((a, b) => b.rentabilite - a.rentabilite);
}

export async function getRevenusVsImpayes(moisCount: number = 12) {
  await requireGestionnaire();
  const now = new Date();
  const debut = new Date(now.getFullYear(), now.getMonth() - moisCount + 1, 1);
  const fin = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [paiements, bauxActifs] = await Promise.all([
    prisma.paiement.findMany({ where: { moisConcerne: { gte: debut, lt: fin } } }),
    prisma.bail.findMany({ where: { statut: { in: ["ACTIF", "SUSPENDU"] }, dateDebut: { lt: fin }, dateFin: { gte: debut } } }),
  ]);

  const result = [];
  for (let i = moisCount - 1; i >= 0; i--) {
    const mDebut = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mFin = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const moisLabel = mDebut.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });

    const revenus = paiements
      .filter((p) => { const mc = new Date(p.moisConcerne); return mc >= mDebut && mc < mFin; })
      .reduce((s, p) => s + p.montant, 0);

    const attendu = bauxActifs
      .filter((b) => new Date(b.dateDebut) <= mFin && new Date(b.dateFin) >= mDebut && isMoisEcheance(mDebut, b.dateDebut, b.periodicite))
      .reduce((s, b) => s + b.totalMensuel * (PERIODICITE_MOIS[b.periodicite] || 1), 0);

    const impayes = Math.max(0, attendu - revenus);
    result.push({ mois: moisLabel, revenus, impayes, attendu });
  }
  return result;
}

export async function getComparaisonPeriodes(debut1: string, fin1: string, debut2: string, fin2: string) {
  await requireGestionnaire();
  async function getPeriodeData(debut: string, fin: string) {
    const d = new Date(debut);
    const f = new Date(fin);
    const paiements = await prisma.paiement.findMany({ where: { datePaiement: { gte: d, lte: f } } });
    const totalRegle = paiements.reduce((s, p) => s + p.montant, 0);
    const nbPaiements = paiements.length;
    const penalites = await prisma.penalite.findMany({ where: { appliqueLe: { gte: d, lte: f } } });
    const totalPenalites = penalites.reduce((s, p) => s + p.montant, 0);
    return { totalRegle, nbPaiements, totalPenalites };
  }

  const p1 = await getPeriodeData(debut1, fin1);
  const p2 = await getPeriodeData(debut2, fin2);

  return {
    periode1: { label: `${new Date(debut1).toLocaleDateString("fr-FR")} → ${new Date(fin1).toLocaleDateString("fr-FR")}`, ...p1 },
    periode2: { label: `${new Date(debut2).toLocaleDateString("fr-FR")} → ${new Date(fin2).toLocaleDateString("fr-FR")}`, ...p2 },
    variation: {
      regle: p1.totalRegle > 0 ? Math.round((p2.totalRegle - p1.totalRegle) / p1.totalRegle * 100) : 0,
      paiements: p1.nbPaiements > 0 ? Math.round((p2.nbPaiements - p1.nbPaiements) / p1.nbPaiements * 100) : 0,
    },
  };
}
