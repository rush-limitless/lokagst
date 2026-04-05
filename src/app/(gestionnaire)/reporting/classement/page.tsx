import { ReportingNav } from "@/components/reporting-nav";
import { getTopPayeurs, getRecouvrementParEtage } from "@/actions/rapports";
import { formatFCFA } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecouvrementChart } from "./recouvrement-chart";

const ETAGE_LABELS: Record<string, string> = { RDC: "RDC", PREMIER: "Étage 1", DEUXIEME: "Étage 2", TROISIEME: "Étage 3", QUATRIEME: "Étage 4" };

export default async function ClassementPage() {
  const [payeurs, recouvrement] = await Promise.all([getTopPayeurs(), getRecouvrementParEtage()]);

  const meilleurs = payeurs.slice(0, 5);
  const pires = [...payeurs].sort((a, b) => a.taux - b.taux).slice(0, 5);
  const chartData = recouvrement.map((r) => ({ etage: ETAGE_LABELS[r.etage] || r.etage, taux: r.taux, attendu: r.attendu, regle: r.regle }));

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-xl font-bold text-foreground">Classement & Recouvrement</h1>
      <ReportingNav />

      <Card>
        <CardHeader><CardTitle className="text-sm">Taux de recouvrement par étage</CardTitle></CardHeader>
        <CardContent><RecouvrementChart data={chartData} /></CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm text-emerald-600">🏆 Top 5 meilleurs payeurs</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {meilleurs.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/10">
                  <span className="text-lg font-bold text-emerald-600 w-6">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{r.locataire}</p>
                    <p className="text-xs text-muted-foreground">{r.logement}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600">{r.taux}%</div>
                    <p className="text-[10px] text-muted-foreground">{formatFCFA(r.regle)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm text-red-600">⚠️ Top 5 retardataires</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pires.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-red-50/50 dark:bg-red-950/10">
                  <span className="text-lg font-bold text-red-600 w-6">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{r.locataire}</p>
                    <p className="text-xs text-muted-foreground">{r.logement}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600">{r.taux}%</div>
                    <p className="text-[10px] text-muted-foreground">Dû: {formatFCFA(r.attendu - r.regle)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
