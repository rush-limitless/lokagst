"use client";

import { exportPaiementsCSV, getRapportMensuel } from "@/actions/exports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

export default function ReportingPage() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [rapport, setRapport] = useState<any>(null);

  async function handleExportCSV() {
    const csv = await exportPaiementsCSV(dateDebut || undefined, dateFin || undefined);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paiements_${dateDebut || "all"}_${dateFin || "all"}.csv`;
    a.click();
    toast.success("Export CSV téléchargé");
  }

  async function handleRapport() {
    const data = await getRapportMensuel();
    setRapport(data);
  }

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-xl md:text-2xl font-bold text-foreground">Reporting</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Export CSV</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">Début</Label><Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Fin</Label><Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} /></div>
            </div>
            <Button onClick={handleExportCSV} className="w-full">📥 Télécharger CSV</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Rapport mensuel</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Générez un rapport complet du mois en cours, imprimable en PDF.</p>
            <Button onClick={handleRapport} className="w-full">📊 Générer le rapport</Button>
          </CardContent>
        </Card>
      </div>

      {rapport && (
        <div id="rapport-print">
          <div className="flex justify-end mb-4 print:hidden">
            <Button onClick={() => window.print()}>🖨️ Exporter en PDF</Button>
          </div>
          <div className="bg-card border rounded-xl p-8 print:border-none print:p-0 print:shadow-none">
            {/* En-tête */}
            <div className="text-center border-b-2 border-[#1B6B9E] pb-4 mb-6">
              <img src="/logo.jpg" alt="" className="w-16 h-16 mx-auto mb-2 rounded" />
              <h2 className="text-xl font-bold text-[#1B6B9E]">IMMOSTAR SCI</h2>
              <p className="text-muted-foreground text-xs">Société Civile Immobilière — Yaoundé, Nkolfoulou</p>
              <h3 className="text-lg font-bold mt-3">RAPPORT MENSUEL</h3>
              <p className="text-sm text-muted-foreground">{rapport.periode}</p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{rapport.totalEncaisse.toLocaleString()} FCFA</div>
                <p className="text-xs text-muted-foreground mt-1">Total encaissé</p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{rapport.totalPenalites.toLocaleString()} FCFA</div>
                <p className="text-xs text-muted-foreground mt-1">Pénalités</p>
              </div>
              <div className="bg-sky-50 dark:bg-sky-950/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-sky-700 dark:text-sky-400">{rapport.tauxOccupation}%</div>
                <p className="text-xs text-muted-foreground mt-1">Taux d&apos;occupation</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-foreground">{rapport.nombrePaiements}</div>
                <p className="text-xs text-muted-foreground mt-1">Paiements reçus</p>
              </div>
            </div>

            {/* Résumé immeubles */}
            <div className="mb-6">
              <h4 className="font-semibold text-foreground mb-2">Résumé du parc</h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="border rounded-lg p-3 text-center"><div className="font-bold text-foreground">{rapport.appartements.total}</div><p className="text-xs text-muted-foreground">Total</p></div>
                <div className="border rounded-lg p-3 text-center"><div className="font-bold text-emerald-600">{rapport.appartements.occupes}</div><p className="text-xs text-muted-foreground">Occupés</p></div>
                <div className="border rounded-lg p-3 text-center"><div className="font-bold text-sky-600">{rapport.appartements.libres}</div><p className="text-xs text-muted-foreground">Libres</p></div>
              </div>
            </div>

            {/* Tableau des paiements */}
            <div>
              <h4 className="font-semibold text-foreground mb-2">Détail des paiements</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-2 text-left text-xs font-medium text-muted-foreground">Locataire</th>
                      <th className="p-2 text-center text-xs font-medium text-muted-foreground">Appart.</th>
                      <th className="p-2 text-right text-xs font-medium text-muted-foreground">Montant</th>
                      <th className="p-2 text-center text-xs font-medium text-muted-foreground">Mode</th>
                      <th className="p-2 text-center text-xs font-medium text-muted-foreground">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rapport.paiements.map((p: any, i: number) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="p-2 text-foreground">{p.locataire}</td>
                        <td className="p-2 text-center text-muted-foreground">{p.appartement}</td>
                        <td className="p-2 text-right font-medium text-foreground">{p.montant.toLocaleString()} FCFA</td>
                        <td className="p-2 text-center text-xs text-muted-foreground">{p.mode === "VIREMENT_BANCAIRE" ? "Virement" : "Orange Money"}</td>
                        <td className="p-2 text-center"><span className={`text-xs px-2 py-0.5 rounded-full ${p.statut === "PAYE" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"}`}>{p.statut === "PAYE" ? "Payé" : "Partiel"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t flex justify-between items-end text-xs text-muted-foreground">
              <div>
                <p>IMMOSTAR SCI — Yaoundé, Nkolfoulou</p>
                <p>Rapport généré par ImmoGest le {new Date().toLocaleDateString("fr-FR")}</p>
              </div>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=ImmoGest-Rapport-${rapport.periode}`} alt="QR" className="w-12 h-12" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
