import { getRapportCautions } from "@/actions/rapports";
import { formatFCFA } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CautionsPage() {
  const data = await getRapportCautions();

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-xl font-bold text-foreground">Rapport des cautions</h1>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-5 text-center"><div className="text-2xl font-bold text-foreground">{formatFCFA(data.totalCautionsActives)}</div><p className="text-xs text-muted-foreground">Total cautions actives</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><div className="text-2xl font-bold text-emerald-600">{formatFCFA(data.totalPayees)}</div><p className="text-xs text-muted-foreground">Payées</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><div className="text-2xl font-bold text-red-600">{formatFCFA(data.totalNonPayees)}</div><p className="text-xs text-muted-foreground">Non payées</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Locataires actifs</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.actifs.map((r, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50">
                <div><span className="font-medium text-foreground">{r.locataire}</span><span className="text-muted-foreground text-sm ml-2">({r.logement})</span></div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-foreground">{formatFCFA(r.caution)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.payee ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400" : "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400"}`}>{r.payee ? "✅ Payée" : "❌ Non payée"}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
