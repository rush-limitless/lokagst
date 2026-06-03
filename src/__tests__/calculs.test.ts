import { describe, it, expect } from "vitest";
import { isMoisEcheance, PERIODICITE_MOIS, montantEcheance } from "@/lib/utils";
import { calculerAttenduMultiBaux } from "@/lib/calculs-loyer";

describe("isMoisEcheance", () => {
  it("mensuel → toujours vrai", () => {
    expect(isMoisEcheance(new Date(2026, 3, 1), new Date(2024, 0, 1), "MENSUEL")).toBe(true);
  });

  it("trimestriel → vrai tous les 3 mois depuis le début", () => {
    const debut = new Date(2024, 1, 1);
    expect(isMoisEcheance(new Date(2024, 1, 1), debut, "TRIMESTRIEL")).toBe(true);
    expect(isMoisEcheance(new Date(2024, 2, 1), debut, "TRIMESTRIEL")).toBe(false);
    expect(isMoisEcheance(new Date(2024, 4, 1), debut, "TRIMESTRIEL")).toBe(true);
  });

  it("annuel → vrai uniquement le mois anniversaire", () => {
    const debut = new Date(2023, 6, 1);
    expect(isMoisEcheance(new Date(2024, 6, 1), debut, "ANNUEL")).toBe(true);
    expect(isMoisEcheance(new Date(2024, 5, 1), debut, "ANNUEL")).toBe(false);
    expect(isMoisEcheance(new Date(2025, 6, 1), debut, "ANNUEL")).toBe(true);
  });
});

describe("montantEcheance", () => {
  it("mensuel → totalMensuel × 1", () => {
    expect(montantEcheance(157500, "MENSUEL")).toBe(157500);
  });
  it("annuel → totalMensuel × 12", () => {
    expect(montantEcheance(157500, "ANNUEL")).toBe(1890000);
  });
});

describe("calculerAttenduMultiBaux", () => {
  it("ATG 1 - bail terminé MENSUEL + bail actif ANNUEL", () => {
    const now = new Date(2026, 5, 3); // 3 juin 2026
    const baux = [
      { montantLoyer: 150000, totalCharges: 7500, dateDebut: new Date(2023, 6, 1), dateFin: new Date(2025, 7, 31), statut: "TERMINE", periodicite: "MENSUEL" },
      { montantLoyer: 150000, totalCharges: 15000, dateDebut: new Date(2025, 8, 1), dateFin: new Date(2026, 8, 1), statut: "ACTIF", periodicite: "ANNUEL" },
    ];
    const attendu = calculerAttenduMultiBaux(baux, now);
    // Bail 1 (MENSUEL terminé): 792 jours / 30 × 157500 = 4 158 000? Non...
    // 2025-08-31 - 2023-07-01 = 792 jours. 792/30 = 26.4. 157500 × 26.4 = 4 158 000
    // Bail 2 (ANNUEL actif): échéances en sept. Sept 2025 passé = 1 échéance. 165000 × 12 = 1 980 000
    const jours1 = Math.ceil((new Date(2025, 7, 31).getTime() - new Date(2023, 6, 1).getTime()) / 86400000);
    const attenduBail1 = 157500 * (jours1 / 30);
    const attenduBail2 = 165000 * 12 * 1; // 1 échéance annuelle
    expect(attendu).toBe(Math.round(attenduBail1 + attenduBail2));
  });

  it("TMCO - bail terminé ANNUEL + bail actif ANNUEL", () => {
    const now = new Date(2026, 5, 3); // 3 juin 2026
    const baux = [
      { montantLoyer: 150000, totalCharges: 7500, dateDebut: new Date(2023, 4, 1), dateFin: new Date(2024, 11, 31), statut: "TERMINE", periodicite: "ANNUEL" },
      { montantLoyer: 150000, totalCharges: 7500, dateDebut: new Date(2025, 0, 1), dateFin: new Date(2026, 0, 1), statut: "ACTIF", periodicite: "ANNUEL" },
    ];
    const attendu = calculerAttenduMultiBaux(baux, now);
    // Bail 1 (ANNUEL terminé): début mai 2023, fin déc 2024. Échéances: mai 2023, mai 2024 = 2
    // 157500 × 12 × 2 = 3 780 000
    // Bail 2 (ANNUEL actif): début jan 2025, now juin 2026. Échéances: jan 2025, jan 2026 = 2
    // 157500 × 12 × 2 = 3 780 000
    expect(attendu).toBe(3780000 + 3780000);
  });

  it("bail annuel - 1 seule échéance quand l'anniversaire n'est pas repassé", () => {
    const now = new Date(2026, 2, 15); // 15 mars 2026
    const baux = [{ montantLoyer: 150000, totalCharges: 15000, dateDebut: new Date(2025, 8, 1), dateFin: new Date(2026, 8, 1), statut: "ACTIF", periodicite: "ANNUEL" }];
    const attendu = calculerAttenduMultiBaux(baux, now);
    // Début sept 2025, now mars 2026. Échéance sept 2025 passée = 1. 165000 × 12 = 1 980 000
    expect(attendu).toBe(165000 * 12);
  });

  it("bail mensuel simple", () => {
    const now = new Date(2026, 5, 3);
    const baux = [{ montantLoyer: 100000, totalCharges: 5000, dateDebut: new Date(2026, 0, 1), dateFin: new Date(2027, 0, 1), statut: "ACTIF", periodicite: "MENSUEL" }];
    const attendu = calculerAttenduMultiBaux(baux, now);
    // Jan 2026 → 3 juin 2026 = 153 jours. 153/30 = 5.1. 105000 × 5.1 = 535 500
    const jours = Math.ceil((now.getTime() - new Date(2026, 0, 1).getTime()) / 86400000);
    expect(attendu).toBe(Math.round(105000 * (jours / 30)));
  });
});
