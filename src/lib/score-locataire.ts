/**
 * Calcule un score locataire de 1 à 5 étoiles basé sur :
 * - Régularité des paiements (60%)
 * - Ancienneté (20%)
 * - Absence de pénalités (20%)
 */
export function calculerScoreLocataire(data: {
  moisTotal: number;
  moisPayes: number;
  ancienneteMois: number;
  nbPenalites: number;
}): { score: number; etoiles: number; label: string } {
  const { moisTotal, moisPayes, ancienneteMois, nbPenalites } = data;

  // Régularité: % de mois payés
  const regularite = moisTotal > 0 ? moisPayes / moisTotal : 1;

  // Ancienneté: bonus pour les anciens (cap à 24 mois)
  const anciennete = Math.min(ancienneteMois / 24, 1);

  // Pénalités: malus
  const penaliteScore = Math.max(0, 1 - nbPenalites * 0.2);

  const score = regularite * 0.6 + anciennete * 0.2 + penaliteScore * 0.2;
  const etoiles = Math.max(1, Math.min(5, Math.round(score * 5)));

  const labels = ["", "Critique", "Insuffisant", "Correct", "Bon", "Excellent"];
  return { score: Math.round(score * 100), etoiles, label: labels[etoiles] };
}
