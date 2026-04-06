"use server";

import { prisma } from "@/lib/prisma";

export async function getEcheancesMois(annee: number, mois: number) {
  const debut = new Date(annee, mois, 1);
  const fin = new Date(annee, mois + 1, 0);

  const baux = await prisma.bail.findMany({
    where: { statut: "ACTIF" },
    include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } }, paiements: { where: { moisConcerne: { gte: debut, lte: fin } } } },
  });

  return baux.map((b) => {
    const paiement = b.paiements[0];
    const jourLimite = b.jourLimitePaiement;
    return {
      id: b.id,
      locataire: `${b.locataire.prenom} ${b.locataire.nom}`,
      appartement: b.appartement.numero,
      montant: b.totalMensuel,
      jourLimite,
      paye: paiement?.statut === "PAYE",
      partiel: paiement?.statut === "PARTIELLEMENT_PAYE",
      montantPaye: paiement?.montant || 0,
    };
  });
}
