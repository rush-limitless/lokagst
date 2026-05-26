import { getDashboardStats, getRevenusEvolution } from "@/actions/dashboard";
import { getDernieresActivites } from "@/actions/activites";
import { formatFCFA, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RevenusChart } from "@/components/charts/revenus-chart";
import { Sparkline } from "@/components/sparkline";
import Link from "next/link";
import {
  Building2, TrendingUp, AlertTriangle, Key,
  Plus, ArrowUpRight, ArrowDownRight, Clock,
} from "lucide-react";

export default async function DashboardPage() {
  const [stats, evolution, activites] = await Promise.all([
    getDashboardStats(), getRevenusEvolution(6), getDernieresActivites(),
  ]);

  const pct = stats.appartements.tauxOccupation;
  const now = new Date();
  const dateLabel = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header simple */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">{dateLabel}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/paiements/nouveau"><Button size="sm" className="gap-1.5"><Plus className="size-3.5" /> Paiement</Button></Link>
          <Link href="/baux/nouveau"><Button size="sm" variant="outline" className="gap-1.5">Bail</Button></Link>
          <Link href="/locataires/nouveau"><Button size="sm" variant="outline" className="gap-1.5">Locataire</Button></Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <Building2 className="size-4 text-muted-foreground" />
              <span className={`text-xs font-medium ${pct >= 80 ? "text-emerald-600" : "text-amber-600"}`}>{pct}%</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{stats.appartements.occupes}/{stats.appartements.total}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Occupation</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="size-4 text-muted-foreground" />
              {stats.finances.revenusAttendus > 0 && (
                <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${(stats.finances.revenusMois / stats.finances.revenusAttendus) >= 0.8 ? "text-emerald-600" : "text-red-600"}`}>
                  {(stats.finances.revenusMois / stats.finances.revenusAttendus) >= 0.8 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {Math.round((stats.finances.revenusMois / stats.finances.revenusAttendus) * 100)}%
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{formatFCFA(stats.finances.revenusMois)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Revenus — {stats.finances.periode}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="size-4 text-muted-foreground" />
              {stats.alertes.impayesLocataires.length > 0 && <Badge variant="destructive" className="text-[10px] px-1.5">{stats.alertes.impayesLocataires.length}</Badge>}
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{formatFCFA(stats.finances.impayesMois)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Impayés</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <Key className="size-4 text-muted-foreground" />
              <Sparkline data={evolution.map((e: any) => e.revenus)} color="#64748b" width={60} height={20} />
            </div>
            <p className="text-2xl font-bold text-foreground mt-2">{stats.appartements.libres}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Libres</p>
          </CardContent>
        </Card>
      </div>

      {/* Graphique + À faire */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Revenus</CardTitle>
          </CardHeader>
          <CardContent><RevenusChart data={evolution} /></CardContent>
        </Card>

        {/* À faire */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">À faire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[300px] overflow-y-auto">
            {stats.alertes.aEncaisserSemaine.map((l: any) => (
              <Link key={l.bailId} href={`/paiements/nouveau?bailId=${l.bailId}`} className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors">
                <div>
                  <p className="text-sm text-foreground">{l.nom}</p>
                  <p className="text-[10px] text-muted-foreground">{l.appartement} · le {l.jourLimite}</p>
                </div>
                <span className="text-xs font-medium text-foreground">{formatFCFA(l.montantAttendu)}</span>
              </Link>
            ))}
            {stats.alertes.bauxExpirants.map((b: any) => (
              <Link key={b.bailId} href={`/baux/${b.bailId}`} className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors">
                <div>
                  <p className="text-sm text-foreground">{b.locataire}</p>
                  <p className="text-[10px] text-muted-foreground">{b.appartement} · bail expire</p>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="size-3" />{b.joursRestants}j</span>
              </Link>
            ))}
            {stats.alertes.aEncaisserSemaine.length === 0 && stats.alertes.bauxExpirants.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Rien à signaler</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Impayés + Activité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {stats.alertes.impayesLocataires.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-foreground">Impayés</CardTitle>
                <Link href="/situation" className="text-xs text-primary hover:underline">Voir tout</Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 max-h-[250px] overflow-y-auto">
              {stats.alertes.impayesLocataires.slice(0, 8).map((l: any) => (
                <Link key={l.locataireId} href={`/locataires/${l.locataireId}`} className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors">
                  <span className="text-sm text-foreground">{l.nom}</span>
                  <span className="text-xs font-medium text-red-600">{formatFCFA(l.montantDu)}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Activité récente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[250px] overflow-y-auto">
            {activites.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucune activité</p>
            ) : (
              activites.slice(0, 8).map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-2 py-2 border-b last:border-0">
                  <span className="text-sm">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{a.message}</p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(a.date)}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
