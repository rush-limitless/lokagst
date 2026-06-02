/**
 * Calcule le montant attendu cumulé pour un locataire ayant plusieurs baux
 * sur le même appartement. Chaque bail contribue selon son propre montant × sa durée.
 *
 * Formule : Σ (loyer + charges de chaque bail) × (jours du bail ÷ 30)
 */
export function calculerAttenduMultiBaux(
  baux: { montantLoyer: number; totalCharges: number; dateDebut: Date | string; dateFin: Date | string; statut: string }[],
  now: Date = new Date()
): number {
  let total = 0;
  for (const b of baux) {
    const deb = new Date(b.dateDebut);
    const fin = b.statut === "ACTIF" || b.statut === "SUSPENDU" ? now : new Date(b.dateFin);
    const jours = Math.max(0, Math.ceil((fin.getTime() - deb.getTime()) / 86400000));
    total += (b.montantLoyer + b.totalCharges) * (jours / 30);
  }
  return Math.round(total);
}
