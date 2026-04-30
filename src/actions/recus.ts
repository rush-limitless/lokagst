"use server";

import { prisma } from "@/lib/prisma";

export async function genererRecuData(paiementId: string) {
  const paiement = await prisma.paiement.findUnique({
    where: { id: paiementId },
    include: { bail: { include: { locataire: true, appartement: true } } },
  });
  if (!paiement) return null;

  return {
    id: paiement.id,
    locataire: `${paiement.bail.locataire.prenom} ${paiement.bail.locataire.nom}`,
    telephone: paiement.bail.locataire.telephone,
    appartement: paiement.bail.appartement.numero,
    etage: paiement.bail.appartement.etage,
    montant: paiement.montant,
    moisConcerne: paiement.moisConcerne.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    datePaiement: paiement.datePaiement.toLocaleDateString("fr-FR"),
    modePaiement: { VIREMENT_BANCAIRE: "Virement bancaire", MOBILE_MONEY: "Mobile Money", ESPECES: "Espèces" }[paiement.modePaiement],
    statut: paiement.statut === "PAYE" ? "Payé" : "Partiellement payé",
    resteDu: paiement.resteDu,
    loyerMensuel: paiement.bail.montantLoyer,
  };
}
