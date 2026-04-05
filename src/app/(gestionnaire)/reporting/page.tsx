"use client";

import { exportPaiementsCSV, getRapportMensuel } from "@/actions/exports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function ReportingPage() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [rapport, setRapport] = useState<any>(null);

  function downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  async function handleCSV() {
    const csv = await exportPaiementsCSV(dateDebut || undefined, dateFin || undefined);
    downloadFile(csv, `paiements_${dateDebut || "all"}.csv`, "text/csv;charset=utf-8;");
    toast.success("CSV téléchargé");
  }

  async function handleExcel() {
    const csv = await exportPaiementsCSV(dateDebut || undefined, dateFin || undefined);
    const rows = csv.split("\n").map((r) => r.split(","));
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = rows[0].map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Paiements");
    XLSX.writeFile(wb, `paiements_${dateDebut || "all"}.xlsx`);
    toast.success("Excel téléchargé");
  }

  async function handleRapport() {
    const data = await getRapportMensuel();
    setRapport(data);
  }

  async function handleRapportExcel() {
    if (!rapport) return;
    const header = [["RAPPORT MENSUEL — IMMOSTAR SCI"], [rapport.periode], [""]];
    const kpis = [["Total encaissé", "Pénalités", "Taux occupation", "Paiements"], [rapport.totalEncaisse, rapport.totalPenalites, `${rapport.tauxOccupation}%`, rapport.nombrePaiements], [""]];
    const parc = [["Appartements total", "Occupés", "Libres"], [rapport.appartements.total, rapport.appartements.occupes, rapport.appartements.libres], [""]];
    const tableHeader = [["Locataire", "Appartement", "Montant", "Mode", "Statut"]];
    const tableRows = rapport.paiements.map((p: any) => [p.locataire, p.appartement, p.montant, p.mode === "VIREMENT_BANCAIRE" ? "Virement" : "Orange Money", p.statut === "PAYE" ? "Payé" : "Partiel"]);

    const ws = XLSX.utils.aoa_to_sheet([...header, ...kpis, ...parc, ...tableHeader, ...tableRows]);
    ws["!cols"] = [{ wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rapport");
    XLSX.writeFile(wb, `rapport_${rapport.periode}.xlsx`);
    toast.success("Rapport Excel téléchargé");
  }

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-xl md:text-2xl font-bold text-foreground">Reporting</h1>

      {/* Export paiements */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Export des paiements</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Début</Label><Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} /></div>
            <div className="space-y-1"><Label className="text-xs">Fin</Label><Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} /></div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleCSV} variant="outline" size="sm">📄 CSV</Button>
            <Button onClick={handleExcel} variant="outline" size="sm">📊 Excel</Button>
          </div>
        </CardContent>
      </Card>

      {/* Rapport mensuel */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Rapport mensuel</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Rapport complet du mois en cours.</p>
          <Button onClick={handleRapport} className="w-full">📊 Générer le rapport</Button>
        </CardContent>
      </Card>

      {rapport && (
        <>
          <div className="flex gap-2 print:hidden">
            <Button onClick={() => window.print()}>🖨️ PDF</Button>
            <Button onClick={handleRapportExcel} variant="outline">📊 Excel</Button>
          </div>

          <div className="bg-card border rounded-xl p-8 print:border-none print:p-0">
            <div className="text-center border-b-2 border-[#1B6B9E] pb-4 mb-6">
              <img src="/logo.jpg" alt="" className="w-16 h-16 mx-auto mb-2 rounded" />
              <h2 className="text-xl font-bold text-[#1B6B9E]">IMMOSTAR SCI</h2>
              <p className="text-muted-foreground text-xs">Yaoundé, Nkolfoulou</p>
              <h3 className="text-lg font-bold mt-3">RAPPORT MENSUEL</h3>
              <p className="text-sm text-muted-foreground">{rapport.periode}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-lg text-center">
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{rapport.totalEncaisse.toLocaleString()} FCFA</div>
                <p className="text-xs text-muted-foreground">Encaissé</p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg text-center">
                <div className="text-xl font-bold text-red-600 dark:text-red-400">{rapport.totalPenalites.toLocaleString()} FCFA</div>
                <p className="text-xs text-muted-foreground">Pénalités</p>
              </div>
              <div className="bg-sky-50 dark:bg-sky-950/20 p-4 rounded-lg text-center">
                <div className="text-xl font-bold text-sky-700 dark:text-sky-400">{rapport.tauxOccupation}%</div>
                <p className="text-xs text-muted-foreground">Occupation</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-xl font-bold text-foreground">{rapport.nombrePaiements}</div>
                <p className="text-xs text-muted-foreground">Paiements</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6 text-sm">
              <div className="border rounded-lg p-3 text-center"><div className="font-bold text-foreground">{rapport.appartements.total}</div><p className="text-xs text-muted-foreground">Total</p></div>
              <div className="border rounded-lg p-3 text-center"><div className="font-bold text-emerald-600">{rapport.appartements.occupes}</div><p className="text-xs text-muted-foreground">Occupés</p></div>
              <div className="border rounded-lg p-3 text-center"><div className="font-bold text-sky-600">{rapport.appartements.libres}</div><p className="text-xs text-muted-foreground">Libres</p></div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr><th className="p-2 text-left text-xs">Locataire</th><th className="p-2 text-center text-xs">Appart.</th><th className="p-2 text-right text-xs">Montant</th><th className="p-2 text-center text-xs">Mode</th><th className="p-2 text-center text-xs">Statut</th></tr>
                </thead>
                <tbody className="divide-y">
                  {rapport.paiements.map((p: any, i: number) => (
                    <tr key={i}>
                      <td className="p-2 text-foreground">{p.locataire}</td>
                      <td className="p-2 text-center text-muted-foreground">{p.appartement}</td>
                      <td className="p-2 text-right font-medium text-foreground">{p.montant.toLocaleString()} FCFA</td>
                      <td className="p-2 text-center text-xs text-muted-foreground">{p.mode === "VIREMENT_BANCAIRE" ? "Virement" : "Orange Money"}</td>
                      <td className="p-2 text-center"><span className={`text-xs px-2 py-0.5 rounded-full ${p.statut === "PAYE" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>{p.statut === "PAYE" ? "Payé" : "Partiel"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-4 border-t flex justify-between items-end text-xs text-muted-foreground">
              <div><p>IMMOSTAR SCI — Yaoundé, Nkolfoulou</p><p>Généré par ImmoGest le {new Date().toLocaleDateString("fr-FR")}</p></div>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=ImmoGest-Rapport-${rapport.periode}`} alt="QR" className="w-12 h-12" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
