"use server";

import { prisma } from "@/lib/prisma";

export async function getBilanImpayes() {
  const now = new Date();
  const bauxActifs = await prisma.bail.findMany({
    where: { statut: { in: ["ACTIF", "SUSPENDU"] } },
    include: { locataire: true, appartement: true, paiements: true, penalites: { where: { payee: false } } },
  });

  return bauxActifs.map((b) => {
    let moisImpayes = 0;
    let montantDu = 0;
    for (let i = 0; i < 12; i++) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      if (m < new Date(b.dateDebut)) break;
      const p = b.paiements.find((pay) => new Date(pay.moisConcerne).getMonth() === m.getMonth() && new Date(pay.moisConcerne).getFullYear() === m.getFullYear());
      if (!p || p.statut !== "PAYE") { moisImpayes++; montantDu += b.totalMensuel - (p?.montant || 0); }
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
  const baux = await prisma.bail.findMany({
    include: { locataire: true, appartement: true },
    orderBy: { appartement: { numero: "asc" } },
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
  const bauxActifs = await prisma.bail.findMany({
    where: { statut: { in: ["ACTIF", "SUSPENDU"] } },
    include: { appartement: true, paiements: true },
  });

  const now = new Date();
  const etages: Record<string, { attendu: number; regle: number }> = {};

  bauxActifs.forEach((b) => {
    const e = b.appartement.etage;
    if (!etages[e]) etages[e] = { attendu: 0, regle: 0 };
    const mois = Math.ceil((now.getTime() - new Date(b.dateDebut).getTime()) / (30.5 * 86400000));
    etages[e].attendu += b.totalMensuel * mois;
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
  const bauxActifs = await prisma.bail.findMany({
    where: { statut: { in: ["ACTIF", "SUSPENDU"] } },
    include: { locataire: true, appartement: true, paiements: true },
  });

  const now = new Date();
  return bauxActifs.map((b) => {
    const mois = Math.ceil((now.getTime() - new Date(b.dateDebut).getTime()) / (30.5 * 86400000));
    const attendu = b.totalMensuel * mois;
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
