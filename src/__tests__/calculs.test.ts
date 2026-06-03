import { describe, it, expect } from "vitest";
import { isMoisEcheance, PERIODICITE_MOIS, montantEcheance, nbEcheancesEntre } from "@/lib/utils";
import { calculerAttenduMultiBaux } from "@/lib/calculs-loyer";

describe("isMoisEcheance", () => {
  it("mensuel → toujours vrai", () => {
    expect(isMoisEcheance(new Date(2026, 3, 1), new Date(2024, 0, 1), "MENSUEL")).toBe(true);
  });

  it("trimestriel → vrai tous les 3 mois depuis le début", () => {
    const debut = new Date(2024, 1, 1); // février
    expect(isMoisEcheance(new Date(2024, 1, 1), debut, "TRIMESTRIEL")).toBe(true); // fev
    expect(isMoisEcheance(new Date(2024, 2, 1), debut, "TRIMESTRIEL")).toBe(false); // mars
    expect(isMoisEcheance(new Date(2024, 4, 1), debut, "TRIMESTRIEL")).toBe(true); // mai
  });

  it("annuel → vrai uniquement le mois anniversaire", () => {
    const debut = new Date(2023, 6, 1); // juillet
    expect(isMoisEcheance(new Date(2024, 6, 1), debut, "ANNUEL")).toBe(true); // juil 2024
    expect(isMoisEcheance(new Date(2024, 5, 1), debut, "ANNUEL")).toBe(false); // juin 2024
    expect(isMoisEcheance(new Date(2025, 6, 1), debut, "ANNUEL")).toBe(true); // juil 2025
  });

  it("journalier → toujours faux", () => {
    expect(isMoisEcheance(new Date(2024, 3, 1), new Date(2024, 0, 1), "JOURNALIER")).toBe(false);
  });
});

describe("montantEcheance", () => {
  it("mensuel → totalMensuel × 1", () => {
    expect(montantEcheance(157500, "MENSUEL")).toBe(157500);
  });
  it("annuel → totalMensuel × 12", () => {
    expect(montantEcheance(157500, "ANNUEL")).toBe(1890000);
  });
  it("trimestriel → totalMensuel × 3", () => {
    expect(montantEcheance(100000, "TRIMESTRIEL")).toBe(300000);
  });
});

describe("PERIODICITE_MOIS", () => {
  it("contient les bonnes fréquences", () => {
    expect(PERIODICITE_MOIS.MENSUEL).toBe(1);
    expect(PERIODICITE_MOIS.TRIMESTRIEL).toBe(3);
    expect(PERIODICITE_MOIS.SEMESTRIEL).toBe(6);
    expect(PERIODICITE_MOIS.ANNUEL).toBe(12);
  });
});

describe("calculerAttenduMultiBaux", () => {
  it("bail unique actif", () => {
    const now = new Date(2026, 5, 2); // 2 juin 2026
    const baux = [{ montantLoyer: 40000, totalCharges: 2000, dateDebut: new Date(2024, 1, 10), dateFin: new Date(2028, 1, 10), statut: "ACTIF" }];
    const attendu = calculerAttenduMultiBaux(baux, now);
    // 843 jours / 30 × 42000 ≈ 1 180 200
    const jours = Math.ceil((now.getTime() - new Date(2024, 1, 10).getTime()) / 86400000);
    expect(attendu).toBe(Math.round(42000 * (jours / 30)));
  });

  it("deux baux avec montants différents", () => {
    const now = new Date(2026, 5, 2);
    const baux = [
      { montantLoyer: 150000, totalCharges: 7500, dateDebut: new Date(2023, 6, 1), dateFin: new Date(2025, 7, 31), statut: "TERMINE" },
      { montantLoyer: 150000, totalCharges: 15000, dateDebut: new Date(2025, 8, 1), dateFin: new Date(2026, 8, 1), statut: "ACTIF" },
    ];
    const attendu = calculerAttenduMultiBaux(baux, now);
    const jours1 = Math.ceil((new Date(2025, 7, 31).getTime() - new Date(2023, 6, 1).getTime()) / 86400000);
    const jours2 = Math.ceil((now.getTime() - new Date(2025, 8, 1).getTime()) / 86400000);
    const expected = Math.round(157500 * (jours1 / 30) + 165000 * (jours2 / 30));
    expect(attendu).toBe(expected);
  });

  it("bail terminé utilise dateFin", () => {
    const now = new Date(2026, 5, 2);
    const baux = [{ montantLoyer: 100000, totalCharges: 5000, dateDebut: new Date(2024, 0, 1), dateFin: new Date(2025, 0, 1), statut: "TERMINE" }];
    const attendu = calculerAttenduMultiBaux(baux, now);
    const jours = Math.ceil((new Date(2025, 0, 1).getTime() - new Date(2024, 0, 1).getTime()) / 86400000);
    expect(attendu).toBe(Math.round(105000 * (jours / 30)));
  });
});
