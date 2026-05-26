"use server";

import { prisma } from "@/lib/prisma";
import { isMoisEcheance, PERIODICITE_MOIS } from "@/lib/utils";

export async function getSituationLocataire(locataireId: string) {
  // Bail actif pour les infos de référence (loyer, charges, périodicité, appartement)
  const bail = await prisma.bail.findFirst({
    where: { locataireId, statut: { in: ["ACTIF", "SUSPENDU"] } },
    include: { appartement: true, paiements: { orderBy: { moisConcerne: "desc" } }, penalites: { where: { payee: false } } },
  });

  if (!bail) return null;

  const now = new Date();

  // Récupérer TOUS les baux du locataire pour agréger tous les paiements
  const tousBaux = await prisma.bail.findMany({
    where: { locataireId },
    include: { paiements: true },
    orderBy: { dateDebut: "asc" },
  });

  // Calculer totalAttendu et totalRegle sur TOUS les baux
  let totalAttendu = 0;
  let totalRegle = 0;

  for (const b of tousBaux) {
    const bDebut = new Date(b.dateDebut);
    const bFreq = PERIODICITE_MOIS[b.periodicite] || 1;
    if (bFreq === 0) continue; // JOURNALIER / NON_APPLICABLE
    const bEcheance = (b.montantLoyer + b.totalCharges) * bFreq;

    // Fin de la période à considérer : min(dateFin du bail, maintenant)
    const bFinBrute = new Date(b.dateFin);
    const bFin = bFinBrute < now ? bFinBrute : now;

    const d = new Date(bDebut.getFullYear(), bDebut.getMonth(), 1);
    const fin = new Date(bFin.getFullYear(), bFin.getMonth(), 1);
    while (d <= fin) {
      if (isMoisEcheance(d, bDebut, b.periodicite)) totalAttendu += bEcheance;
      d.setMonth(d.getMonth() + 1);
    }

    // Paiements de ce bail (hors caution)
    totalRegle += b.paiements.reduce((s, p) => s + p.montant - (p.montantCaution || 0), 0);
  }

  // Nombre de mois impayés : on compte les échéances non couvertes sur le bail actif
  // en tenant compte du solde global (si avance sur anciens baux, elle couvre les nouvelles échéances)
  const freq = PERIODICITE_MOIS[bail.periodicite] || 1;
  const loyerParEcheance = bail.montantLoyer * freq;
  const chargesParEcheance = bail.totalCharges * freq;
  const debut = new Date(bail.dateDebut);

  let moisImpayes = 0;
  let montantLoyerDu = 0;
  let montantChargesDu = 0;

  // Recalculer en parcourant uniquement le bail actif, en déduisant le solde reporté
  let soldeReporte = 0;
  {
    let attAnc = 0, reglAnc = 0;
    for (const b of tousBaux) {
      if (b.id === bail.id) break;
      const bDebut = new Date(b.dateDebut);
      const bFreq = PERIODICITE_MOIS[b.periodicite] || 1;
      if (bFreq === 0) continue;
      const bEcheance = (b.montantLoyer + b.totalCharges) * bFreq;
      const bFin = new Date(b.dateFin);
      const d = new Date(bDebut.getFullYear(), bDebut.getMonth(), 1);
      const fin = new Date(bFin.getFullYear(), bFin.getMonth(), 1);
      while (d <= fin) {
        if (isMoisEcheance(d, bDebut, b.periodicite)) attAnc += bEcheance;
        d.setMonth(d.getMonth() + 1);
      }
      reglAnc += b.paiements.reduce((s, p) => s + p.montant - (p.montantCaution || 0), 0);
    }
    soldeReporte = reglAnc - attAnc; // positif = avance reportée sur bail actif
  }

  const d2 = new Date(debut.getFullYear(), debut.getMonth(), 1);
  let soldeDisponible = soldeReporte; // avance des anciens baux disponible pour couvrir le bail actif

  while (d2 <= now) {
    if (isMoisEcheance(d2, debut, bail.periodicite)) {
      const periodeDebut = new Date(d2);
      const periodeFin = new Date(d2.getFullYear(), d2.getMonth() + freq, 1);
      const montantPayeBail = bail.paiements
        .filter((p) => {
          const mc = new Date(p.moisConcerne);
          const moisP = new Date(mc.getFullYear(), mc.getMonth(), 1);
          return moisP >= periodeDebut && moisP < periodeFin;
        })
        .reduce((s, p) => s + p.montant - (p.montantCaution || 0), 0);

      const montantPayeEffectif = montantPayeBail + Math.max(0, soldeDisponible);
      soldeDisponible = Math.max(0, soldeDisponible - Math.max(0, loyerParEcheance + chargesParEcheance - montantPayeBail));

      if (montantPayeEffectif < loyerParEcheance) {
        moisImpayes++;
        montantLoyerDu += loyerParEcheance - Math.min(montantPayeEffectif, loyerParEcheance);
      }
      if (montantPayeEffectif < loyerParEcheance + chargesParEcheance && bail.totalCharges > 0) {
        const payePourCharges = montantPayeEffectif > loyerParEcheance ? montantPayeEffectif - loyerParEcheance : 0;
        montantChargesDu += chargesParEcheance - Math.min(payePourCharges, chargesParEcheance);
      }
    }
    d2.setMonth(d2.getMonth() + 1);
  }

  const penalitesImpayees = bail.penalites.reduce((s, p) => s + p.montant, 0);
  const difference = totalAttendu - totalRegle;
  const totalDu = Math.max(0, difference) + penalitesImpayees + (bail.cautionPayee ? 0 : bail.montantCaution);

  return {
    bail,
    caution: { montant: bail.montantCaution, payee: bail.cautionPayee },
    loyer: { aJour: moisImpayes === 0, moisImpayes, montantDu: montantLoyerDu },
    charges: { aJour: montantChargesDu === 0, montantDu: montantChargesDu },
    penalites: { montant: penalitesImpayees, nombre: bail.penalites.length },
    totalDu,
  };
}
