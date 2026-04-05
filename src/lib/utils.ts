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
