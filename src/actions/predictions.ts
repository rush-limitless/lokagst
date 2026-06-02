"use server";

import { prisma } from "@/lib/prisma";
import { requireGestionnaire } from "@/lib/auth-guard";
import { scorerLocataire, type ScorePrediction } from "@/lib/prediction-impayes";

export async function getPredictionsImpayes(): Promise<ScorePrediction[]> {
  await requireGestionnaire();

  const baux = await prisma.bail.findMany({
    where: { statut: "ACTIF" },
    include: {
      locataire: { select: { id: true, nom: true, prenom: true } },
      appartement: { select: { numero: true } },
      paiements: { where: { valide: true }, orderBy: { moisConcerne: "asc" } },
    },
  });

  return baux
    .map((b) => {
      const result = scorerLocataire({
        dateDebut: b.dateDebut,
        jourLimitePaiement: b.jourLimitePaiement,
        periodicite: b.periodicite,
        totalMensuel: b.totalMensuel,
        montantLoyer: b.montantLoyer,
        totalCharges: b.totalCharges,
        paiements: b.paiements.map((p) => ({
          montant: p.montant,
          datePaiement: p.datePaiement,
          moisConcerne: p.moisConcerne,
          montantCaution: p.montantCaution,
        })),
      });
      return {
        locataireId: b.locataire.id,
        nom: `${b.locataire.prenom} ${b.locataire.nom}`,
        appartement: b.appartement.numero,
        ...result,
      };
    })
    .sort((a, b) => b.score - a.score);
}
