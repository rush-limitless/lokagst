"use client";

import { Tabs } from "@/components/tabs";
import { formatFCFA, formatDate, STATUT_BAIL_LABELS, MODE_PAIEMENT_LABELS, PERIODICITE_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import { ModifierLocataireForm } from "./modifier-form";

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

export function ProfilTabs({ locataire: loc, situation }: { locataire: Locataire; situation: Situation }) {
  const allPaiements = loc.baux.flatMap((b) => b.paiements.map((p) => ({ ...p, bail: { ...b, montantLoyer: b.montantLoyer, totalCharges: b.totalCharges } }))).sort((a, b) => new Date(b.moisConcerne).getTime() - new Date(a.moisConcerne).getTime());
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
            <Card><CardContent className="pt-6 text-center"><div className={`text-2xl font-bold ${situation.totalDu > 0 ? "text-red-600" : "text-emerald-600"}`}>{formatFCFA(situation.totalDu)}</div><p className="font-medium">Total dû</p>{situation.penalites.montant > 0 && <p className="text-xs text-red-500">dont {formatFCFA(situation.penalites.montant)} pénalités</p>}</CardContent></Card>
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
                  <p className="text-xs text-muted-foreground mt-2">{b.paiements.length} paiement(s) enregistré(s)</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ),
    },
    {
      id: "paiements", label: `Paiements (${allPaiements.length})`, icon: "💰",
      content: (
        <div>
          {allPaiements.length === 0 ? <p className="text-muted-foreground text-center py-8">Aucun paiement</p> : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
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
                  {allPaiements.map((p) => (
                    <tr key={p.id} className="border-t hover:bg-muted/30">
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
          {allPaiements.length > 0 && (
            <div className="mt-4 text-right text-sm">
              <span className="text-muted-foreground">Total encaissé : </span>
              <span className="font-bold text-emerald-600">{formatFCFA(allPaiements.reduce((s, p) => s + p.montant, 0))}</span>
            </div>
          )}
        </div>
      ),
    },
  ];

  return <Tabs tabs={tabs} defaultTab="situation" />;
}
