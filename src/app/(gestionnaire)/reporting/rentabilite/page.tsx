import { getRentabiliteParAppartement, getRevenusVsImpayes } from "@/actions/rapports";
import { formatFCFA } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenusImpayesChart } from "./chart";

const ETAGE_LABELS: Record<string, string> = { RDC: "RDC", PREMIER: "1er", DEUXIEME: "2ème", TROISIEME: "3ème", QUATRIEME: "4ème" };

export default async function RentabilitePage() {
  const [rentabilite, revenusImpayes] = await Promise.all([getRentabiliteParAppartement(), getRevenusVsImpayes(12)]);

  const meilleurs = rentabilite.slice(0, 5);
  const pires = [...rentabilite].sort((a, b) => a.rentabilite - b.rentabilite).slice(0, 5);

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-xl font-bold text-foreground">Rentabilité & Revenus</h1>

      <Card>
        <CardHeader><CardTitle className="text-sm">Revenus vs Impayés (12 mois)</CardTitle></CardHeader>
        <CardContent><RevenusImpayesChart data={revenusImpayes} /></CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm text-emerald-600">🏆 Appartements les plus rentables</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {meilleurs.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/10">
                  <span className="text-lg font-bold text-emerald-600 w-6">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{r.logement} <span className="text-muted-foreground">({ETAGE_LABELS[r.etage]})</span></p>
                    <p className="text-xs text-muted-foreground">{r.locataire}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600">{r.rentabilite}%</div>
                    <p className="text-[10px] text-muted-foreground">{formatFCFA(r.regle)} / {formatFCFA(r.attendu)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-red-600">⚠️ Appartements les moins rentables</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pires.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-red-50/50 dark:bg-red-950/10">
                  <span className="text-lg font-bold text-red-600 w-6">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{r.logement} <span className="text-muted-foreground">({ETAGE_LABELS[r.etage]})</span></p>
                    <p className="text-xs text-muted-foreground">{r.locataire}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600">{r.rentabilite}%</div>
                    <p className="text-[10px] text-muted-foreground">Manque: {formatFCFA(Math.abs(r.difference))}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Détail par appartement</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
              <tr><th className="p-2 text-left">Logement</th><th className="p-2">Étage</th><th className="p-2">Locataire</th><th className="p-2 text-right">Loyer</th><th className="p-2 text-center">Mois</th><th className="p-2 text-right">Attendu</th><th className="p-2 text-right">Réglé</th><th className="p-2 text-center">Rentabilité</th></tr>
            </thead>
            <tbody className="divide-y">
              {rentabilite.map((r, i) => (
                <tr key={i} className="hover:bg-muted/30">
                  <td className="p-2 font-medium">{r.logement}</td>
                  <td className="p-2 text-center text-muted-foreground">{ETAGE_LABELS[r.etage]}</td>
                  <td className="p-2 text-muted-foreground">{r.locataire}</td>
                  <td className="p-2 text-right">{formatFCFA(r.totalMensuel)}</td>
                  <td className="p-2 text-center">{r.moisOccupation}</td>
                  <td className="p-2 text-right">{formatFCFA(r.attendu)}</td>
                  <td className="p-2 text-right font-medium">{formatFCFA(r.regle)}</td>
                  <td className="p-2 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.rentabilite >= 90 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : r.rentabilite >= 50 ? "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400" : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"}`}>{r.rentabilite}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
