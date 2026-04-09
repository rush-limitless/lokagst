import { getMesPaiements, getMesPenalites } from "@/actions/portail-locataire";
import { formatFCFA, formatDate, MODE_PAIEMENT_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SoumettrePreuveForm } from "./soumettre-form";
import Link from "next/link";

export default async function MesPaiements() {
  const [paiements, penalites] = await Promise.all([getMesPaiements(), getMesPenalites()]);
  const totalPaye = paiements.reduce((s, p) => s + p.montant, 0);
  const penalitesImpayees = penalites.filter((p) => !p.payee);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Mes paiements</h1>

      <SoumettrePreuveForm />

      {/* Résumé */}
      <div className="grid grid-cols-2 gap-3">
        <Card><CardContent className="pt-5 text-center"><p className="text-xs text-muted-foreground">Total pay&eacute;</p><p className="text-lg font-bold text-emerald-600">{formatFCFA(totalPaye)}</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><p className="text-xs text-muted-foreground">P&eacute;nalit&eacute;s impay&eacute;es</p><p className="text-lg font-bold text-red-600">{formatFCFA(penalitesImpayees.reduce((s, p) => s + p.montant, 0))}</p></CardContent></Card>
      </div>

      {/* Pénalités */}
      {penalitesImpayees.length > 0 && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-red-600">P&eacute;nalit&eacute;s en cours</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {penalitesImpayees.map((p) => (
                <div key={p.id} className="flex justify-between text-sm p-2 bg-red-50 dark:bg-red-950/20 rounded">
                  <span>{formatDate(p.moisConcerne)} — {p.motif}</span>
                  <span className="font-medium text-red-600">{formatFCFA(p.montant)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historique paiements */}
      {paiements.length === 0 ? <p className="text-muted-foreground">Aucun paiement enregistr&eacute;.</p> : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 text-left text-sm text-muted-foreground">
              <tr><th className="p-3">Mois</th><th className="p-3">Montant</th><th className="p-3">Mode</th><th className="p-3">Date</th><th className="p-3">Statut</th><th className="p-3">Re&ccedil;u</th></tr>
            </thead>
            <tbody className="divide-y">
              {paiements.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="p-3 text-sm">{formatDate(p.moisConcerne)}</td>
                  <td className="p-3 font-medium text-sm">{formatFCFA(p.montant)}</td>
                  <td className="p-3 text-sm">{MODE_PAIEMENT_LABELS[p.modePaiement] || p.modePaiement}</td>
                  <td className="p-3 text-sm">{formatDate(p.datePaiement)}</td>
                  <td className="p-3"><Badge variant={p.statut === "PAYE" ? "outline" : "destructive"} className={p.statut === "PAYE" ? "text-emerald-600 border-emerald-300" : ""}>{p.statut === "PAYE" ? "Pay&eacute;" : "Partiel"}</Badge></td>
                  <td className="p-3">
                    {p.statut === "PAYE" && <Link href={`/mon-espace/paiements/recu?id=${p.id}`} className="text-primary text-xs hover:underline">📄 Re&ccedil;u</Link>}
                    {p.preuvePaiement && <a href={p.preuvePaiement} target="_blank" className="text-muted-foreground text-xs hover:underline ml-2">📎</a>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
