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
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `paiements.csv`; a.click();
    toast.success("CSV téléchargé");
  }

  async function handleExcelComplet() {
    setLoading(true);
    try {
      const data = await getReportingComplet();
      const wb = XLSX.utils.book_new();

      // === ONGLET 1: SUIVI DES PAIEMENTS ===
      const suivi = [
        ["", "TABLEAU DE SUIVI DES PAIEMENTS IMMOSTAR SCI"],
        [],
        ["POS", "Désignation du logement", "Nom du locataire", "Loyer mensuel", "Charges mensuelles", "Date d'entrée", "Date de sortie", "Période habitation (jours)", "Période habitation (mois)", "Loyer+charges attendus", "Loyer+charges réglés", "Différence", "Jours restants", "Mois restants", "Caution", "Total perçu", "Total encaissé", "Pénalités"],
      ];
      data.suiviPaiements.forEach((r, i) => {
        suivi.push([i + 1, r.logement, r.locataire, r.loyerMensuel, r.chargesMensuelles, fmtDate(r.dateEntree), r.dateSortie ? fmtDate(r.dateSortie) : "", r.joursHabitation, r.moisHabitation, r.attendu, r.regle, r.difference, r.joursRestants, r.moisRestants, r.caution, r.totalPercu, r.totalEncaisse, r.penalites] as any);
      });
      const totalRegle = data.suiviPaiements.reduce((s: number, r: any) => s + r.regle, 0);
      const totalAttendu = data.suiviPaiements.reduce((s: number, r: any) => s + r.attendu, 0);
      suivi.push(["TOTAL", "", "", "", "", "", "", "", "", totalAttendu, totalRegle, totalRegle - totalAttendu] as any);
      const ws1 = XLSX.utils.aoa_to_sheet(suivi);
      ws1["!cols"] = [{ wch: 5 }, { wch: 22 }, { wch: 35 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws1, "SUIVI DES PAIEMENTS");

      // === ONGLET 2: SYNTHESE PAIEMENTS ===
      const moisHeaders = data.moisList.map((m: Date) => new Date(m).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }));
      const synth = [
        ["TABLEAU DE SUIVI DES PAIEMENTS IMMOSTAR SCI"],
        [],
        ["POS", "Désignation", "Nom du locataire", "Loyer", "Charges", "Caution", "Date entrée", ...moisHeaders, "Total paiements", "Période (mois)", "Attendu", "Réglé", "Nb mois réglés", "Mois en attente"],
      ];
      data.synthese.forEach((r: any, i: number) => {
        const moisValues = data.moisList.map((m: Date) => {
          const key = `${new Date(m).getFullYear()}-${String(new Date(m).getMonth() + 1).padStart(2, "0")}`;
          return r.paiementsParMois[key] || "";
        });
        const totalPaie = Object.values(r.paiementsParMois as Record<string, number>).reduce((s: number, v: number) => s + v, 0);
        const moisHab = Math.ceil((new Date().getTime() - new Date(r.dateEntree).getTime()) / (30.5 * 86400000));
        const attendu = (r.loyerMensuel + r.chargesMensuelles) * moisHab;
        const moisRegles = r.loyerMensuel > 0 ? Math.round(totalPaie / (r.loyerMensuel + r.chargesMensuelles) * 10) / 10 : 0;
        synth.push([i + 1, r.logement, r.locataire, r.loyerMensuel, r.chargesMensuelles, r.caution, fmtDate(r.dateEntree), ...moisValues, totalPaie, moisHab, attendu, totalPaie, moisRegles, Math.round((moisHab - moisRegles) * 10) / 10] as any);
      });
      const ws2 = XLSX.utils.aoa_to_sheet(synth);
      ws2["!cols"] = [{ wch: 5 }, { wch: 18 }, { wch: 35 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, ...moisHeaders.map(() => ({ wch: 12 })), { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws2, "SYNTHESE PAIEMENTS");

      // === ONGLET 3: STATISTIQUES ===
      const etages = [...new Set(data.suiviPaiements.map((r: any) => r.etage))];
      const stats = [["STATISTIQUES IMMOSTAR SCI"], []];
      etages.forEach((etage: string) => {
        const locsDuEtage = data.suiviPaiements.filter((r: any) => r.etage === etage);
        const totalAttenduE = locsDuEtage.reduce((s: number, r: any) => s + r.attendu, 0);
        const totalRegleE = locsDuEtage.reduce((s: number, r: any) => s + r.regle, 0);
        const pct = totalAttenduE > 0 ? Math.round(totalRegleE / totalAttenduE * 100) : 0;
        stats.push([ETAGE_LABELS[etage] || etage] as any);
        stats.push(["Logement", "Locataire", "Loyer", "Charges", "Attendu", "Réglé", "Différence", "% réalisation"] as any);
        locsDuEtage.forEach((r: any) => {
          const pctLoc = r.attendu > 0 ? Math.round(r.regle / r.attendu * 100) : 0;
          stats.push([r.logement, r.locataire, r.loyerMensuel, r.chargesMensuelles, r.attendu, r.regle, r.difference, `${pctLoc}%`] as any);
        });
        stats.push(["TOTAL", "", "", "", totalAttenduE, totalRegleE, totalRegleE - totalAttenduE, `${pct}%`] as any);
        stats.push([] as any);
      });
      const ws3 = XLSX.utils.aoa_to_sheet(stats);
      ws3["!cols"] = [{ wch: 22 }, { wch: 35 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws3, "STATISTIQUES");

      // === ONGLET 4: ANCIENS LOCATAIRES ===
      const anc = [
        ["", "", "", "", "", "", "", "", "", "", "ANCIENS LOCATAIRES"],
        [],
        ["POS", "Désignation", "Nom du locataire", "Loyer mensuel", "Charges", "Date entrée", "Date sortie", "Période (jours)", "Période (mois)", "Attendu", "Réglé", "Différence", "Caution", "Total perçu"],
      ];
      data.anciens.forEach((r: any, i: number) => {
        anc.push([i + 1, r.logement, r.locataire, r.loyerMensuel, r.chargesMensuelles, fmtDate(r.dateEntree), fmtDate(r.dateSortie), r.joursHabitation, r.moisHabitation, r.attendu, r.regle, r.difference, r.caution, r.totalPercu] as any);
      });
      const ws4 = XLSX.utils.aoa_to_sheet(anc);
      ws4["!cols"] = [{ wch: 5 }, { wch: 18 }, { wch: 35 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws4, "ANCIENS LOCATAIRES");

      // === ONGLET 5: ETAT CONTRAT DE BAIL ===
      const ecb = [
        ["", "TABLEAU DE SUIVI DES PAIEMENTS IMMOSTAR SCI"],
        [],
        ["", "POS", "Désignation", "Nom du locataire", "Loyer mensuel", "Charges", "Caution", "Date entrée", "Périodicité", "Statut"],
      ];
      let lastEtage = "";
      data.etatContrats.forEach((r: any) => {
        const etageLabel = ETAGE_LABELS[r.etage] || r.etage;
        const showEtage = etageLabel !== lastEtage;
        lastEtage = etageLabel;
        ecb.push(["", showEtage ? etageLabel : "", r.logement, r.locataire, r.loyerMensuel, r.chargesMensuelles, r.caution, fmtDate(r.dateEntree), r.periodicite, r.statut] as any);
      });
      const ws5 = XLSX.utils.aoa_to_sheet(ecb);
      ws5["!cols"] = [{ wch: 3 }, { wch: 10 }, { wch: 18 }, { wch: 35 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws5, "ETAT CONTRAT DE BAIL");

      XLSX.writeFile(wb, `TABLEAU_SUIVI_IMMOSTAR_${new Date().toLocaleDateString("fr-FR").replace(/\//g, "-")}.xlsx`);
      toast.success("Fichier Excel complet téléchargé (5 onglets)");
    } catch {
      toast.error("Erreur lors de la génération");
    }
    setLoading(false);
  }

  async function handleRapport() {
    const data = await getRapportMensuel();
    setRapport(data);
  }

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-xl md:text-2xl font-bold text-foreground">Reporting</h1>

      {/* Export principal */}
      <Card className="gradient-border">
        <CardHeader><CardTitle className="text-sm">📊 Tableau de suivi complet IMMOSTAR</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Export Excel multi-onglets identique au format IMMOSTAR : Suivi des paiements, Synthèse, Statistiques, Anciens locataires, État contrats.</p>
          <Button onClick={handleExcelComplet} disabled={loading} className="w-full" size="lg">
            {loading ? "Génération en cours..." : "📥 Télécharger le tableau de suivi complet (Excel)"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export simple */}
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

        {/* Rapport mensuel */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Rapport mensuel PDF</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleRapport} variant="outline" className="w-full">📊 Générer</Button>
          </CardContent>
        </Card>
      </div>

      {rapport && (
        <>
          <div className="flex gap-2 print:hidden"><Button onClick={() => window.print()}>🖨️ PDF</Button></div>
          <div className="bg-card border rounded-xl p-8 print:border-none print:p-0">
            <div className="text-center border-b-2 border-[#1B6B9E] pb-4 mb-6">
              <img src="/logo.jpg" alt="" className="w-16 h-16 mx-auto mb-2 rounded" />
              <h2 className="text-xl font-bold text-[#1B6B9E]">IMMOSTAR SCI</h2>
              <h3 className="text-lg font-bold mt-2">RAPPORT MENSUEL — {rapport.periode}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg text-center"><div className="text-xl font-bold text-emerald-700">{rapport.totalEncaisse.toLocaleString()} FCFA</div><p className="text-xs text-muted-foreground">Encaissé</p></div>
              <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg text-center"><div className="text-xl font-bold text-red-600">{rapport.totalPenalites.toLocaleString()} FCFA</div><p className="text-xs text-muted-foreground">Pénalités</p></div>
              <div className="bg-sky-50 dark:bg-sky-950/20 p-3 rounded-lg text-center"><div className="text-xl font-bold text-sky-700">{rapport.tauxOccupation}%</div><p className="text-xs text-muted-foreground">Occupation</p></div>
              <div className="bg-muted p-3 rounded-lg text-center"><div className="text-xl font-bold">{rapport.nombrePaiements}</div><p className="text-xs text-muted-foreground">Paiements</p></div>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="p-2 text-left text-xs">Locataire</th><th className="p-2 text-center text-xs">Appart.</th><th className="p-2 text-right text-xs">Montant</th><th className="p-2 text-center text-xs">Mode</th><th className="p-2 text-center text-xs">Statut</th></tr></thead>
                <tbody className="divide-y">
                  {rapport.paiements.map((p: any, i: number) => (
                    <tr key={i}><td className="p-2">{p.locataire}</td><td className="p-2 text-center">{p.appartement}</td><td className="p-2 text-right font-medium">{p.montant.toLocaleString()} FCFA</td><td className="p-2 text-center text-xs">{p.mode === "VIREMENT_BANCAIRE" ? "Virement" : "Orange Money"}</td><td className="p-2 text-center"><span className={`text-xs px-2 py-0.5 rounded-full ${p.statut === "PAYE" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>{p.statut === "PAYE" ? "Payé" : "Partiel"}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 pt-4 border-t flex justify-between text-xs text-muted-foreground">
              <p>IMMOSTAR SCI — Généré par ImmoGest le {new Date().toLocaleDateString("fr-FR")}</p>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=ImmoGest-${rapport.periode}`} alt="QR" className="w-10 h-10" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
