"use server";

import { prisma } from "@/lib/prisma";
import { ETAGE_LABELS, PERIODICITE_LABELS } from "@/lib/utils";

export async function genererContratData(bailId: string) {
  const bail = await prisma.bail.findUnique({
    where: { id: bailId },
    include: { locataire: true, appartement: true },
  });
  if (!bail) return null;

  const charges = (bail.chargesLocatives as { type: string; montant: number }[]) || [];

  return {
    numero: `BAIL-${bail.id.slice(-8).toUpperCase()}`,
    date: new Date().toLocaleDateString("fr-FR"),
    // Bailleur
    bailleur: "IMMOSTAR SCI",
    adresseBailleur: "Yaoundé, Nkolfoulou",
    // Locataire
    locataire: `${bail.locataire.prenom} ${bail.locataire.nom}`,
    telephone: bail.locataire.telephone,
    email: bail.locataire.email || "—",
    cni: bail.locataire.numeroCNI || "—",
    // Logement
    appartement: bail.appartement.numero,
    etage: ETAGE_LABELS[bail.appartement.etage],
    type: bail.appartement.type,
    // Durée
    dateDebut: bail.dateDebut.toLocaleDateString("fr-FR"),
    dateFin: new Date(bail.dateFin.getTime() - 86400000).toLocaleDateString("fr-FR"),
    dureeMois: bail.dureeMois,
    periodicite: PERIODICITE_LABELS[bail.periodicite] || "Mensuel",
    // Finances
    loyer: bail.montantLoyer,
    caution: bail.montantCaution,
    charges,
    totalCharges: bail.totalCharges,
    totalMensuel: bail.totalMensuel,
    // Modalités
    jourLimite: bail.jourLimitePaiement,
    delaiGrace: bail.delaiGrace,
    penaliteType: bail.penaliteType,
    penaliteMontant: bail.penaliteMontant,
    penaliteRecurrente: bail.penaliteRecurrente,
    // Renouvellement
    renouvellementAuto: bail.renouvellementAuto,
    dureeRenouvellement: bail.dureeRenouvellement,
    augmentationLoyer: bail.augmentationLoyer,
    preavisResiliation: bail.preavisResiliation,
    // Clauses
    clauses: bail.clausesParticulieres || null,
    // Signatures
    signatureLocataire: bail.signatureLocataire,
    dateSignature: bail.dateSignature?.toLocaleDateString("fr-FR"),
  };
}
