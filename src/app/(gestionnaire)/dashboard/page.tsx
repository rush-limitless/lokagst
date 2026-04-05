import { getDashboardStats, getRevenusEvolution } from "@/actions/dashboard";
import { getDernieresActivites } from "@/actions/activites";
import { formatFCFA, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RevenusChart } from "@/components/charts/revenus-chart";
import { OccupationPie } from "@/components/charts/occupation-pie";
import Link from "next/link";

function StatCard({ icon, iconBg, label, value, sub, valueColor }: { icon: string; iconBg: string; label: string; value: string; sub?: string; valueColor?: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${iconBg}`}>{icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
            <p className={`text-xl md:text-2xl font-bold mt-0.5 ${valueColor || ""}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const [stats, evolution, activites] = await Promise.all([
    getDashboardStats(), getRevenusEvolution(6), getDernieresActivites(),
  ]);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Bonjour" : now.getHours() < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{greeting} 👋</h1>
            <p className="text-blue-200 text-sm mt-1">{now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/paiements/nouveau"><Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white border-0">💰 Paiement</Button></Link>
            <Link href="/baux/nouveau"><Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10">📄 Bail</Button></Link>
            <Link href="/locataires/nouveau"><Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/10">👤 Locataire</Button></Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard icon="🏠" iconBg="bg-blue-100" label="Occupation" value={`${stats.appartements.tauxOccupation}%`} sub={`${stats.appartements.occupes}/${stats.appartements.total} appartements`} />
        <StatCard icon="💰" iconBg="bg-emerald-100" label="Revenus du mois" value={formatFCFA(stats.finances.revenusMois)} sub={`sur ${formatFCFA(stats.finances.revenusAttendus)}`} valueColor="text-emerald-600" />
        <StatCard icon="⚠️" iconBg="bg-red-100" label="Impayés" value={formatFCFA(stats.finances.impayesMois)} sub={`${stats.alertes.impayesLocataires.length} locataire(s)`} valueColor="text-red-600" />
        <StatCard icon="🔑" iconBg="bg-amber-100" label="Libres" value={`${stats.appartements.libres}`} sub="disponibles" valueColor="text-amber-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Évolution des revenus</CardTitle></CardHeader>
          <CardContent><RevenusChart data={evolution} /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Occupation</CardTitle></CardHeader>
          <CardContent><OccupationPie occupes={stats.appartements.occupes} libres={stats.appartements.libres} /></CardContent>
        </Card>
      </div>

      {/* Alerts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Baux expirant bientôt</CardTitle></CardHeader>
          <CardContent>
            {stats.alertes.bauxExpirants.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Aucun dans les 30 prochains jours ✅</p>
            ) : (
              <div className="space-y-2">
                {stats.alertes.bauxExpirants.map((b) => (
                  <div key={b.bailId} className="flex justify-between items-center p-2.5 bg-orange-50 dark:bg-orange-950/20 rounded-lg text-sm">
                    <span className="font-medium">{b.locataire} <span className="text-muted-foreground">({b.appartement})</span></span>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">{b.joursRestants}j</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Impayés ce mois</CardTitle></CardHeader>
          <CardContent>
            {stats.alertes.impayesLocataires.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Tous à jour ✅</p>
            ) : (
              <div className="space-y-2">
                {stats.alertes.impayesLocataires.map((l) => (
                  <div key={l.locataireId} className="flex justify-between items-center p-2.5 bg-red-50 dark:bg-red-950/20 rounded-lg text-sm">
                    <span className="font-medium">{l.nom}</span>
                    <Badge variant="destructive">{formatFCFA(l.montantDu)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Activité récente</CardTitle></CardHeader>
          <CardContent>
            {activites.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">Aucune activité</p>
            ) : (
              <div className="space-y-1.5">
                {activites.map((a, i) => (
                  <div key={i} className="flex gap-2 text-sm p-1.5 rounded hover:bg-muted/50">
                    <span>{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs">{a.message}</p>
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
