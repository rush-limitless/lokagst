import { describe, it, expect } from "vitest";
import { isMoisEcheance, PERIODICITE_MOIS, montantEcheance, nbEcheancesEntre } from "@/lib/utils";
import { calculerAttenduMultiBaux } from "@/lib/calculs-loyer";

// ============================================================
// isMoisEcheance
// ============================================================
describe("isMoisEcheance", () => {
  it("mensuel → toujours vrai", () => {
    expect(isMoisEcheance(new Date(2026, 3, 1), new Date(2024, 0, 1), "MENSUEL")).toBe(true);
  });

  it("trimestriel → vrai tous les 3 mois depuis le début", () => {
    const debut = new Date(2024, 1, 1); // fév
    expect(isMoisEcheance(new Date(2024, 1, 1), debut, "TRIMESTRIEL")).toBe(true);
    expect(isMoisEcheance(new Date(2024, 2, 1), debut, "TRIMESTRIEL")).toBe(false);
    expect(isMoisEcheance(new Date(2024, 3, 1), debut, "TRIMESTRIEL")).toBe(false);
    expect(isMoisEcheance(new Date(2024, 4, 1), debut, "TRIMESTRIEL")).toBe(true); // mai
    expect(isMoisEcheance(new Date(2024, 7, 1), debut, "TRIMESTRIEL")).toBe(true); // août
  });

  it("annuel → vrai uniquement le mois anniversaire", () => {
    const debut = new Date(2023, 6, 1); // juillet
    expect(isMoisEcheance(new Date(2024, 6, 1), debut, "ANNUEL")).toBe(true);
    expect(isMoisEcheance(new Date(2024, 5, 1), debut, "ANNUEL")).toBe(false);
    expect(isMoisEcheance(new Date(2024, 7, 1), debut, "ANNUEL")).toBe(false);
    expect(isMoisEcheance(new Date(2025, 6, 1), debut, "ANNUEL")).toBe(true);
  });

  it("semestriel → tous les 6 mois", () => {
    const debut = new Date(2024, 0, 1); // jan
    expect(isMoisEcheance(new Date(2024, 0, 1), debut, "SEMESTRIEL")).toBe(true); // jan
    expect(isMoisEcheance(new Date(2024, 3, 1), debut, "SEMESTRIEL")).toBe(false); // avr
    expect(isMoisEcheance(new Date(2024, 6, 1), debut, "SEMESTRIEL")).toBe(true); // juil
  });

  it("journalier / non applicable → toujours faux", () => {
    expect(isMoisEcheance(new Date(2024, 3, 1), new Date(2024, 0, 1), "JOURNALIER")).toBe(false);
    expect(isMoisEcheance(new Date(2024, 3, 1), new Date(2024, 0, 1), "NON_APPLICABLE")).toBe(false);
  });

  it("ne retourne pas true avant le début du bail", () => {
    const debut = new Date(2025, 8, 1); // sept 2025
    expect(isMoisEcheance(new Date(2024, 8, 1), debut, "ANNUEL")).toBe(false); // sept 2024 < début
  });
});

// ============================================================
// montantEcheance
// ============================================================
describe("montantEcheance", () => {
  it("mensuel × 1", () => expect(montantEcheance(157500, "MENSUEL")).toBe(157500));
  it("trimestriel × 3", () => expect(montantEcheance(100000, "TRIMESTRIEL")).toBe(300000));
  it("semestriel × 6", () => expect(montantEcheance(100000, "SEMESTRIEL")).toBe(600000));
  it("annuel × 12", () => expect(montantEcheance(157500, "ANNUEL")).toBe(1890000));
});

// ============================================================
// nbEcheancesEntre
// ============================================================
describe("nbEcheancesEntre", () => {
  it("mensuel: compte les mois", () => {
    const n = nbEcheancesEntre(new Date(2025, 0, 1), new Date(2025, 6, 1), new Date(2025, 0, 1), "MENSUEL");
    expect(n).toBe(6);
  });

  it("annuel: compte les anniversaires", () => {
    const n = nbEcheancesEntre(new Date(2023, 4, 1), new Date(2025, 6, 1), new Date(2023, 4, 1), "ANNUEL");
    // mai 2023, mai 2024, mai 2025 = 3
    expect(n).toBe(3);
  });

  it("trimestriel: compte correctement", () => {
    const n = nbEcheancesEntre(new Date(2025, 0, 1), new Date(2025, 9, 1), new Date(2025, 0, 1), "TRIMESTRIEL");
    // jan, avr, juil, oct = mais oct est pas < oct? oct est = fin donc pas compté
    // jan, avr, juil = 3
    expect(n).toBe(3);
  });
});

// ============================================================
// calculerAttenduMultiBaux
// ============================================================
describe("calculerAttenduMultiBaux", () => {
  it("ATG 1: bail mensuel terminé + bail annuel actif", () => {
    const now = new Date(2026, 5, 3);
    const baux = [
      { montantLoyer: 150000, totalCharges: 7500, dateDebut: new Date(2023, 6, 1), dateFin: new Date(2025, 7, 31), statut: "TERMINE", periodicite: "MENSUEL" },
      { montantLoyer: 150000, totalCharges: 15000, dateDebut: new Date(2025, 8, 1), dateFin: new Date(2026, 8, 1), statut: "ACTIF", periodicite: "ANNUEL" },
    ];
    const attendu = calculerAttenduMultiBaux(baux, now);
    const jours1 = Math.ceil((new Date(2025, 7, 31).getTime() - new Date(2023, 6, 1).getTime()) / 86400000);
    // Bail 1 mensuel: jours/30
    // Bail 2 annuel: 1 échéance (sept 2025) × 12 × 165000
    expect(attendu).toBe(Math.round(157500 * (jours1 / 30) + 165000 * 12));
  });

  it("TMCO: 2 baux annuels", () => {
    const now = new Date(2026, 5, 3);
    const baux = [
      { montantLoyer: 150000, totalCharges: 7500, dateDebut: new Date(2023, 4, 1), dateFin: new Date(2024, 11, 31), statut: "TERMINE", periodicite: "ANNUEL" },
      { montantLoyer: 150000, totalCharges: 7500, dateDebut: new Date(2025, 0, 1), dateFin: new Date(2027, 0, 1), statut: "ACTIF", periodicite: "ANNUEL" },
    ];
    const attendu = calculerAttenduMultiBaux(baux, now);
    // Bail 1: échéances mai 2023, mai 2024 = 2 × 1 890 000 = 3 780 000
    // Bail 2: échéances jan 2025, jan 2026 = 2 × 1 890 000 = 3 780 000
    expect(attendu).toBe(3780000 + 3780000);
  });

  it("BASS TECHNOLOGIES: bail trimestriel", () => {
    const now = new Date(2026, 5, 3);
    const baux = [
      { montantLoyer: 600000, totalCharges: 0, dateDebut: new Date(2026, 4, 1), dateFin: new Date(2027, 4, 1), statut: "ACTIF", periodicite: "TRIMESTRIEL" },
    ];
    const attendu = calculerAttenduMultiBaux(baux, now);
    // Début mai 2026, now juin 2026. Échéance mai 2026 passée = 1
    // 600 000 × 3 × 1 = 1 800 000
    expect(attendu).toBe(1800000);
  });

  it("bail mensuel simple: jours/30", () => {
    const now = new Date(2026, 5, 3);
    const baux = [
      { montantLoyer: 100000, totalCharges: 5000, dateDebut: new Date(2026, 0, 1), dateFin: new Date(2027, 0, 1), statut: "ACTIF", periodicite: "MENSUEL" },
    ];
    const attendu = calculerAttenduMultiBaux(baux, now);
    const jours = Math.ceil((now.getTime() - new Date(2026, 0, 1).getTime()) / 86400000);
    expect(attendu).toBe(Math.round(105000 * (jours / 30)));
  });

  it("bail avec 0 jours → attendu 0", () => {
    const now = new Date(2026, 5, 3);
    const baux = [
      { montantLoyer: 100000, totalCharges: 5000, dateDebut: now, dateFin: new Date(2027, 0, 1), statut: "ACTIF", periodicite: "MENSUEL" },
    ];
    expect(calculerAttenduMultiBaux(baux, now)).toBe(0);
  });

  it("bail annuel pas encore à la première échéance → 1 échéance (le mois de début)", () => {
    const now = new Date(2025, 9, 15); // 15 oct 2025
    const baux = [
      { montantLoyer: 150000, totalCharges: 15000, dateDebut: new Date(2025, 8, 1), dateFin: new Date(2026, 8, 1), statut: "ACTIF", periodicite: "ANNUEL" },
    ];
    // Début sept 2025, now oct 2025. finMois = oct 2025. Boucle: sept(✓), oct(non) → 1 échéance
    expect(calculerAttenduMultiBaux(baux, now)).toBe(165000 * 12);
  });

  it("TRANSFER/IT: bail annuel 330k avec charges 30k", () => {
    const now = new Date(2026, 5, 3);
    const baux = [
      { montantLoyer: 300000, totalCharges: 30000, dateDebut: new Date(2026, 0, 1), dateFin: new Date(2027, 0, 1), statut: "ACTIF", periodicite: "ANNUEL" },
    ];
    const attendu = calculerAttenduMultiBaux(baux, now);
    // Début jan 2026, now juin 2026. Échéance jan 2026 passée = 1
    // 330 000 × 12 × 1 = 3 960 000
    expect(attendu).toBe(3960000);
  });
});
