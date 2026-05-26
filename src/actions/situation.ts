"use server";

import { prisma } from "@/lib/prisma";
import { isMoisEcheance, PERIODICITE_MOIS } from "@/lib/utils";

export async function getSituationLocataire(locataireId: string) {
  const bail = await prisma.bail.findFirst({
    where: { locataireId, statut: { in: ["ACTIF", "SUSPENDU"] } },
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
  // Pour les baux non-mensuels : sommer tous les paiements de la période d'échéance
  let moisImpayes = 0;
  let montantLoyerDu = 0;
  let montantChargesDu = 0;
  const d2 = new Date(debut.getFullYear(), debut.getMonth(), 1);
  while (d2 <= now) {
    if (isMoisEcheance(d2, debut, bail.periodicite)) {
      // Sommer tous les paiements de cette période d'échéance (d2 → d2+freq mois)
      const periodeDebut = new Date(d2);
      const periodeFin = new Date(d2.getFullYear(), d2.getMonth() + freq, 1);
      const montantPaye = bail.paiements
        .filter((p) => {
          const mc = new Date(p.moisConcerne);
          const moisP = new Date(mc.getFullYear(), mc.getMonth(), 1);
          return moisP >= periodeDebut && moisP < periodeFin;
        })
        .reduce((s, p) => s + p.montant - (p.montantCaution || 0), 0);

      if (montantPaye < loyerParEcheance) {
        moisImpayes++;
        montantLoyerDu += loyerParEcheance - Math.min(montantPaye, loyerParEcheance);
      }
      if (montantPaye < loyerParEcheance + chargesParEcheance && bail.totalCharges > 0) {
        const payePourCharges = montantPaye > loyerParEcheance ? montantPaye - loyerParEcheance : 0;
        montantChargesDu += chargesParEcheance - Math.min(payePourCharges, chargesParEcheance);
      }
    }
    d2.setMonth(d2.getMonth() + 1);
  }

  const penalitesImpayees = bail.penalites.reduce((s, p) => s + p.montant, 0);

  // totalDu: positive = owes money, negative = has advance
  // Count advance: paiements for months strictly after current month (compare by month/year)
  const paiementsAvance = bail.paiements.filter((p) => {
    const mc = new Date(p.moisConcerne);
    return mc.getFullYear() > now.getFullYear() ||
      (mc.getFullYear() === now.getFullYear() && mc.getMonth() > now.getMonth());
  });
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
