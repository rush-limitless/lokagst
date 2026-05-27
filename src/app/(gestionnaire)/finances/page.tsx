import { getFinancesStats } from "@/actions/finances";
import { formatFCFA } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FinancesBarChart, ImpayesChart } from "@/components/charts/lazy-finances-charts";
import Link from "next/link";
import { ReportingNav } from "@/components/reporting-nav";
import {
  TrendingUp, TrendingDown, AlertTriangle, Percent, Wallet,
  ArrowUpRight, Banknote, CreditCard, PiggyBank,
} from "lucide-react";

const MODE_LABELS: Record<string, string> = { VIREMENT_BANCAIRE: "Virement bancaire", MOBILE_MONEY: "Mobile money", ESPECES: "Espèces" };
const MODE_ICONS: Record<string, React.ReactNode> = {
  VIREMENT_BANCAIRE: <Banknote className="size-4 text-sky-600" />,
  MOBILE_MONEY: <CreditCard className="size-4 text-orange-600" />,
  ESPECES: <PiggyBank className="size-4 text-emerald-600" />,
};

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
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2"><TrendingUp className="size-6 text-primary" /> Tableau de bord financier</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{stats.nbBauxActifs} baux actifs · Revenu mensuel attendu : {formatFCFA(stats.revenuMensuelAttendu)}</p>
        </div>
        <div className="flex gap-1.5">
          {[year - 1, year, year + 1].filter((y) => y <= new Date().getFullYear()).map((y) => (
            <Link key={y} href={`/finances?annee=${y}`} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${y === year ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground hover:bg-muted border-border"}`}>{y}</Link>
          ))}
        </div>
      </div>

      <ReportingNav />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-in">
        <Card className="hover:shadow-md transition-all">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center"><Wallet className="size-5 text-emerald-600" /></div>
              <span className="inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                <ArrowUpRight className="size-3" />{t.tauxRecouvrement}%
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-3">{formatFCFA(t.totalEncaisse)}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total encaissé</p>
            <p className="text-[10px] text-muted-foreground mt-1">sur {formatFCFA(t.totalAttendu)} attendu</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center"><AlertTriangle className="size-5 text-red-600" /></div>
              {stats.impayesParLocataire.length > 0 && <Badge variant="destructive" className="text-[10px]">{stats.impayesParLocataire.length}</Badge>}
            </div>
            <p className="text-2xl font-bold text-foreground mt-3">{formatFCFA(Math.max(0, t.totalAttendu - t.totalEncaisse))}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Impayés</p>
            <p className="text-[10px] text-muted-foreground mt-1">{stats.impayesParLocataire.length} locataire(s) en retard</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center"><Percent className="size-5 text-sky-600" /></div>
            </div>
            <p className="text-2xl font-bold text-foreground mt-3">{t.tauxRecouvrement}%</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Taux de recouvrement</p>
            <div className="mt-2 bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${Math.min(100, t.tauxRecouvrement)}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center"><PiggyBank className="size-5 text-violet-600" /></div>
            </div>
            <p className="text-2xl font-bold text-foreground mt-3">{formatFCFA(t.totalDepenses)}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Dépenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Résultat net + Income Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className={`lg:col-span-2 ${t.resultatNet >= 0 ? "border-emerald-200 dark:border-emerald-800" : "border-red-200 dark:border-red-800"}`}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Résultat net {year}</p>
                <p className={`text-3xl font-bold mt-1 ${t.resultatNet >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatFCFA(t.resultatNet)}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.resultatNet >= 0 ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-red-100 dark:bg-red-900/40"}`}>
                {t.resultatNet >= 0 ? <TrendingUp className="size-6 text-emerald-600" /> : <TrendingDown className="size-6 text-red-600" />}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Encaissé</p><p className="text-sm font-bold text-emerald-600 mt-1">{formatFCFA(t.totalEncaisse)}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cautions</p><p className="text-sm font-bold text-violet-600 mt-1">−{formatFCFA(t.totalCautions)}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Dépenses</p><p className="text-sm font-bold text-red-600 mt-1">−{formatFCFA(t.totalDepenses)}</p></div>
            </div>
          </CardContent>
        </Card>

        {/* Income Sources */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Sources de revenus</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">Total : <span className="font-semibold text-foreground">{formatFCFA(t.totalEncaisse)}</span></p>
            <div className="space-y-3">
              {[
                { label: "Loyers", value: t.totalLoyers, color: "bg-emerald-500" },
                { label: "Charges", value: t.totalCharges, color: "bg-amber-500" },
                { label: "Cautions", value: t.totalCautions, color: "bg-violet-500" },
                { label: "Autres", value: t.totalAutres, color: "bg-sky-500" },
              ].filter((s) => s.value > 0).map((source) => {
                const pct = t.totalEncaisse > 0 ? Math.round((source.value / t.totalEncaisse) * 100) : 0;
                return (
                  <div key={source.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{source.label}</span>
                      <span className="font-medium text-foreground">{formatFCFA(source.value)}</span>
                    </div>
                    <div className="bg-muted rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${source.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
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

      {/* Mode paiement + Top impayés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Répartition par mode de paiement</CardTitle></CardHeader>
          <CardContent>
            {Object.entries(stats.parMode).length === 0 ? (
              <p className="text-muted-foreground text-center py-6 text-sm">Aucun paiement</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(stats.parMode).map(([mode, montant]) => {
                  const pct = t.totalEncaisse > 0 ? Math.round((montant / t.totalEncaisse) * 100) : 0;
                  return (
                    <div key={mode}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <div className="flex items-center gap-2">
                          {MODE_ICONS[mode]}
                          <span className="font-medium">{MODE_LABELS[mode] || mode}</span>
                        </div>
                        <span className="text-muted-foreground">{formatFCFA(montant)} <span className="text-xs">({pct}%)</span></span>
                      </div>
                      <div className="bg-muted rounded-full h-2 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${mode === "MOBILE_MONEY" ? "bg-orange-500" : "bg-sky-500"}`} style={{ width: `${pct}%` }} />
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
                  <div key={i} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center text-[10px] font-bold">{i + 1}</div>
                      <div>
                        <p className="font-medium text-foreground">{l.locataire}</p>
                        <p className="text-xs text-muted-foreground">{l.appartement} · Taux : {l.taux}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">{formatFCFA(l.du)}</Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">/ {formatFCFA(l.attendu)}</p>
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
