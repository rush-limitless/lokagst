import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFCFA(montant: number): string {
  return new Intl.NumberFormat("fr-FR").format(montant) + " FCFA";
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatMois(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

export const ETAGE_LABELS: Record<string, string> = {
  RDC: "RDC",
  PREMIER: "1er étage",
  DEUXIEME: "2ème étage",
  TROISIEME: "3ème étage",
  QUATRIEME: "4ème étage",
  CINQUIEME: "5ème étage",
};

export const TYPE_LABELS: Record<string, string> = {
  STUDIO: "Studio",
  CHAMBRE: "Chambre",
  APPARTEMENT: "Appartement",
  STUDIO_MEUBLE: "Studio meublé",
  CHAMBRE_MEUBLE: "Chambre meublée",
  APPARTEMENT_MEUBLE: "Appartement meublé",
  VILLA: "Villa",
};

export const STATUT_BAIL_LABELS: Record<string, string> = {
  ACTIF: "Actif",
  RESILIE: "Résilié",
  TERMINE: "Terminé",
  EXPIRE: "Expiré",
};

export const MODE_PAIEMENT_LABELS: Record<string, string> = {
  VIREMENT_BANCAIRE: "Virement bancaire",
  ORANGE_MONEY: "Orange Money",
};

export const PERIODICITE_LABELS: Record<string, string> = {
  MENSUEL: "Mensuel",
  TRIMESTRIEL: "Trimestriel (3 mois)",
  SEMESTRIEL: "Semestriel (6 mois)",
  ANNUEL: "Annuel (12 mois)",
};

export const PERIODICITE_MOIS: Record<string, number> = {
  MENSUEL: 1,
  TRIMESTRIEL: 3,
  SEMESTRIEL: 6,
  ANNUEL: 12,
};

/**
 * Détermine si un mois donné est un mois d'échéance pour un bail selon sa périodicité.
 * Ex: bail annuel débutant en janvier → échéance uniquement en janvier.
 * Ex: bail trimestriel débutant en février → échéances en février, mai, août, novembre.
 */
export function isMoisEcheance(mois: Date, dateDebut: Date, periodicite: string): boolean {
  const freq = PERIODICITE_MOIS[periodicite] || 1;
  if (freq === 1) return true;
  const debutMois = dateDebut.getMonth();
  const moisCourant = mois.getMonth();
  // Calculer le nombre de mois depuis le début
  const diff = (mois.getFullYear() - dateDebut.getFullYear()) * 12 + (moisCourant - debutMois);
  return diff >= 0 && diff % freq === 0;
}

/**
 * Nombre d'échéances attendues entre deux dates selon la périodicité.
 */
export function nbEcheancesEntre(debut: Date, fin: Date, dateDebutBail: Date, periodicite: string): number {
  const freq = PERIODICITE_MOIS[periodicite] || 1;
  if (freq === 1) {
    return Math.max(0, Math.ceil((fin.getTime() - debut.getTime()) / (30.5 * 86400000)));
  }
  let count = 0;
  const d = new Date(debut.getFullYear(), debut.getMonth(), 1);
  while (d < fin) {
    if (isMoisEcheance(d, dateDebutBail, periodicite)) count++;
    d.setMonth(d.getMonth() + 1);
  }
  return count;
}
