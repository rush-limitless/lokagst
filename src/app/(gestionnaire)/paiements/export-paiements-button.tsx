"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const BLUE = { rgb: "1B6B9E" };
const WHITE = { rgb: "FFFFFF" };
const HEADER_STYLE = { font: { bold: true, color: WHITE, sz: 10 }, fill: { fgColor: BLUE }, alignment: { horizontal: "center" } };
function s(v: any, style: any = {}) { return { v, s: style, t: typeof v === "number" ? "n" : "s" }; }

type Paiement = {
  bail: { locataire: { prenom: string; nom: string }; appartement: { numero: string } };
  moisConcerne: Date | string;
  montantLoyer: number;
  montantCharges: number;
  montantCaution: number;
  montant: number;
  modePaiement: string;
  statut: string;
  datePaiement: Date | string;
};

const MODE_LABELS: Record<string, string> = { VIREMENT_BANCAIRE: "Virement", MOBILE_MONEY: "Mobile Money", ESPECES: "Espèces" };

export function ExportPaiementsButton({ paiements, filtres }: { paiements: Paiement[]; filtres?: string }) {
  async function handleExport() {
    const XLSX = (await import("xlsx-js-style")).default;
    const wb = XLSX.utils.book_new();
    const now = new Date().toLocaleDateString("fr-FR");

    const rows: any[][] = [
      [s(`LISTE DES PAIEMENTS — IMMOSTAR SCI`, { font: { bold: true, color: BLUE, sz: 13 } })],
      [s(`Exporté le ${now}${filtres ? ` — Filtres : ${filtres}` : ""}`, { font: { italic: true, color: { rgb: "666666" } } })],
      [],
      [
        s("Locataire", HEADER_STYLE), s("Appartement", HEADER_STYLE), s("Mois concerné", HEADER_STYLE),
        s("Loyer", HEADER_STYLE), s("Charges", HEADER_STYLE), s("Caution", HEADER_STYLE),
        s("Total", HEADER_STYLE), s("Mode", HEADER_STYLE), s("Statut", HEADER_STYLE), s("Date paiement", HEADER_STYLE),
      ],
      ...paiements.map((p) => [
        `${p.bail.locataire.prenom} ${p.bail.locataire.nom}`,
        p.bail.appartement.numero,
        new Date(p.moisConcerne).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
        { v: p.montantLoyer, t: "n", z: "#,##0" },
        { v: p.montantCharges, t: "n", z: "#,##0" },
        { v: p.montantCaution, t: "n", z: "#,##0" },
        { v: p.montant, t: "n", z: "#,##0", s: { font: { bold: true } } },
        MODE_LABELS[p.modePaiement] || p.modePaiement,
        p.statut === "PAYE" ? "Payé" : "Partiel",
        new Date(p.datePaiement).toLocaleDateString("fr-FR"),
      ]),
      [],
      [s("TOTAL", { font: { bold: true } }), "", "", "", "", "",
        { v: paiements.reduce((s, p) => s + p.montant, 0), t: "n", z: "#,##0", s: { font: { bold: true } } }],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 25 }, { wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 14 }];
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }];
    XLSX.utils.book_append_sheet(wb, ws, "Paiements");
    XLSX.writeFile(wb, `paiements_immostar_${now.replace(/\//g, "-")}.xlsx`);
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
      <Download className="size-3.5" /> Excel
    </Button>
  );
}
