import { getBilanImpayes } from "@/actions/rapports";
import { formatFCFA } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

const ETAGE_LABELS: Record<string, string> = { RDC: "RDC", PREMIER: "1er", DEUXIEME: "2ème", TROISIEME: "3ème", QUATRIEME: "4ème" };

export default async function ImpayesPage() {
  const impayes = await getBilanImpayes();
  const totalDu = impayes.reduce((s, r) => s + r.totalDu, 0);
  const totalPenalites = impayes.reduce((s, r) => s + r.penalites, 0);

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-xl font-bold text-foreground">Bilan des impayés</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-5 text-center"><div className="text-2xl font-bold text-red-600">{impayes.length}</div><p className="text-xs text-muted-foreground">Locataires en retard</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><div className="text-2xl font-bold text-red-600">{formatFCFA(totalDu)}</div><p className="text-xs text-muted-foreground">Total dû</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><div className="text-2xl font-bold text-orange-600">{formatFCFA(totalPenalites)}</div><p className="text-xs text-muted-foreground">Pénalités cumulées</p></CardContent></Card>
      </div>

      {impayes.length === 0 ? (
        <div className="text-center py-12"><div className="text-5xl mb-4">✅</div><h3 className="text-lg font-semibold">Aucun impayé</h3><p className="text-muted-foreground">Tous les locataires sont à jour</p></div>
      ) : (
        <div className="bg-card rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
              <tr><th className="p-3 text-left">Locataire</th><th className="p-3">Logement</th><th className="p-3">Étage</th><th className="p-3 text-right">Loyer</th><th className="p-3 text-center">Mois impayés</th><th className="p-3 text-right">Montant dû</th><th className="p-3 text-right">Pénalités</th><th className="p-3 text-right">Total dû</th><th className="p-3">Statut</th></tr>
            </thead>
            <tbody className="divide-y">
              {impayes.map((r, i) => (
                <tr key={i} className="hover:bg-red-50/50 dark:hover:bg-red-950/10">
                  <td className="p-3 font-medium text-foreground">{r.locataire}</td>
                  <td className="p-3 text-center text-muted-foreground">{r.logement}</td>
                  <td className="p-3 text-center text-muted-foreground">{ETAGE_LABELS[r.etage]}</td>
                  <td className="p-3 text-right">{formatFCFA(r.loyerMensuel)}</td>
                  <td className="p-3 text-center"><span className="bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-bold">{r.moisImpayes}</span></td>
                  <td className="p-3 text-right font-medium text-red-600">{formatFCFA(r.montantDu)}</td>
                  <td className="p-3 text-right text-orange-600">{formatFCFA(r.penalites)}</td>
                  <td className="p-3 text-right font-bold text-red-700">{formatFCFA(r.totalDu)}</td>
                  <td className="p-3"><StatusBadge status={r.statut === "SUSPENDU" ? "suspendu" : "urgente"} label={r.statut === "SUSPENDU" ? "Suspendu" : "Impayé"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
