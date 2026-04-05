"use client";

import { exportPaiementsCSV, getRapportMensuel } from "@/actions/exports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

export default function ExportsPage() {
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-950">Exports comptables</h1>

      <Card>
        <CardHeader><CardTitle>Export CSV des paiements</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Date début</Label><Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} /></div>
            <div className="space-y-2"><Label>Date fin</Label><Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} /></div>
          </div>
          <Button onClick={handleExportCSV}>📥 Télécharger CSV</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Rapport mensuel</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleRapport}>📊 Générer le rapport du mois</Button>
          {rapport && (
            <div className="space-y-4 mt-4">
              <h3 className="font-bold text-lg">{rapport.periode}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-3 rounded text-center"><div className="text-xl font-bold text-green-700">{rapport.totalEncaisse.toLocaleString()} FCFA</div><p className="text-xs text-gray-500">Encaissé</p></div>
                <div className="bg-red-50 p-3 rounded text-center"><div className="text-xl font-bold text-red-600">{rapport.totalPenalites.toLocaleString()} FCFA</div><p className="text-xs text-gray-500">Pénalités</p></div>
                <div className="bg-blue-50 p-3 rounded text-center"><div className="text-xl font-bold text-blue-700">{rapport.tauxOccupation}%</div><p className="text-xs text-gray-500">Occupation</p></div>
                <div className="bg-gray-50 p-3 rounded text-center"><div className="text-xl font-bold">{rapport.nombrePaiements}</div><p className="text-xs text-gray-500">Paiements</p></div>
              </div>
              <div className="bg-white border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr><th className="p-2 text-left">Locataire</th><th className="p-2">Appart.</th><th className="p-2">Montant</th><th className="p-2">Mode</th><th className="p-2">Statut</th></tr></thead>
                  <tbody className="divide-y">
                    {rapport.paiements.map((p: any, i: number) => (
                      <tr key={i}><td className="p-2">{p.locataire}</td><td className="p-2 text-center">{p.appartement}</td><td className="p-2 text-center">{p.montant.toLocaleString()} FCFA</td><td className="p-2 text-center">{p.mode}</td><td className="p-2 text-center">{p.statut}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button variant="outline" onClick={() => window.print()}>🖨️ Imprimer le rapport</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
