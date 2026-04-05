"use server";

import { prisma } from "@/lib/prisma";

export async function exportPaiementsCSV(dateDebut?: string, dateFin?: string) {
  const where: any = {};
  if (dateDebut) where.datePaiement = { ...where.datePaiement, gte: new Date(dateDebut) };
  if (dateFin) where.datePaiement = { ...where.datePaiement, lte: new Date(dateFin) };

  const paiements = await prisma.paiement.findMany({
    where,
    include: { bail: { include: { locataire: true, appartement: true } } },
    orderBy: { datePaiement: "desc" },
  });

  const header = "Date,Locataire,Appartement,Mois,Loyer,Charges,Montant Payé,Mode,Statut,Reste Dû\n";
  const rows = paiements.map((p) => {
    const mois = p.moisConcerne.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return `${p.datePaiement.toLocaleDateString("fr-FR")},${p.bail.locataire.prenom} ${p.bail.locataire.nom},${p.bail.appartement.numero},${mois},${p.bail.montantLoyer},${p.bail.totalCharges},${p.montant},${p.modePaiement},${p.statut},${p.resteDu}`;
  }).join("\n");

  return header + rows;
}

export async function getRapportMensuel(mois?: number, annee?: number) {
  const now = new Date();
  const m = mois ?? now.getMonth();
  const a = annee ?? now.getFullYear();
  const debut = new Date(a, m, 1);
  const fin = new Date(a, m + 1, 1);

  const [paiements, bauxActifs, penalites, appartements] = await Promise.all([
    prisma.paiement.findMany({ where: { moisConcerne: { gte: debut, lt: fin } }, include: { bail: { include: { locataire: true, appartement: true } } } }),
    prisma.bail.count({ where: { statut: "ACTIF", dateDebut: { lte: fin }, dateFin: { gte: debut } } }),
    prisma.penalite.findMany({ where: { moisConcerne: { gte: debut, lt: fin } } }),
    prisma.appartement.groupBy({ by: ["statut"], _count: true }),
  ]);

  const totalEncaisse = paiements.reduce((s, p) => s + p.montant, 0);
  const totalPenalites = penalites.reduce((s, p) => s + p.montant, 0);
  const total = appartements.reduce((s, a) => s + a._count, 0);
  const occupes = appartements.find((a) => a.statut === "OCCUPE")?._count || 0;

  return {
    periode: debut.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    totalEncaisse,
    totalPenalites,
    nombrePaiements: paiements.length,
    bauxActifs,
    tauxOccupation: total > 0 ? Math.round((occupes / total) * 100) : 0,
    appartements: { total, occupes, libres: total - occupes },
    paiements: paiements.map((p) => ({
      locataire: `${p.bail.locataire.prenom} ${p.bail.locataire.nom}`,
      appartement: p.bail.appartement.numero,
      montant: p.montant,
      mode: p.modePaiement,
      statut: p.statut,
    })),
  };
}
