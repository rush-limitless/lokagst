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

  let moisImpayes = 0;
  let montantLoyerDu = 0;
  let montantChargesDu = 0;

  const d = new Date(debut.getFullYear(), debut.getMonth(), 1);
  while (d <= now) {
    if (isMoisEcheance(d, debut, bail.periodicite)) {
      const paiement = bail.paiements.find((p) => p.moisConcerne.getMonth() === d.getMonth() && p.moisConcerne.getFullYear() === d.getFullYear());
      const montantPaye = paiement?.montant || 0;
      const loyerAttendu = bail.montantLoyer * freq;
      const chargesAttendues = bail.totalCharges * freq;

      if (montantPaye < loyerAttendu) {
        moisImpayes++;
        montantLoyerDu += loyerAttendu - Math.min(montantPaye, loyerAttendu);
      }
      if (montantPaye < loyerAttendu + chargesAttendues && bail.totalCharges > 0) {
        montantChargesDu += chargesAttendues - Math.max(0, montantPaye - loyerAttendu);
      }
    }
    d.setMonth(d.getMonth() + 1);
  }

  const penalitesImpayees = bail.penalites.reduce((s, p) => s + p.montant, 0);

  return {
    bail,
    caution: { montant: bail.montantCaution, payee: bail.cautionPayee },
    loyer: { aJour: moisImpayes === 0, moisImpayes, montantDu: montantLoyerDu },
    charges: { aJour: montantChargesDu === 0, montantDu: montantChargesDu },
    penalites: { montant: penalitesImpayees, nombre: bail.penalites.length },
    totalDu: montantLoyerDu + montantChargesDu + penalitesImpayees + (bail.cautionPayee ? 0 : bail.montantCaution),
  };
}
