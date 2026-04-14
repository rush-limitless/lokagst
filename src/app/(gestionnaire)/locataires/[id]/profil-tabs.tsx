"use client";

import { Tabs } from "@/components/tabs";
import { formatFCFA, formatDate, STATUT_BAIL_LABELS, MODE_PAIEMENT_LABELS, PERIODICITE_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import { ModifierLocataireForm } from "./modifier-form";
import { useState } from "react";
import { supprimerPaiement } from "@/actions/paiements";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Bail = {
  id: string; dateDebut: Date; dateFin: Date; montantLoyer: number; montantCaution: number;
  totalCharges: number; totalMensuel: number; periodicite: string; statut: string;
  appartement: { id: string; numero: string; etage: string };
  paiements: { id: string; montant: number; montantLoyer: number; montantCharges: number; montantCaution: number; moisConcerne: Date; datePaiement: Date; modePaiement: string; statut: string }[];
  penalites: { id: string; montant: number; moisConcerne: Date; motif: string; payee: boolean }[];
};

type Situation = {
  caution: { montant: number; payee: boolean };
  loyer: { aJour: boolean; moisImpayes: number; montantDu: number };
  charges: { aJour: boolean; montantDu: number };
  penalites: { montant: number; nombre: number };
  totalDu: number;
} | null;

type Locataire = {
  id: string; nom: string; prenom: string; telephone: string; email: string | null;
  numeroCNI: string | null; photo: string | null; garant: string | null; telGarant: string | null;
  notes: string | null; statut: string; dateEntree: Date; dateSortie: Date | null;
  baux: Bail[]; utilisateur: any;
};

function PaiementsTab({ locataire: loc }: { locataire: Locataire }) {
  const router = useRouter();
  const allPaiements = loc.baux.flatMap((b) => b.paiements.map((p) => ({ ...p, bail: { ...b, montantLoyer: b.montantLoyer, totalCharges: b.totalCharges } }))).sort((a, b) => new Date(b.moisConcerne).getTime() - new Date(a.moisConcerne).getTime());

  const years = Array.from(new Set(allPaiements.map((p) => new Date(p.moisConcerne).getFullYear()))).sort((a, b) => b - a);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filtered = selectedYear ? allPaiements.filter((p) => new Date(p.moisConcerne).getFullYear() === selectedYear) : allPaiements;

  function toggleSelect(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }
  function toggleAll() {
    setSelected(selected.length === filtered.length ? [] : filtered.map((p) => p.id));
  }
  async function handleBatchDelete() {
    setDeleting(true);
    for (const id of selected) { await supprimerPaiement(id); }
    setDeleting(false); setSelected([]); setShowConfirm(false);
    toast.success(`${selected.length} paiement(s) supprimé(s)`);
    router.refresh();
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        {years.length > 1 && <>
          <button onClick={() => setSelectedYear(null)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!selectedYear ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Toutes ({allPaiements.length})</button>
          {years.map((y) => (
            <button key={y} onClick={() => setSelectedYear(y)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selectedYear === y ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
              {y} ({allPaiements.filter((p) => new Date(p.moisConcerne).getFullYear() === y).length})
            </button>
          ))}
        </>}
        {selected.length > 0 && (
          <button onClick={() => setShowConfirm(true)} className="ml-auto text-xs px-3 py-1.5 rounded-full bg-red-500 text-white hover:bg-red-600">🗑️ Supprimer ({selected.length})</button>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-card rounded-xl p-6 max-w-sm w-full shadow-xl border space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-foreground">⚠️ Supprimer {selected.length} paiement(s)</h3>
            <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
            <div className="flex gap-2">
              <button onClick={handleBatchDelete} disabled={deleting} className="flex-1 bg-red-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-600 disabled:opacity-50">{deleting ? "Suppression..." : "Confirmer"}</button>
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 border rounded-lg text-sm">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? <p className="text-muted-foreground text-center py-8">Aucun paiement</p> : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 w-8"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded" /></th>
                <th className="text-left p-3 font-medium">Mois</th>
                <th className="text-left p-3 font-medium">Appart.</th>
                <th className="text-right p-3 font-medium">Loyer</th>
                <th className="text-right p-3 font-medium">Charges</th>
                <th className="text-right p-3 font-medium">Total</th>
                <th className="text-left p-3 font-medium">Mode</th>
                <th className="text-left p-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className={`border-t hover:bg-muted/30 cursor-pointer ${selected.includes(p.id) ? "bg-primary/5" : ""}`} onClick={() => window.location.href = `/paiements/${p.id}`}>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} className="rounded" /></td>
                  <td className="p-3">{formatDate(p.moisConcerne)}</td>
                  <td className="p-3 text-muted-foreground">{p.bail.appartement.numero}</td>
                  <td className="p-3 text-right">{formatFCFA(p.montantLoyer || p.bail.montantLoyer)}</td>
                  <td className="p-3 text-right">{formatFCFA(p.montantCharges || p.bail.totalCharges)}</td>
                  <td className="p-3 text-right font-medium">{formatFCFA(p.montant)}</td>
                  <td className="p-3">{MODE_PAIEMENT_LABELS[p.modePaiement]}</td>
                  <td className="p-3"><Badge variant={p.statut === "PAYE" ? "outline" : "destructive"} className={p.statut === "PAYE" ? "text-emerald-600" : ""}>{p.statut === "PAYE" ? "Payé" : "Partiel"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {filtered.length > 0 && (
        <div className="mt-4 space-y-1 text-right text-sm">
          <div>
            <span className="text-muted-foreground">Total paiements : </span>
            <span className="font-bold text-emerald-600">{formatFCFA(filtered.reduce((s, p) => s + p.montant, 0))}</span>
          </div>
          {(() => {
            // Caution = montant du bail le plus récent (pas la somme de tous les baux)
            // Car le locataire ne paye que le complément lors d'un renouvellement
            const bauxTries = [...loc.baux].sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime());
            const bailRecent = bauxTries[0];
            const cautionActuelle = bailRecent?.montantCaution || 0;
            const showCaution = cautionActuelle > 0 && (!selectedYear || new Date(bailRecent.dateDebut).getFullYear() === selectedYear || !selectedYear);
            if (showCaution && !selectedYear) return (
              <>
                <div><span className="text-muted-foreground">Caution versée : </span><span className="font-medium">{formatFCFA(cautionActuelle)}</span></div>
                <div><span className="text-muted-foreground">Total encaissé (paiements + caution) : </span><span className="font-bold text-emerald-600 text-base">{formatFCFA(filtered.reduce((s, p) => s + p.montant, 0) + cautionActuelle)}</span></div>
              </>
            );
            if (showCaution && selectedYear && new Date(bailRecent.dateDebut).getFullYear() === selectedYear) return (
              <>
                <div><span className="text-muted-foreground">Caution versée : </span><span className="font-medium">{formatFCFA(cautionActuelle)}</span></div>
                <div><span className="text-muted-foreground">Total encaissé (paiements + caution) : </span><span className="font-bold text-emerald-600 text-base">{formatFCFA(filtered.reduce((s, p) => s + p.montant, 0) + cautionActuelle)}</span></div>
              </>
            );
            return null;
          })()}
        </div>
      )}
    </div>
  );
}

export function ProfilTabs({ locataire: loc, situation }: { locataire: Locataire; situation: Situation }) {
  const allPenalites = loc.baux.flatMap((b) => b.penalites);

  const tabs = [
    {
      id: "infos", label: "Informations", icon: "👤",
      content: <ModifierLocataireForm locataire={loc} />,
    },
    {
      id: "situation", label: "Situation", icon: "📊",
      content: situation ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-6 text-center"><div className="text-3xl mb-1">{situation.caution.payee ? "✅" : "❌"}</div><p className="font-medium">Caution</p><p className="text-sm text-muted-foreground">{formatFCFA(situation.caution.montant)}</p></CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><div className="text-3xl mb-1">{situation.loyer.aJour ? "✅" : "❌"}</div><p className="font-medium">Loyer</p>{situation.loyer.aJour ? <p className="text-sm text-emerald-600">À jour</p> : <p className="text-sm text-red-600">{situation.loyer.moisImpayes} mois — {formatFCFA(situation.loyer.montantDu)}</p>}</CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><div className="text-3xl mb-1">{situation.charges.aJour ? "✅" : "❌"}</div><p className="font-medium">Charges</p>{situation.charges.aJour ? <p className="text-sm text-emerald-600">À jour</p> : <p className="text-sm text-red-600">{formatFCFA(situation.charges.montantDu)}</p>}</CardContent></Card>
            <Card><CardContent className="pt-6 text-center"><div className={`text-2xl font-bold ${situation.totalDu > 0 ? "text-red-600" : "text-emerald-600"}`}>{situation.totalDu > 0 ? formatFCFA(situation.totalDu) : `+${formatFCFA(Math.abs(situation.totalDu))}`}</div><p className="font-medium">{situation.totalDu > 0 ? "Total dû" : "Avance"}</p>{situation.penalites.montant > 0 && <p className="text-xs text-red-500">dont {formatFCFA(situation.penalites.montant)} pénalités</p>}</CardContent></Card>
          </div>
          {allPenalites.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Pénalités</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {allPenalites.map((p) => (
                    <div key={p.id} className="flex justify-between text-sm p-2 bg-red-50 dark:bg-red-950/20 rounded">
                      <span>{formatDate(p.moisConcerne)}</span>
                      <span>{p.motif}</span>
                      <span className="font-medium text-red-600">{formatFCFA(p.montant)}</span>
                      <Badge variant={p.payee ? "outline" : "destructive"}>{p.payee ? "Payée" : "Impayée"}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {/* Print individual debt invoice */}
          {situation.totalDu > 0 && (
            <div className="text-right">
              <a href={`/situation/facture-dettes?locataire=${loc.id}`} target="_blank" className="text-xs text-primary hover:underline">🖨️ Facture des dettes de ce locataire</a>
            </div>
          )}
        </div>
      ) : <p className="text-muted-foreground text-center py-8">Aucun bail actif</p>,
    },
    {
      id: "baux", label: `Baux (${loc.baux.length})`, icon: "📄",
      content: (
        <div className="space-y-3">
          {loc.baux.length === 0 ? <p className="text-muted-foreground text-center py-8">Aucun bail</p> : loc.baux.map((b) => (
            <Link key={b.id} href={`/baux/${b.id}`} className="block">
              <Card className="hover:shadow-md transition-all">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{b.appartement.numero}</span>
                      <StatusBadge status={b.statut.toLowerCase()} label={STATUT_BAIL_LABELS[b.statut]} animate={b.statut === "ACTIF"} />
                    </div>
                    <span className="text-sm text-muted-foreground">{PERIODICITE_LABELS[b.periodicite] || b.periodicite}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Période</span><p>{formatDate(b.dateDebut)} → {formatDate(b.dateFin)}</p></div>
                    <div><span className="text-muted-foreground">Loyer</span><p className="font-medium">{formatFCFA(b.montantLoyer)}</p></div>
                    <div><span className="text-muted-foreground">Charges</span><p>{formatFCFA(b.totalCharges)}</p></div>
                    <div><span className="text-muted-foreground">Caution</span><p>{formatFCFA(b.montantCaution)}</p></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{b.paiements.length} paiement(s)</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ),
    },
    {
      id: "paiements", label: `Paiements (${loc.baux.reduce((s, b) => s + b.paiements.length, 0)})`, icon: "💰",
      content: <PaiementsTab locataire={loc} />,
    },
  ];

  return <Tabs tabs={tabs} defaultTab="situation" />;
}
