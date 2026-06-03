import { prisma } from "@/lib/prisma";
import { PERIODICITE_MOIS } from "@/lib/utils";

export async function getBauxActifs() {
  return prisma.bail.findMany({
    where: { statut: "ACTIF" },
    include: { locataire: true, appartement: true, paiements: true, penalites: true },
  });
}

export function getInfosPeriode(bail: Awaited<ReturnType<typeof getBauxActifs>>[number], moisCourant: Date) {
  const freq = PERIODICITE_MOIS[bail.periodicite] || 1;
  const periodeDebut = new Date(moisCourant);
  const periodeFin = new Date(moisCourant.getFullYear(), moisCourant.getMonth() + freq, 1);
  const totalPayePeriode = bail.paiements
    .filter((p) => { const mc = new Date(p.moisConcerne); const mp = new Date(mc.getFullYear(), mc.getMonth(), 1); return mp >= periodeDebut && mp < periodeFin; })
    .reduce((s, p) => s + p.montant, 0);
  const attenduPeriode = bail.totalMensuel * freq;
  return { freq, periodeDebut, periodeFin, totalPayePeriode, attenduPeriode, estPaye: totalPayePeriode >= attenduPeriode };
}

export { envoyerRapportMensuel } from "./rapport";
export { traiterRappels } from "./rappels";
export { traiterPenalites } from "./penalites";
export { traiterSuspensions } from "./suspensions";
export { traiterRenouvellements } from "./renouvellements";
