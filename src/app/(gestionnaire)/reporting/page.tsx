"use client";

import { exportPaiementsCSV, getRapportMensuel } from "@/actions/exports";
import { getReportingComplet } from "@/actions/reporting-complet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const ETAGE_LABELS: Record<string, string> = { RDC: "RDC", PREMIER: "ETAGE 1", DEUXIEME: "ETAGE 2", TROISIEME: "ETAGE 3", QUATRIEME: "ETAGE 4" };

function fmtDate(d: Date | string) { return new Date(d).toLocaleDateString("fr-FR"); }


export default function ReportingPage() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [rapport, setRapport] = useState<any>(null);

  async function handleCSV() {
    const csv = await exportPaiementsCSV(dateDebut || undefined, dateFin || undefined);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `paiements_immostar.csv`; a.click();
    toast.success("CSV téléchargé");
  }

  async function handleExcelComplet() {
    setLoading(true);
    try {
      const data = await getReportingComplet();
      const wb = XLSX.utils.book_new();

      // === ONGLET 1: SUIVI DES PAIEMENTS ===
      const suivi: any[][] = [
        ["", "TABLEAU DE SUIVI DES PAIEMENTS IMMOSTAR SCI"],
        ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", new Date().toLocaleDateString("fr-FR")],
        [],
        ["", "", "", "LÉGENDE :"],
        ["", "", "", "🟢 Échéances du mois suivant"],
        ["", "", "", "🟡 Échéances du mois courant"],
        ["", "", "", "🔴 Échéances dépassées"],
        [],
        ["POS", "Désignation du logement", "Nom du locataire", "Loyer mensuel", "Charges mensuelles", "Date d'entrée", "Date de sortie", "Période habitation (jours)", "Période habitation (mois)", "Période habitation (mois arrondi)", "Loyer+charges attendus à date", "Loyer+charges réglés", "Différence", "Période restante (jours)", "Période restante (mois)", "Prochaine échéance", "Caution", "Total perçu", "Total encaissé", "Pénalités", "Observations"],
      ];

      let lastEtage = "";
      data.suiviPaiements.forEach((r: any, i: number) => {
        const etageLabel = ETAGE_LABELS[r.etage] || r.etage;
        if (etageLabel !== lastEtage) {
          suivi.push([etageLabel]);
          lastEtage = etageLabel;
        }
        const obs = r.difference < 0 ? "⚠️ Impayé" : r.difference === 0 ? "✅ À jour" : "✅ En avance";
        suivi.push([i + 1, r.logement, r.locataire, r.loyerMensuel, r.chargesMensuelles, fmtDate(r.dateEntree), r.dateSortie ? fmtDate(r.dateSortie) : "", r.joursHabitation, r.moisHabitation, r.moisHabitationArrondi, r.attendu, r.regle, r.difference, r.joursRestants, r.moisRestants, "", r.caution, r.totalPercu, r.totalEncaisse, r.penalites, obs]);
      });

      const totalAttendu = data.suiviPaiements.reduce((s: number, r: any) => s + r.attendu, 0);
      const totalRegle = data.suiviPaiements.reduce((s: number, r: any) => s + r.regle, 0);
      const totalCaution = data.suiviPaiements.reduce((s: number, r: any) => s + r.caution, 0);
      const totalPercu = data.suiviPaiements.reduce((s: number, r: any) => s + r.totalPercu, 0);
      suivi.push([]);
      suivi.push(["TOTAL", "", "", "", "", "", "", "", "", "", totalAttendu, totalRegle, totalRegle - totalAttendu, "", "", "", totalCaution, totalPercu, totalPercu, "", ""]);

      const ws1 = XLSX.utils.aoa_to_sheet(suivi);
      ws1["!cols"] = [{ wch: 5 }, { wch: 24 }, { wch: 38 }, { wch: 15 }, { wch: 17 }, { wch: 13 }, { wch: 13 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 14 }, { wch: 12 }, { wch: 15 }, { wch: 13 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 18 }];
      ws1["!merges"] = [{ s: { r: 0, c: 1 }, e: { r: 0, c: 10 } }];
      XLSX.utils.book_append_sheet(wb, ws1, "SUIVI DES PAIEMENTS");

      // === ONGLET 2: SYNTHESE PAIEMENTS ===
      const moisHeaders = data.moisList.map((m: Date) => new Date(m).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }));
      const synth: any[][] = [
        ["TABLEAU DE SUIVI DES PAIEMENTS IMMOSTAR SCI"],
        [],
        ["", "", "LÉGENDE :"],
        ["", "", "🟢 Échéances du mois suivant"],
        ["", "", "🟡 Échéances du mois courant"],
        ["", "", "🔴 Échéances dépassées"],
        ["", "", "🔵 ANCIEN LOCATAIRE"],
        ["", "", "⚪ LOCATAIRE ACTUEL"],
        [],
        ["POS", "Désignation", "Nom du locataire", "Loyer", "Charges", "Caution", "Date entrée", ...moisHeaders, "Total paiements", "Période (mois)", "Loyer+charges attendus", "Loyer+charges réglés", "Nb mois réglés", "Mois en attente", "Prochaine échéance"],
      ];

      let lastEtage2 = "";
      data.synthese.forEach((r: any, i: number) => {
        const etageLabel = ETAGE_LABELS[r.etage] || r.etage;
        if (etageLabel !== lastEtage2) {
          synth.push([etageLabel]);
          lastEtage2 = etageLabel;
        }
        const moisValues = data.moisList.map((m: Date) => {
          const key = `${new Date(m).getFullYear()}-${String(new Date(m).getMonth() + 1).padStart(2, "0")}`;
          return r.paiementsParMois[key] || "";
        });
        const totalPaie = Object.values(r.paiementsParMois as Record<string, number>).reduce((s: number, v: number) => s + v, 0);
        const moisHab = Math.ceil((new Date().getTime() - new Date(r.dateEntree).getTime()) / (30.5 * 86400000));
        const attendu = (r.loyerMensuel + r.chargesMensuelles) * moisHab;
        const moisRegles = (r.loyerMensuel + r.chargesMensuelles) > 0 ? Math.round(totalPaie / (r.loyerMensuel + r.chargesMensuelles) * 10) / 10 : 0;
        synth.push([i + 1, r.logement, r.locataire, r.loyerMensuel, r.chargesMensuelles, r.caution, fmtDate(r.dateEntree), ...moisValues, totalPaie, moisHab, attendu, totalPaie, moisRegles, Math.round((moisHab - moisRegles) * 10) / 10, ""]);
      });

      // Totaux par étage
      const etages = Array.from(new Set(data.synthese.map((r: any) => r.etage)));
      synth.push([]);
      etages.forEach((etage: string) => {
        const locs = data.synthese.filter((r: any) => r.etage === etage);
        const totalE = locs.reduce((s: number, r: any) => s + Object.values(r.paiementsParMois as Record<string, number>).reduce((a: number, b: number) => a + b, 0), 0);
        synth.push([ETAGE_LABELS[etage] || etage, "TOTAL PERÇU", "", "", "", "", "", ...data.moisList.map(() => ""), totalE]);
      });

      const ws2 = XLSX.utils.aoa_to_sheet(synth);
      ws2["!cols"] = [{ wch: 5 }, { wch: 20 }, { wch: 38 }, { wch: 13 }, { wch: 13 }, { wch: 13 }, { wch: 13 }, ...moisHeaders.map(() => ({ wch: 13 })), { wch: 16 }, { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, ws2, "SYNTHESE PAIEMENTS");

      // === ONGLET 3: STATISTIQUES ===
      const statsSheet: any[][] = [["STATISTIQUES IMMOSTAR SCI"], [], ["", "", "RÉSUMÉ PAR ÉTAGE"], []];
      etages.forEach((etage: string) => {
        const locs = data.suiviPaiements.filter((r: any) => r.etage === etage);
        const totalAtE = locs.reduce((s: number, r: any) => s + r.attendu, 0);
        const totalReE = locs.reduce((s: number, r: any) => s + r.regle, 0);
        const pct = totalAtE > 0 ? Math.round(totalReE / totalAtE * 100) : 0;
        statsSheet.push([ETAGE_LABELS[etage] || etage, "", "", "", "", "", "", "", `POURCENTAGE DE RÉALISATION : ${pct}%`]);
        statsSheet.push(["Logement", "Locataire", "Loyer", "Charges", "Loyer+charges attendus", "Loyer+charges réglés", "Différence", "% réalisation", "Statut"]);
        locs.forEach((r: any) => {
          const pctL = r.attendu > 0 ? Math.round(r.regle / r.attendu * 100) : 0;
          const statut = pctL >= 100 ? "✅ À jour" : pctL >= 80 ? "🟡 Retard léger" : "🔴 Impayé critique";
          statsSheet.push([r.logement, r.locataire, r.loyerMensuel, r.chargesMensuelles, r.attendu, r.regle, r.difference, `${pctL}%`, statut]);
        });
        statsSheet.push(["TOTAL ÉTAGE", "", "", "", totalAtE, totalReE, totalReE - totalAtE, `${pct}%`, ""]);
        statsSheet.push(["LOYER MENSUEL ATTENDU", "", locs.reduce((s: number, r: any) => s + r.loyerMensuel + r.chargesMensuelles, 0)]);
        statsSheet.push([]);
      });

      // Global
      const globalAt = data.suiviPaiements.reduce((s: number, r: any) => s + r.attendu, 0);
      const globalRe = data.suiviPaiements.reduce((s: number, r: any) => s + r.regle, 0);
      statsSheet.push(["SYNTHÈSE GLOBALE"]);
      statsSheet.push(["Total attendu", globalAt, "", "Total réglé", globalRe, "", "Différence", globalRe - globalAt, "", "% réalisation", globalAt > 0 ? `${Math.round(globalRe / globalAt * 100)}%` : "0%"]);

      const ws3 = XLSX.utils.aoa_to_sheet(statsSheet);
      ws3["!cols"] = [{ wch: 24 }, { wch: 38 }, { wch: 14 }, { wch: 14 }, { wch: 20 }, { wch: 20 }, { wch: 16 }, { wch: 14 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, ws3, "STATISTIQUES");

      // === ONGLET 4: ANCIENS LOCATAIRES ===
      const anc: any[][] = [
        ["", "", "", "", "", "", "", "", "", "", "ANCIENS LOCATAIRES"],
        [],
        ["POS", "Désignation", "Nom du locataire", "Loyer mensuel", "Charges", "Date entrée", "Date sortie", "Période (jours)", "Période (mois)", "Loyer+charges attendus", "Loyer+charges réglés", "Différence", "Caution", "Total perçu", "Caution remboursée", "Total encaissé"],
      ];
      data.anciens.forEach((r: any, i: number) => {
        anc.push([i + 1, r.logement, r.locataire, r.loyerMensuel, r.chargesMensuelles, fmtDate(r.dateEntree), fmtDate(r.dateSortie), r.joursHabitation, r.moisHabitation, r.attendu, r.regle, r.difference, r.caution, r.totalPercu, "", r.totalPercu]);
      });
      if (data.anciens.length === 0) anc.push(["", "", "Aucun ancien locataire"]);
      const ws4 = XLSX.utils.aoa_to_sheet(anc);
      ws4["!cols"] = [{ wch: 5 }, { wch: 20 }, { wch: 38 }, { wch: 14 }, { wch: 12 }, { wch: 13 }, { wch: 13 }, { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(wb, ws4, "ANCIENS LOCATAIRES");

      // === ONGLET 5: ETAT CONTRAT DE BAIL ===
      const ecb: any[][] = [
        ["", "TABLEAU DE SUIVI DES PAIEMENTS IMMOSTAR SCI"],
        [],
        ["", "", "", "🟢 Échéances du mois suivant"],
        ["", "", "", "🟡 Échéances du mois courant"],
        ["", "", "", "🔴 Échéances dépassées"],
        [],
        ["", "POS", "Désignation du logement", "Nom du locataire", "Loyer mensuel", "Charges mensuelles", "Caution", "Date d'entrée", "Périodicité", "Enregistrement"],
      ];
      let lastE = "";
      data.etatContrats.forEach((r: any) => {
        const el = ETAGE_LABELS[r.etage] || r.etage;
        ecb.push(["", el !== lastE ? el : "", r.logement, r.locataire, r.loyerMensuel, r.chargesMensuelles, r.caution, fmtDate(r.dateEntree), r.periodicite, ""]);
        lastE = el;
      });
      const totalLoyer = data.etatContrats.reduce((s: number, r: any) => s + r.loyerMensuel, 0);
      const totalChargesE = data.etatContrats.reduce((s: number, r: any) => s + r.chargesMensuelles, 0);
      const totalCautionE = data.etatContrats.reduce((s: number, r: any) => s + r.caution, 0);
      ecb.push([]);
      ecb.push(["", "TOTAL", "", "", totalLoyer, totalChargesE, totalCautionE]);

      const ws5 = XLSX.utils.aoa_to_sheet(ecb);
      ws5["!cols"] = [{ wch: 3 }, { wch: 12 }, { wch: 24 }, { wch: 38 }, { wch: 14 }, { wch: 16 }, { wch: 13 }, { wch: 13 }, { wch: 14 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws5, "ETAT CONTRAT DE BAIL");

      XLSX.writeFile(wb, `TABLEAU_SUIVI_IMMOSTAR_AU_${new Date().toLocaleDateString("fr-FR").replace(/\//g, "_")}.xlsx`);
      toast.success("Tableau de suivi IMMOSTAR téléchargé !");
    } catch { toast.error("Erreur"); }
    setLoading(false);
  }

  async function handleRapport() { setRapport(await getRapportMensuel()); }

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-xl md:text-2xl font-bold text-foreground">Reporting</h1>

      <Card className="gradient-border">
        <CardHeader><CardTitle className="text-sm">📊 Tableau de suivi complet IMMOSTAR</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Export Excel 5 onglets avec légendes couleur, totaux par étage, statistiques et pourcentages de réalisation.</p>
          <div className="flex gap-2">
            <Button onClick={handleExcelComplet} disabled={loading} className="flex-1" size="lg">
              {loading ? "Génération..." : "📥 Excel complet (5 onglets)"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Export paiements</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-xs">Début</Label><Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-xs">Fin</Label><Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} /></div>
            </div>
            <Button onClick={handleCSV} variant="outline" size="sm" className="w-full">📄 CSV</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Rapport mensuel PDF</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Rapport imprimable avec logo, KPIs et tableau.</p>
            <Button onClick={handleRapport} variant="outline" className="w-full">📊 Générer</Button>
          </CardContent>
        </Card>
      </div>

      {rapport && (
        <>
          <div className="flex gap-2 print:hidden"><Button onClick={() => window.print()}>🖨️ Exporter en PDF</Button></div>
          <div className="bg-white text-black border rounded-xl p-8 print:border-none print:p-0 print:shadow-none">
            <div className="text-center border-b-2 border-[#1B6B9E] pb-4 mb-6">
              <img src="/logo.jpg" alt="" className="w-20 h-20 mx-auto mb-2 rounded" />
              <h2 className="text-2xl font-bold text-[#1B6B9E]">IMMOSTAR SCI</h2>
              <p className="text-gray-500 text-sm">Société Civile Immobilière — Yaoundé, Nkolfoulou</p>
              <h3 className="text-xl font-bold mt-3 text-gray-800">RAPPORT MENSUEL</h3>
              <p className="text-gray-600">{rapport.periode}</p>
            </div>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-[#e8f5e9] p-4 rounded-lg text-center border border-[#c8e6c9]"><div className="text-2xl font-bold text-[#2e7d32]">{rapport.totalEncaisse.toLocaleString()}</div><p className="text-xs text-gray-600">FCFA Encaissé</p></div>
              <div className="bg-[#ffebee] p-4 rounded-lg text-center border border-[#ffcdd2]"><div className="text-2xl font-bold text-[#c62828]">{rapport.totalPenalites.toLocaleString()}</div><p className="text-xs text-gray-600">FCFA Pénalités</p></div>
              <div className="bg-[#e3f2fd] p-4 rounded-lg text-center border border-[#bbdefb]"><div className="text-2xl font-bold text-[#1565c0]">{rapport.tauxOccupation}%</div><p className="text-xs text-gray-600">Occupation</p></div>
              <div className="bg-[#f5f5f5] p-4 rounded-lg text-center border border-[#e0e0e0]"><div className="text-2xl font-bold text-gray-800">{rapport.nombrePaiements}</div><p className="text-xs text-gray-600">Paiements</p></div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="border-2 border-[#1B6B9E] rounded-lg p-3 text-center"><div className="font-bold text-xl text-gray-800">{rapport.appartements.total}</div><p className="text-xs text-gray-500">Total appartements</p></div>
              <div className="border-2 border-[#2e7d32] rounded-lg p-3 text-center"><div className="font-bold text-xl text-[#2e7d32]">{rapport.appartements.occupes}</div><p className="text-xs text-gray-500">Occupés</p></div>
              <div className="border-2 border-[#29ABE2] rounded-lg p-3 text-center"><div className="font-bold text-xl text-[#29ABE2]">{rapport.appartements.libres}</div><p className="text-xs text-gray-500">Libres</p></div>
            </div>
            <table className="w-full text-sm border-collapse mb-6">
              <thead><tr className="bg-[#1B6B9E] text-white"><th className="p-2 text-left">Locataire</th><th className="p-2 text-center">Appart.</th><th className="p-2 text-right">Montant</th><th className="p-2 text-center">Mode</th><th className="p-2 text-center">Statut</th></tr></thead>
              <tbody>
                {rapport.paiements.map((p: any, i: number) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-[#f8f9fa]" : "bg-white"}><td className="p-2 border-b text-gray-800">{p.locataire}</td><td className="p-2 border-b text-center text-gray-600">{p.appartement}</td><td className="p-2 border-b text-right font-bold text-gray-800">{p.montant.toLocaleString()} FCFA</td><td className="p-2 border-b text-center text-gray-600 text-xs">{p.mode === "VIREMENT_BANCAIRE" ? "Virement" : "Orange Money"}</td><td className="p-2 border-b text-center"><span className={`text-xs px-2 py-1 rounded-full font-medium ${p.statut === "PAYE" ? "bg-[#e8f5e9] text-[#2e7d32]" : "bg-[#fff3e0] text-[#e65100]"}`}>{p.statut === "PAYE" ? "✅ Payé" : "⚠️ Partiel"}</span></td></tr>
                ))}
              </tbody>
            </table>
            <div className="border-t-2 border-[#1B6B9E] pt-4 flex justify-between items-end">
              <div className="text-xs text-gray-500"><p className="font-bold text-[#1B6B9E]">IMMOSTAR SCI</p><p>Yaoundé, Nkolfoulou — Cameroun</p><p>Généré par ImmoGest le {new Date().toLocaleDateString("fr-FR")}</p></div>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=ImmoGest-IMMOSTAR-${rapport.periode}`} alt="QR" className="w-14 h-14" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
