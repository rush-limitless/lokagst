"use server";

import { prisma } from "@/lib/prisma";

export async function getSituationLocataire(locataireId: string) {
  const bail = await prisma.bail.findFirst({
    where: { locataireId, statut: "ACTIF" },
    include: { appartement: true, paiements: { orderBy: { moisConcerne: "desc" } }, penalites: { where: { payee: false } } },
  });

  if (!bail) return null;

  const now = new Date();
  

  // Caution
  const cautionStatus = bail.cautionPayee;

  // Loyer — vérifier les mois impayés
  let moisImpayes = 0;
  let montantLoyerDu = 0;
  for (let i = 0; i < 12; i++) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    if (m < bail.dateDebut) break;
    const p = bail.paiements.find((pay) => pay.moisConcerne.getTime() === m.getTime());
    if (!p || p.statut !== "PAYE") {
      moisImpayes++;
      montantLoyerDu += bail.montantLoyer - (p?.montant || 0);
    }
  }

  // Charges — rattachées au loyer, même logique
  const montantChargesDu = moisImpayes * bail.totalCharges;

  // Pénalités impayées
  const penalitesImpayees = bail.penalites.reduce((s, p) => s + p.montant, 0);

  return {
    bail,
    caution: { montant: bail.montantCaution, payee: cautionStatus },
    loyer: { aJour: moisImpayes === 0, moisImpayes, montantDu: montantLoyerDu },
    charges: { aJour: moisImpayes === 0, montantDu: montantChargesDu },
    penalites: { montant: penalitesImpayees, nombre: bail.penalites.length },
    totalDu: montantLoyerDu + montantChargesDu + penalitesImpayees + (cautionStatus ? 0 : bail.montantCaution),
  };
}
