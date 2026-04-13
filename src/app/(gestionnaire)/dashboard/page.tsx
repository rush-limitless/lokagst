import { getDashboardStats, getRevenusEvolution } from "@/actions/dashboard";
import { getDernieresActivites } from "@/actions/activites";
import { formatFCFA, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RevenusChart } from "@/components/charts/revenus-chart";
import { OccupationPie } from "@/components/charts/occupation-pie";
import Link from "next/link";
import { Home, TrendingUp, AlertTriangle, Key, Wallet, FileText, UserPlus, Clock, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

function GlassStatCard({ icon, iconBg, label, value, sub, valueColor }: { icon: ReactNode; iconBg: string; label: string; value: string; sub?: string; valueColor?: string }) {
  return (
    <div className="glass rounded-xl p-5 hover:shadow-lg transition-all hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${iconBg}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
          <p className={`text-xl md:text-2xl font-bold mt-0.5 count-up ${valueColor || "text-foreground"}`}>{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const [stats, evolution, activites] = await Promise.all([
    getDashboardStats(), getRevenusEvolution(6), getDernieresActivites(),
  ]);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Bonjour" : now.getHours() < 18 ? "Bon après-midi" : "Bonsoir";
  const pct = stats.appartements.tauxOccupation;

  return (
    <div className="space-y-6 animate-in">
      {/* Welcome banner with mesh gradient */}
      <div className="mesh-bg bg-gradient-to-br from-[#0d3b5e] to-[#1B6B9E] rounded-2xl p-6 text-white">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{greeting} 👋</h1>
              <p className="text-sky-200/80 text-sm mt-1">{now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/paiements/nouveau"><Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"><Wallet className="w-4 h-4 mr-1.5" /> Paiement</Button></Link>
              <Link href="/baux/nouveau"><Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm" variant="outline"><FileText className="w-4 h-4 mr-1.5" /> Bail</Button></Link>
              <Link href="/locataires/nouveau"><Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm" variant="outline"><UserPlus className="w-4 h-4 mr-1.5" /> Locataire</Button></Link>
            </div>
          </div>
          {/* Occupation progress bar */}
          <div className="mt-5 bg-white/10 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-300 to-emerald-400 rounded-full progress-animated" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-sky-200/60 text-xs mt-1.5">{pct}% d&apos;occupation — {stats.appartements.occupes}/{stats.appartements.total} appartements</p>
        </div>
      </div>

      {/* Glass stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 stagger-in">
        <GlassStatCard icon={<Home className="w-5 h-5 text-sky-600" />} iconBg="bg-sky-100 dark:bg-sky-900/40" label="Occupation" value={`${pct}%`} sub={`${stats.appartements.occupes}/${stats.appartements.total}`} />
        <GlassStatCard icon={<TrendingUp className="w-5 h-5 text-emerald-600" />} iconBg="bg-emerald-100 dark:bg-emerald-900/40" label={`Revenus — ${stats.finances.periode}`} value={formatFCFA(stats.finances.revenusMois)} sub={`Loyers: ${formatFCFA(stats.finances.revenusLoyers)} · Charges: ${formatFCFA(stats.finances.revenusCharges)} · Cautions: ${formatFCFA(stats.finances.revenusCautions)}`} valueColor="text-emerald-600 dark:text-emerald-400" />
        <GlassStatCard icon={<AlertTriangle className="w-5 h-5 text-red-600" />} iconBg="bg-red-100 dark:bg-red-900/40" label={`Impayés — ${stats.finances.periode}`} value={formatFCFA(stats.finances.impayesMois)} sub={`Loyers: ${formatFCFA(stats.finances.impayesLoyers)} · Charges: ${formatFCFA(stats.finances.impayesCharges)} · Cautions: ${formatFCFA(stats.finances.cautionsNonPayees)}`} valueColor="text-red-600 dark:text-red-400" />
        <GlassStatCard icon={<Key className="w-5 h-5 text-sky-600" />} iconBg="bg-sky-100 dark:bg-sky-900/40" label="Libres" value={`${stats.appartements.libres}`} sub="disponibles" valueColor="text-sky-600 dark:text-sky-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Évolution des revenus</CardTitle></CardHeader>
          <CardContent><RevenusChart data={evolution} /></CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Occupation</CardTitle></CardHeader>
          <CardContent><OccupationPie occupes={stats.appartements.occupes} libres={stats.appartements.libres} /></CardContent>
        </Card>
      </div>

      {/* Alerts + Activity with gradient border on important cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 stagger-in">
        <div className={stats.alertes.bauxExpirants.length > 0 ? "gradient-border" : ""}>
          <Card className="h-full">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Baux expirant bientôt</CardTitle></CardHeader>
            <CardContent className="max-h-52 overflow-y-auto">
              {stats.alertes.bauxExpirants.length === 0 ? (
                <div className="text-center py-6"><CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" /><p className="text-muted-foreground text-sm">Aucun dans les 30 prochains jours</p></div>
              ) : (
                <div className="space-y-2">
                  {stats.alertes.bauxExpirants.map((b) => (
                    <div key={b.bailId} className="flex justify-between items-center p-2.5 bg-orange-50 dark:bg-orange-950/20 rounded-lg text-sm">
                      <span className="font-medium text-foreground">{b.locataire} <span className="text-muted-foreground">({b.appartement})</span></span>
                      <Badge variant="outline" className="text-orange-600 border-orange-300">{b.joursRestants}j</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className={stats.alertes.impayesLocataires.length > 0 ? "gradient-border" : ""}>
          <Card className="h-full">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Impayés ce mois</CardTitle></CardHeader>
            <CardContent className="max-h-52 overflow-y-auto">
              {stats.alertes.impayesLocataires.length === 0 ? (
                <div className="text-center py-6"><CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" /><p className="text-muted-foreground text-sm">Tous à jour</p></div>
              ) : (
                <div className="space-y-2">
                  {stats.alertes.impayesLocataires.map((l) => (
                    <div key={l.locataireId} className="flex justify-between items-center p-2.5 bg-red-50 dark:bg-red-950/20 rounded-lg text-sm">
                      <span className="font-medium text-foreground">{l.nom}</span>
                      <Badge variant="destructive">{formatFCFA(l.montantDu)}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Activité récente</CardTitle></CardHeader>
          <CardContent className="max-h-52 overflow-y-auto">
            {activites.length === 0 ? (
              <div className="text-center py-6"><Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground text-sm">Aucune activité</p></div>
            ) : (
              <div className="space-y-1.5">
                {activites.map((a, i) => (
                  <div key={i} className="flex gap-2 text-sm p-1.5 rounded hover:bg-muted/50 transition-colors">
                    <span>{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs text-foreground">{a.message}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(a.date)}</p>
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
