"use server";

import { prisma } from "@/lib/prisma";

export async function genererQuittanceData(paiementId: string) {
  const paiement = await prisma.paiement.findUnique({
    where: { id: paiementId },
    include: { bail: { include: { locataire: true, appartement: true } } },
  });
  if (!paiement || paiement.statut !== "PAYE") return null;

  const charges = (paiement.bail.chargesLocatives as { type: string; montant: number }[]) || [];

  return {
    numero: `Q-${paiement.id.slice(-8).toUpperCase()}`,
    locataire: `${paiement.bail.locataire.prenom} ${paiement.bail.locataire.nom}`,
    adresse: `Appartement ${paiement.bail.appartement.numero}, ${paiement.bail.appartement.etage}`,
    periode: paiement.moisConcerne.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    loyer: paiement.bail.montantLoyer,
    charges,
    totalCharges: paiement.bail.totalCharges,
    totalPaye: paiement.montant,
    datePaiement: paiement.datePaiement.toLocaleDateString("fr-FR"),
    dateEmission: new Date().toLocaleDateString("fr-FR"),
  };
}
