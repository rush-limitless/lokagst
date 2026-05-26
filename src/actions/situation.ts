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
  const freq = PERIODICITE_MOIS[bail.periodicite] || 1;
  const debut = new Date(bail.dateDebut);

  // Tous les baux du locataire pour agréger les paiements
  const tousBaux = await prisma.bail.findMany({
    where: { locataireId },
    include: { paiements: true },
    orderBy: { dateDebut: "asc" },
  });

  // Total attendu sur le bail actif uniquement (depuis son début jusqu'à maintenant)
  let totalAttendu = 0;
  const d = new Date(debut.getFullYear(), debut.getMonth(), 1);
  while (d <= now) {
    if (isMoisEcheance(d, debut, bail.periodicite)) {
      totalAttendu += (bail.montantLoyer + bail.totalCharges) * freq;
    }
    d.setMonth(d.getMonth() + 1);
  }

  // Total réglé = TOUS les paiements de TOUS les baux (hors caution)
  const totalRegle = tousBaux
    .flatMap((b) => b.paiements)
    .reduce((s, p) => s + p.montant - (p.montantCaution || 0), 0);

  const penalitesImpayees = bail.penalites.reduce((s, p) => s + p.montant, 0);
  const difference = totalAttendu - totalRegle;
  const totalDu = Math.max(0, difference) + penalitesImpayees + (bail.cautionPayee ? 0 : bail.montantCaution);

  // moisImpayes : nombre de mois de dette / totalMensuel du bail actif
  const detteLoyer = Math.max(0, difference);
  const moisImpayes = bail.totalMensuel > 0 ? Math.round(detteLoyer / bail.totalMensuel) : 0;
  const ratioLoyer = bail.totalMensuel > 0 ? bail.montantLoyer / bail.totalMensuel : 1;
  const montantLoyerDu = Math.round(detteLoyer * ratioLoyer);
  const montantChargesDu = detteLoyer - montantLoyerDu;

  return {
    bail,
    caution: { montant: bail.montantCaution, payee: bail.cautionPayee },
    loyer: { aJour: moisImpayes === 0, moisImpayes, montantDu: montantLoyerDu },
    charges: { aJour: montantChargesDu === 0, montantDu: montantChargesDu },
    penalites: { montant: penalitesImpayees, nombre: bail.penalites.length },
    totalDu,
  };
}
