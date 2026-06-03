import { isMoisEcheance, PERIODICITE_MOIS } from "@/lib/utils";

/**
 * Calcule le montant attendu cumulé pour un locataire ayant plusieurs baux
 * sur le même appartement. Chaque bail contribue selon son propre montant
 * et sa propre période.
 *
 * - Bail MENSUEL : (loyer+charges) × (jours ÷ 30) — formule Excel du boss
 * - Bail ANNUEL/TRIMESTRIEL/SEMESTRIEL : nombre d'échéances passées × montant × fréquence
 */
export function calculerAttenduMultiBaux(
  baux: { montantLoyer: number; totalCharges: number; dateDebut: Date | string; dateFin: Date | string; statut: string; periodicite: string }[],
  now: Date = new Date()
): number {
  let total = 0;
  for (const b of baux) {
    const deb = new Date(b.dateDebut);
    const fin = b.statut === "ACTIF" || b.statut === "SUSPENDU" ? now : new Date(b.dateFin);
    const freq = PERIODICITE_MOIS[b.periodicite] || 1;
    const mensuel = b.montantLoyer + b.totalCharges;

    if (freq <= 1) {
      // MENSUEL: jours/30 (formule Excel boss, arrondi naturel)
      const jours = Math.max(0, Math.ceil((fin.getTime() - deb.getTime()) / 86400000));
      total += mensuel * (jours / 30);
    } else {
      // ANNUEL, TRIMESTRIEL, SEMESTRIEL: compter les échéances passées
      const d = new Date(deb.getFullYear(), deb.getMonth(), 1);
      const finMois = new Date(fin.getFullYear(), fin.getMonth(), 1);
      let nbEcheances = 0;
      while (d <= finMois) {
        if (isMoisEcheance(d, deb, b.periodicite)) {
          nbEcheances++;
        }
        d.setMonth(d.getMonth() + 1);
      }
      total += mensuel * freq * nbEcheances;
    }
  }
  return Math.round(total);
}
