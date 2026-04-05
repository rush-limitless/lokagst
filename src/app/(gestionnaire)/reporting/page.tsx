"use client";

import { getReportingComplet } from "@/actions/reporting-complet";
import { getRapportMensuel } from "@/actions/exports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useRef } from "react";
import { toast } from "sonner";
import XLSX from "xlsx-js-style";

const ETAGE_LABELS: Record<string, string> = { RDC: "RDC", PREMIER: "ETAGE 1", DEUXIEME: "ETAGE 2", TROISIEME: "ETAGE 3", QUATRIEME: "ETAGE 4" };
function fmtDate(d: Date | string) { return new Date(d).toLocaleDateString("fr-FR"); }

const BLUE = { rgb: "1B6B9E" };
const WHITE = { rgb: "FFFFFF" };
const GREEN_BG = { rgb: "E8F5E9" };
const RED_BG = { rgb: "FFEBEE" };
const YELLOW_BG = { rgb: "FFF8E1" };
const GRAY_BG = { rgb: "F5F5F5" };
const HEADER_STYLE = { font: { bold: true, color: WHITE, sz: 11 }, fill: { fgColor: BLUE }, alignment: { horizontal: "center" }, border: { bottom: { style: "thin", color: { rgb: "000000" } } } };
const TITLE_STYLE = { font: { bold: true, color: BLUE, sz: 14 }, alignment: { horizontal: "center" } };
const TOTAL_STYLE = { font: { bold: true, sz: 11 }, fill: { fgColor: { rgb: "E3F2FD" } } };
const NUM_FMT = '#,##0';

function styledCell(v: any, style: any = {}) { return { v, s: style, t: typeof v === "number" ? "n" : "s" }; }

export default function ReportingPage() {
  const [loading, setLoading] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfData, setPdfData] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  async function handleExcel() {
    setLoading(true);
    try {
      const data = await getReportingComplet();
      const wb = XLSX.utils.book_new();

      // === SUIVI DES PAIEMENTS ===
      const rows: any[][] = [
        [styledCell("TABLEAU DE SUIVI DES PAIEMENTS IMMOSTAR SCI", TITLE_STYLE)],
        [styledCell(`Au ${new Date().toLocaleDateString("fr-FR")}`, { font: { italic: true, color: { rgb: "666666" } } })],
        [],
        [null, null, null, styledCell("LÉGENDE :", { font: { bold: true } })],
        [null, null, null, styledCell("Échéances du mois suivant", { fill: { fgColor: GREEN_BG } })],
        [null, null, null, styledCell("Échéances du mois courant", { fill: { fgColor: YELLOW_BG } })],
        [null, null, null, styledCell("Échéances dépassées", { fill: { fgColor: RED_BG } })],
        [],
      ];

      const headers = ["POS", "Logement", "Locataire", "Loyer", "Charges", "Date entrée", "Période (j)", "Période (m)", "Attendu", "Réglé", "Différence", "Jours rest.", "Caution", "Total perçu", "Obs."];
      rows.push(headers.map(h => styledCell(h, HEADER_STYLE)));

      let lastEtage = "";
      data.suiviPaiements.forEach((r: any, i: number) => {
        const el = ETAGE_LABELS[r.etage] || r.etage;
        if (el !== lastEtage) {
          rows.push([styledCell(el, { font: { bold: true, color: BLUE, sz: 12 }, fill: { fgColor: { rgb: "E3F2FD" } } })]);
          lastEtage = el;
        }
        const rowStyle = r.difference < 0 ? { fill: { fgColor: RED_BG } } : r.difference === 0 ? {} : { fill: { fgColor: GREEN_BG } };
        rows.push([
          styledCell(i + 1, rowStyle), styledCell(r.logement, rowStyle), styledCell(r.locataire, rowStyle),
          styledCell(r.loyerMensuel, { ...rowStyle, numFmt: NUM_FMT }), styledCell(r.chargesMensuelles, { ...rowStyle, numFmt: NUM_FMT }),
          styledCell(fmtDate(r.dateEntree), rowStyle), styledCell(r.joursHabitation, rowStyle), styledCell(r.moisHabitation, rowStyle),
          styledCell(r.attendu, { ...rowStyle, numFmt: NUM_FMT }), styledCell(r.regle, { ...rowStyle, numFmt: NUM_FMT }),
          styledCell(r.difference, { ...rowStyle, numFmt: NUM_FMT, font: { color: { rgb: r.difference < 0 ? "CC0000" : "008800" }, bold: true } }),
          styledCell(r.joursRestants, rowStyle), styledCell(r.caution, { ...rowStyle, numFmt: NUM_FMT }),
          styledCell(r.totalPercu, { ...rowStyle, numFmt: NUM_FMT }),
          styledCell(r.difference < 0 ? "IMPAYÉ" : "À JOUR", { font: { bold: true, color: { rgb: r.difference < 0 ? "CC0000" : "008800" } } }),
        ]);
      });

      rows.push([]);
      const tA = data.suiviPaiements.reduce((s: number, r: any) => s + r.attendu, 0);
      const tR = data.suiviPaiements.reduce((s: number, r: any) => s + r.regle, 0);
      rows.push([styledCell("TOTAL", TOTAL_STYLE), null, null, null, null, null, null, null,
        styledCell(tA, { ...TOTAL_STYLE, numFmt: NUM_FMT }), styledCell(tR, { ...TOTAL_STYLE, numFmt: NUM_FMT }),
        styledCell(tR - tA, { ...TOTAL_STYLE, numFmt: NUM_FMT, font: { bold: true, color: { rgb: tR - tA < 0 ? "CC0000" : "008800" } } }),
      ]);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws["!cols"] = [{ wch: 5 }, { wch: 20 }, { wch: 36 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 12 }];
      ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];
      XLSX.utils.book_append_sheet(wb, ws, "SUIVI DES PAIEMENTS");

      // === STATISTIQUES ===
      const stats: any[][] = [[styledCell("STATISTIQUES IMMOSTAR SCI", TITLE_STYLE)], []];
      const etages = Array.from(new Set(data.suiviPaiements.map((r: any) => r.etage)));
      etages.forEach((etage: string) => {
        const locs = data.suiviPaiements.filter((r: any) => r.etage === etage);
        const tAE = locs.reduce((s: number, r: any) => s + r.attendu, 0);
        const tRE = locs.reduce((s: number, r: any) => s + r.regle, 0);
        const pct = tAE > 0 ? Math.round(tRE / tAE * 100) : 0;
        stats.push([styledCell(`${ETAGE_LABELS[etage] || etage} — Réalisation : ${pct}%`, { font: { bold: true, color: WHITE, sz: 12 }, fill: { fgColor: pct >= 80 ? { rgb: "2E7D32" } : pct >= 50 ? { rgb: "F57F17" } : { rgb: "C62828" } } })]);
        stats.push(["Logement", "Locataire", "Loyer", "Charges", "Attendu", "Réglé", "Différence", "%"].map(h => styledCell(h, { font: { bold: true }, fill: { fgColor: GRAY_BG } })));
        locs.forEach((r: any) => {
          const p = r.attendu > 0 ? Math.round(r.regle / r.attendu * 100) : 0;
          const bg = p >= 100 ? GREEN_BG : p >= 80 ? YELLOW_BG : RED_BG;
          stats.push([styledCell(r.logement), styledCell(r.locataire), styledCell(r.loyerMensuel, { numFmt: NUM_FMT }), styledCell(r.chargesMensuelles, { numFmt: NUM_FMT }), styledCell(r.attendu, { numFmt: NUM_FMT }), styledCell(r.regle, { numFmt: NUM_FMT }), styledCell(r.difference, { numFmt: NUM_FMT, font: { color: { rgb: r.difference < 0 ? "CC0000" : "008800" } } }), styledCell(`${p}%`, { fill: { fgColor: bg }, font: { bold: true } })]);
        });
        stats.push([null, styledCell("TOTAL", TOTAL_STYLE), null, null, styledCell(tAE, { ...TOTAL_STYLE, numFmt: NUM_FMT }), styledCell(tRE, { ...TOTAL_STYLE, numFmt: NUM_FMT }), styledCell(tRE - tAE, { ...TOTAL_STYLE, numFmt: NUM_FMT })]);
        stats.push([]);
      });
      const ws3 = XLSX.utils.aoa_to_sheet(stats);
      ws3["!cols"] = [{ wch: 20 }, { wch: 36 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, ws3, "STATISTIQUES");

      // === ETAT CONTRATS ===
      const ecb: any[][] = [[styledCell("ETAT DES CONTRATS DE BAIL — IMMOSTAR SCI", TITLE_STYLE)], []];
      ecb.push(["Étage", "Logement", "Locataire", "Loyer", "Charges", "Caution", "Date entrée", "Périodicité"].map(h => styledCell(h, HEADER_STYLE)));
      let le = "";
      data.etatContrats.forEach((r: any) => {
        const el = ETAGE_LABELS[r.etage] || r.etage;
        ecb.push([styledCell(el !== le ? el : "", { font: { bold: el !== le } }), styledCell(r.logement), styledCell(r.locataire), styledCell(r.loyerMensuel, { numFmt: NUM_FMT }), styledCell(r.chargesMensuelles, { numFmt: NUM_FMT }), styledCell(r.caution, { numFmt: NUM_FMT }), styledCell(fmtDate(r.dateEntree)), styledCell(r.periodicite)]);
        le = el;
      });
      const ws5 = XLSX.utils.aoa_to_sheet(ecb);
      ws5["!cols"] = [{ wch: 12 }, { wch: 20 }, { wch: 36 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws5, "ETAT CONTRATS");

      XLSX.writeFile(wb, `TABLEAU_SUIVI_IMMOSTAR_${new Date().toLocaleDateString("fr-FR").replace(/\//g, "_")}.xlsx`);
      toast.success("Excel IMMOSTAR téléchargé !");
    } catch { toast.error("Erreur"); }
    setLoading(false);
  }

  async function handlePdf() {
    const data = await getReportingComplet();
    const rapport = await getRapportMensuel();
    setPdfData({ ...rapport, suiviPaiements: data.suiviPaiements });
    setShowPdf(true);
  }

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-xl md:text-2xl font-bold text-foreground">Reporting</h1>

      <Card className="gradient-border">
        <CardHeader><CardTitle className="text-sm">📊 Tableau de suivi IMMOSTAR SCI</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Export professionnel avec couleurs, logo et légendes.</p>
          <div className="flex gap-3">
            <Button onClick={handleExcel} disabled={loading} size="lg" className="flex-1">
              {loading ? "Génération..." : "📥 Excel (coloré)"}
            </Button>
            <Button onClick={handlePdf} variant="outline" size="lg" className="flex-1">
              📄 PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {showPdf && pdfData && (
        <>
          <div className="flex gap-2 print:hidden">
            <Button onClick={() => window.print()}>🖨️ Imprimer / Enregistrer PDF</Button>
            <Button variant="outline" onClick={() => setShowPdf(false)}>Fermer</Button>
          </div>
          <div ref={printRef} className="bg-white text-black rounded-xl border p-8 print:border-none print:p-0 print:shadow-none text-sm">
            {/* En-tête */}
            <div className="flex items-center justify-between border-b-3 border-[#1B6B9E] pb-4 mb-6">
              <div className="flex items-center gap-4">
                <img src="/logo.jpg" alt="" className="w-16 h-16 rounded" />
                <div>
                  <h1 className="text-2xl font-bold text-[#1B6B9E]">IMMOSTAR SCI</h1>
                  <p className="text-gray-500 text-xs">Société Civile Immobilière — Yaoundé, Nkolfoulou</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-bold text-gray-800">TABLEAU DE SUIVI</h2>
                <p className="text-gray-500 text-xs">Au {new Date().toLocaleDateString("fr-FR")}</p>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-[#e8f5e9] p-3 rounded-lg text-center border border-[#a5d6a7]"><div className="text-lg font-bold text-[#2e7d32]">{pdfData.totalEncaisse.toLocaleString()}</div><p className="text-[10px] text-gray-600">FCFA Encaissé</p></div>
              <div className="bg-[#ffebee] p-3 rounded-lg text-center border border-[#ef9a9a]"><div className="text-lg font-bold text-[#c62828]">{pdfData.totalPenalites.toLocaleString()}</div><p className="text-[10px] text-gray-600">FCFA Pénalités</p></div>
              <div className="bg-[#e3f2fd] p-3 rounded-lg text-center border border-[#90caf9]"><div className="text-lg font-bold text-[#1565c0]">{pdfData.tauxOccupation}%</div><p className="text-[10px] text-gray-600">Occupation</p></div>
              <div className="bg-[#f5f5f5] p-3 rounded-lg text-center border border-[#e0e0e0]"><div className="text-lg font-bold">{pdfData.appartements.total}</div><p className="text-[10px] text-gray-600">Appartements</p></div>
            </div>

            {/* Légende */}
            <div className="flex gap-4 mb-4 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#e8f5e9] border border-[#a5d6a7]" /> À jour</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#fff8e1] border border-[#ffe082]" /> Retard léger</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#ffebee] border border-[#ef9a9a]" /> Impayé</span>
            </div>

            {/* Tableau principal */}
            <table className="w-full border-collapse text-[11px] mb-6">
              <thead>
                <tr className="bg-[#1B6B9E] text-white">
                  <th className="p-1.5 text-left border border-[#1565c0]">N°</th>
                  <th className="p-1.5 text-left border border-[#1565c0]">Logement</th>
                  <th className="p-1.5 text-left border border-[#1565c0]">Locataire</th>
                  <th className="p-1.5 text-right border border-[#1565c0]">Loyer</th>
                  <th className="p-1.5 text-right border border-[#1565c0]">Charges</th>
                  <th className="p-1.5 text-right border border-[#1565c0]">Attendu</th>
                  <th className="p-1.5 text-right border border-[#1565c0]">Réglé</th>
                  <th className="p-1.5 text-right border border-[#1565c0]">Différence</th>
                  <th className="p-1.5 text-center border border-[#1565c0]">Statut</th>
                </tr>
              </thead>
              <tbody>
                {pdfData.suiviPaiements.map((r: any, i: number) => {
                  const bg = r.difference >= 0 ? "#e8f5e9" : r.difference > -r.attendu * 0.2 ? "#fff8e1" : "#ffebee";
                  return (
                    <tr key={i} style={{ backgroundColor: bg }}>
                      <td className="p-1 border border-gray-300">{i + 1}</td>
                      <td className="p-1 border border-gray-300 font-medium">{r.logement}</td>
                      <td className="p-1 border border-gray-300">{r.locataire}</td>
                      <td className="p-1 border border-gray-300 text-right">{r.loyerMensuel.toLocaleString()}</td>
                      <td className="p-1 border border-gray-300 text-right">{r.chargesMensuelles.toLocaleString()}</td>
                      <td className="p-1 border border-gray-300 text-right">{r.attendu.toLocaleString()}</td>
                      <td className="p-1 border border-gray-300 text-right font-bold">{r.regle.toLocaleString()}</td>
                      <td className="p-1 border border-gray-300 text-right font-bold" style={{ color: r.difference < 0 ? "#c62828" : "#2e7d32" }}>{r.difference.toLocaleString()}</td>
                      <td className="p-1 border border-gray-300 text-center font-bold" style={{ color: r.difference < 0 ? "#c62828" : "#2e7d32" }}>{r.difference < 0 ? "IMPAYÉ" : "À JOUR"}</td>
                    </tr>
                  );
                })}
                <tr className="bg-[#e3f2fd] font-bold">
                  <td className="p-1.5 border border-gray-400" colSpan={5}>TOTAL</td>
                  <td className="p-1.5 border border-gray-400 text-right">{pdfData.suiviPaiements.reduce((s: number, r: any) => s + r.attendu, 0).toLocaleString()}</td>
                  <td className="p-1.5 border border-gray-400 text-right">{pdfData.suiviPaiements.reduce((s: number, r: any) => s + r.regle, 0).toLocaleString()}</td>
                  <td className="p-1.5 border border-gray-400 text-right">{(pdfData.suiviPaiements.reduce((s: number, r: any) => s + r.regle, 0) - pdfData.suiviPaiements.reduce((s: number, r: any) => s + r.attendu, 0)).toLocaleString()}</td>
                  <td className="p-1.5 border border-gray-400" />
                </tr>
              </tbody>
            </table>

            {/* Footer */}
            <div className="border-t-2 border-[#1B6B9E] pt-3 flex justify-between items-end">
              <div className="text-[10px] text-gray-500">
                <p className="font-bold text-[#1B6B9E]">IMMOSTAR SCI</p>
                <p>Résidence La&apos;ag Tchang — Yaoundé, Nkolfoulou</p>
                <p>Généré par ImmoGest le {new Date().toLocaleDateString("fr-FR")}</p>
              </div>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=IMMOSTAR-SUIVI-${new Date().toISOString().slice(0, 10)}`} alt="QR" className="w-12 h-12" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
