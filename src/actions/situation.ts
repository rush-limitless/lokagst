"use server";

import { prisma } from "@/lib/prisma";
import { isMoisEcheance, PERIODICITE_MOIS } from "@/lib/utils";

export async function getSituationLocataire(locataireId: string) {
  const bail = await prisma.bail.findFirst({
    where: { locataireId, statut: "ACTIF" },
    include: { appartement: true, paiements: { orderBy: { moisConcerne: "desc" } }, penalites: { where: { payee: false } } },
  });

  if (!bail) return null;

  const now = new Date();
  const debut = new Date(bail.dateDebut);
  const freq = PERIODICITE_MOIS[bail.periodicite] || 1;
  const loyerParEcheance = bail.montantLoyer * freq;
  const chargesParEcheance = bail.totalCharges * freq;

  // Calculate total attendu up to current month
  let totalAttendu = 0;
  const d = new Date(debut.getFullYear(), debut.getMonth(), 1);
  while (d <= now) {
    if (isMoisEcheance(d, debut, bail.periodicite)) {
      totalAttendu += loyerParEcheance + chargesParEcheance;
    }
    d.setMonth(d.getMonth() + 1);
  }

  // Total réglé (all payments)
  const totalRegle = bail.paiements.reduce((s, p) => s + p.montant, 0);

  // Difference: positive = dû, negative = avance
  const difference = totalAttendu - totalRegle;

  // Count unpaid months for display
  let moisImpayes = 0;
  let montantLoyerDu = 0;
  let montantChargesDu = 0;
  const d2 = new Date(debut.getFullYear(), debut.getMonth(), 1);
  while (d2 <= now) {
    if (isMoisEcheance(d2, debut, bail.periodicite)) {
      const paiement = bail.paiements.find((p) => p.moisConcerne.getMonth() === d2.getMonth() && p.moisConcerne.getFullYear() === d2.getFullYear());
      const montantPaye = paiement?.montant || 0;
      if (montantPaye < loyerParEcheance) {
        moisImpayes++;
        montantLoyerDu += loyerParEcheance - Math.min(montantPaye, loyerParEcheance);
      }
      if (montantPaye < loyerParEcheance + chargesParEcheance && bail.totalCharges > 0) {
        montantChargesDu += chargesParEcheance - Math.max(0, montantPaye - loyerParEcheance);
      }
    }
    d2.setMonth(d2.getMonth() + 1);
  }

  const penalitesImpayees = bail.penalites.reduce((s, p) => s + p.montant, 0);

  // totalDu: positive = owes money, negative = has advance
  // Count advance: paiements for months AFTER current month
  const moisActuel = new Date(now.getFullYear(), now.getMonth(), 1);
  const paiementsAvance = bail.paiements.filter((p) => p.moisConcerne > moisActuel);
  const montantAvance = paiementsAvance.reduce((s, p) => s + p.montant, 0);

  const totalDu = difference > 0
    ? montantLoyerDu + montantChargesDu + penalitesImpayees + (bail.cautionPayee ? 0 : bail.montantCaution)
    : -montantAvance; // negative = advance (show as positive in UI)

  return {
    bail,
    caution: { montant: bail.montantCaution, payee: bail.cautionPayee },
    loyer: { aJour: moisImpayes === 0, moisImpayes, montantDu: montantLoyerDu },
    charges: { aJour: montantChargesDu === 0, montantDu: montantChargesDu },
    penalites: { montant: penalitesImpayees, nombre: bail.penalites.length },
    totalDu,
  };
}
