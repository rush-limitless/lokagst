import { getFinancesStats } from "@/actions/finances";
import { formatFCFA } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinancesBarChart, ImpayesChart } from "@/components/charts/finances-charts";
import Link from "next/link";
import { ReportingNav } from "@/components/reporting-nav";

const MODE_LABELS: Record<string, string> = { VIREMENT_BANCAIRE: "Virement bancaire", ORANGE_MONEY: "Orange Money" };

export default async function FinancesPage({ searchParams }: { searchParams: Promise<{ annee?: string }> }) {
  const { annee } = await searchParams;
  const year = annee ? parseInt(annee) : new Date().getFullYear();
  const stats = await getFinancesStats(year);
  const t = stats.totaux;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">💰 Tableau de bord financier</h1>
          <p className="text-sm text-muted-foreground">{stats.nbBauxActifs} baux actifs · Revenu mensuel attendu : {formatFCFA(stats.revenuMensuelAttendu)}</p>
        </div>
        <div className="flex gap-2">
          {[year - 1, year, year + 1].filter((y) => y <= new Date().getFullYear()).map((y) => (
            <Link key={y} href={`/finances?annee=${y}`} className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${y === year ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{y}</Link>
          ))}
        </div>
      </div>

      {/* Reporting sub-nav */}
      <ReportingNav />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="pt-5">
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium uppercase tracking-wider">Total encaissé</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{formatFCFA(t.totalEncaisse)}</p>
            <p className="text-xs text-emerald-600/70 mt-1">sur {formatFCFA(t.totalAttendu)} attendu</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-5">
            <p className="text-[11px] text-red-600 dark:text-red-400 font-medium uppercase tracking-wider">Impayés</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{formatFCFA(Math.max(0, t.totalAttendu - t.totalEncaisse))}</p>
            <p className="text-xs text-red-600/70 mt-1">{stats.impayesParLocataire.length} locataire(s) en retard</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/30 dark:to-sky-900/20 border-sky-200 dark:border-sky-800">
          <CardContent className="pt-5">
            <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium uppercase tracking-wider">Taux de recouvrement</p>
            <p className="text-2xl font-bold text-sky-700 dark:text-sky-300 mt-1">{t.tauxRecouvrement}%</p>
            <div className="mt-2 bg-sky-200/50 dark:bg-sky-800/30 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full" style={{ width: `${Math.min(100, t.tauxRecouvrement)}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20 border-violet-200 dark:border-violet-800">
          <CardContent className="pt-5">
            <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium uppercase tracking-wider">Dépenses</p>
            <p className="text-2xl font-bold text-violet-700 dark:text-violet-300 mt-1">{formatFCFA(t.totalDepenses)}</p>
            <p className="text-xs text-violet-600/70 mt-1"><Link href="/depenses" className="hover:underline">Voir détail →</Link></p>
          </CardContent>
        </Card>
      </div>

      {/* Résultat net */}
      <Card className={t.resultatNet >= 0 ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/10" : "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10"}>
        <CardContent className="pt-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Résultat net {year}</p>
            <p className="text-xs text-muted-foreground">Revenus ({formatFCFA(t.totalEncaisse)}) − Dépenses ({formatFCFA(t.totalDepenses)})</p>
          </div>
          <p className={`text-2xl font-bold ${t.resultatNet >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatFCFA(t.resultatNet)}</p>
        </CardContent>
      </Card>

      {/* Détail revenus */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-5 text-center"><p className="text-xs text-muted-foreground">Loyers encaissés</p><p className="text-lg font-bold text-foreground mt-1">{formatFCFA(t.totalLoyers)}</p><p className="text-[10px] text-muted-foreground">/ {formatFCFA(t.totalLoyersAttendus)}</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><p className="text-xs text-muted-foreground">Charges encaissées</p><p className="text-lg font-bold text-foreground mt-1">{formatFCFA(t.totalCharges)}</p><p className="text-[10px] text-muted-foreground">/ {formatFCFA(t.totalChargesAttendues)}</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><p className="text-xs text-muted-foreground">Cautions</p><p className="text-lg font-bold text-foreground mt-1">{formatFCFA(t.totalCautions)}</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><p className="text-xs text-muted-foreground">Autres</p><p className="text-lg font-bold text-foreground mt-1">{formatFCFA(t.totalAutres)}</p></CardContent></Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Revenus mensuels par catégorie</CardTitle></CardHeader>
          <CardContent><FinancesBarChart data={stats.parMois} /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Encaissé vs Impayé par mois</CardTitle></CardHeader>
          <CardContent><ImpayesChart data={stats.parMois} /></CardContent>
        </Card>
      </div>

      {/* Répartition par mode + Top impayés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Répartition par mode de paiement</CardTitle></CardHeader>
          <CardContent>
            {Object.entries(stats.parMode).length === 0 ? (
              <p className="text-muted-foreground text-center py-6 text-sm">Aucun paiement</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.parMode).map(([mode, montant]) => {
                  const pct = t.totalEncaisse > 0 ? Math.round((montant / t.totalEncaisse) * 100) : 0;
                  return (
                    <div key={mode}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{MODE_LABELS[mode] || mode}</span>
                        <span className="font-medium">{formatFCFA(montant)} ({pct}%)</span>
                      </div>
                      <div className="bg-muted rounded-full h-2 overflow-hidden">
                        <div className={`h-full rounded-full ${mode === "ORANGE_MONEY" ? "bg-orange-500" : "bg-sky-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Top impayés</CardTitle></CardHeader>
          <CardContent className="max-h-80 overflow-y-auto">
            {stats.impayesParLocataire.length === 0 ? (
              <div className="text-center py-6"><div className="text-3xl mb-2">✅</div><p className="text-muted-foreground text-sm">Tous les locataires sont à jour</p></div>
            ) : (
              <div className="space-y-2">
                {stats.impayesParLocataire.map((l, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-sm">
                    <div>
                      <p className="font-medium text-foreground">{l.locataire}</p>
                      <p className="text-xs text-muted-foreground">{l.appartement} · Taux : {l.taux}%</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">{formatFCFA(l.du)}</Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">/ {formatFCFA(l.attendu)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
