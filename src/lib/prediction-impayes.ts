import { PERIODICITE_MOIS } from "@/lib/utils";

type PaiementData = {
  montant: number;
  datePaiement: Date;
  moisConcerne: Date;
  montantCaution: number;
};

type BailData = {
  dateDebut: Date;
  jourLimitePaiement: number;
  periodicite: string;
  totalMensuel: number;
  montantLoyer: number;
  totalCharges: number;
  paiements: PaiementData[];
};

export type ScorePrediction = {
  locataireId: string;
  nom: string;
  appartement: string;
  score: number; // 0-100, 100 = risque max
  niveau: "faible" | "moyen" | "eleve" | "critique";
  facteurs: string[];
  retardMoyen: number; // jours
  tauxRetard: number; // %
  tendance: "amelioration" | "stable" | "degradation";
};

/** Calcule le nombre de jours de retard d'un paiement */
function joursRetard(paiement: PaiementData, bail: BailData): number {
  const mc = new Date(paiement.moisConcerne);
  const dateLimite = new Date(mc.getFullYear(), mc.getMonth(), bail.jourLimitePaiement);
  const dp = new Date(paiement.datePaiement);
  const diff = Math.ceil((dp.getTime() - dateLimite.getTime()) / 86400000);
  return Math.max(0, diff);
}

/** Score un locataire basé sur l'historique de ses paiements */
export function scorerLocataire(bail: BailData): Omit<ScorePrediction, "locataireId" | "nom" | "appartement"> {
  const paiements = bail.paiements
    .filter((p) => p.montantCaution === 0 || p.montant > p.montantCaution)
    .sort((a, b) => new Date(a.moisConcerne).getTime() - new Date(b.moisConcerne).getTime());

  if (paiements.length === 0) {
    return { score: 50, niveau: "moyen", facteurs: ["Aucun historique de paiement"], retardMoyen: 0, tauxRetard: 0, tendance: "stable" };
  }

  const freq = PERIODICITE_MOIS[bail.periodicite] || 1;
  const attenduParEcheance = bail.totalMensuel * freq;

  // 1. Retards (30%)
  const retards = paiements.map((p) => joursRetard(p, bail));
  const retardMoyen = retards.reduce((s, r) => s + r, 0) / retards.length;
  const scoreRetard = Math.min(100, (retardMoyen / 30) * 100); // 30j+ = 100

  // 2. Fréquence des retards (25%)
  const nbEnRetard = retards.filter((r) => r > 0).length;
  const tauxRetard = (nbEnRetard / paiements.length) * 100;
  const scoreFrequence = tauxRetard;

  // 3. Tendance récente vs historique (25%)
  const recent = paiements.slice(-3);
  const ancien = paiements.slice(0, -3);
  const retardRecent = recent.length > 0 ? recent.map((p) => joursRetard(p, bail)).reduce((s, r) => s + r, 0) / recent.length : 0;
  const retardAncien = ancien.length > 0 ? ancien.map((p) => joursRetard(p, bail)).reduce((s, r) => s + r, 0) / ancien.length : retardRecent;
  const diffTendance = retardRecent - retardAncien;
  const scoreTendance = Math.min(100, Math.max(0, 50 + diffTendance * 3));
  const tendance: ScorePrediction["tendance"] = diffTendance > 3 ? "degradation" : diffTendance < -3 ? "amelioration" : "stable";

  // 4. Paiements partiels (20%)
  const partiels = paiements.filter((p) => p.montant - p.montantCaution < attenduParEcheance * 0.95);
  const tauxPartiel = (partiels.length / paiements.length) * 100;
  const scorePartiel = tauxPartiel;

  // Score final pondéré
  const score = Math.round(scoreRetard * 0.3 + scoreFrequence * 0.25 + scoreTendance * 0.25 + scorePartiel * 0.2);
  const scoreFinal = Math.min(100, Math.max(0, score));

  // Niveau de risque
  const niveau: ScorePrediction["niveau"] = scoreFinal >= 70 ? "critique" : scoreFinal >= 45 ? "eleve" : scoreFinal >= 20 ? "moyen" : "faible";

  // Facteurs explicatifs
  const facteurs: string[] = [];
  if (retardMoyen > 15) facteurs.push(`Retard moyen de ${Math.round(retardMoyen)} jours`);
  if (tauxRetard > 50) facteurs.push(`${Math.round(tauxRetard)}% des paiements en retard`);
  if (tendance === "degradation") facteurs.push("Tendance à la dégradation récente");
  if (tauxPartiel > 30) facteurs.push(`${Math.round(tauxPartiel)}% de paiements partiels`);
  if (facteurs.length === 0) facteurs.push("Bon historique de paiement");

  return { score: scoreFinal, niveau, facteurs, retardMoyen: Math.round(retardMoyen), tauxRetard: Math.round(tauxRetard), tendance };
}
