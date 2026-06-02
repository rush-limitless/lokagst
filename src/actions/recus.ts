"use server";

import { prisma } from "@/lib/prisma";
import { requireGestionnaire } from "@/lib/auth-guard";

export async function genererRecuData(paiementId: string) {
  await requireGestionnaire();
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
    modePaiement: ({ VIREMENT_BANCAIRE: "Virement bancaire", MOBILE_MONEY: "Mobile money", ESPECES: "Espèces" } as Record<string, string>)[paiement.modePaiement],
    statut: paiement.statut === "PAYE" ? "Payé" : "Partiellement payé",
    resteDu: paiement.resteDu,
    loyerMensuel: paiement.bail.montantLoyer,
  };
}
