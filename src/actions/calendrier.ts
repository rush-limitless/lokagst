"use server";

import { prisma } from "@/lib/prisma";
import { requireGestionnaire } from "@/lib/auth-guard";
import { isMoisEcheance, PERIODICITE_MOIS } from "@/lib/utils";

export async function getEcheancesMois(annee: number, mois: number) {
  await requireGestionnaire();
  const moisDate = new Date(annee, mois, 1);
  const freq12 = new Date(annee, mois - 12, 1);

  const baux = await prisma.bail.findMany({
    where: { statut: "ACTIF" },
    include: { locataire: { select: { nom: true, prenom: true } }, appartement: { select: { numero: true } }, paiements: { where: { moisConcerne: { gte: freq12 } } } },
  });

  return baux
    .filter((b) => isMoisEcheance(moisDate, b.dateDebut, b.periodicite))
    .map((b) => {
      const freq = PERIODICITE_MOIS[b.periodicite] || 1;
      const attendu = b.totalMensuel * freq;
      // Sommer tous les paiements de la période d'échéance
      const periodeDebut = new Date(moisDate);
      const periodeFin = new Date(annee, mois + freq, 1);
      const montantPaye = b.paiements
        .filter((p) => { const mc = new Date(p.moisConcerne); const mp = new Date(mc.getFullYear(), mc.getMonth(), 1); return mp >= periodeDebut && mp < periodeFin; })
        .reduce((s, p) => s + p.montant, 0);
      return {
        id: b.id,
        locataire: `${b.locataire.prenom} ${b.locataire.nom}`,
        appartement: b.appartement.numero,
        montant: attendu,
        jourLimite: b.jourLimitePaiement,
        paye: montantPaye >= attendu,
        partiel: montantPaye > 0 && montantPaye < attendu,
        montantPaye,
        periodicite: b.periodicite,
      };
    });
}
