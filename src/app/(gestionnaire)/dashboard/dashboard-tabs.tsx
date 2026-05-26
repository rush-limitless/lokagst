"use client";

import { useState } from "react";
import { cn, formatFCFA, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RevenusChart } from "@/components/charts/revenus-chart";
import { OccupationPie } from "@/components/charts/occupation-pie";
import Link from "next/link";
import {
  Building2, AlertTriangle, Key,
  ArrowUpRight, ArrowDownRight, Clock, Wallet,
} from "lucide-react";

function StatCard({ icon, iconBg, label, value, sub, trend, trendUp, href }: {
  icon: React.ReactNode; iconBg: string; label: string; value: string; sub?: string; trend?: string; trendUp?: boolean; href?: string;
}) {
  const content = (
    <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 group h-full">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
          {trend && (
            <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md ${trendUp ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"}`}>
              {trendUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {trend}
            </span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
        </div>
        {sub && <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">{sub}</p>}
      </CardContent>
    </Card>
  );
  return href ? <Link href={href} className="block">{content}</Link> : content;
}

export function DashboardTabs({ stats, evolution, activites, pct }: { stats: any; evolution: any; activites: any; pct: number }) {
  const [tab, setTab] = useState<"overview" | "alertes" | "activites">("overview");

  const tabs = [
    { id: "overview" as const, label: "Vue d'ensemble" },
    { id: "alertes" as const, label: "Alertes" },
    { id: "activites" as const, label: "Activités" },
  ];

  return (
    <>
      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
            {t.id === "alertes" && (stats.alertes.impayesLocataires.length + stats.alertes.bauxExpirants.length) > 0 && (
              <Badge variant="destructive" className="ml-2 text-[9px] px-1.5 py-0">{stats.alertes.impayesLocataires.length + stats.alertes.bauxExpirants.length}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && <OverviewTab stats={stats} evolution={evolution} pct={pct} />}
      {tab === "alertes" && <AlertesTab stats={stats} />}
      {tab === "activites" && <ActivitesTab activites={activites} />}
    </>
  );
}

function OverviewTab({ stats, evolution, pct }: { stats: any; evolution: any; pct: number }) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          icon={<Wallet className="size-5 text-emerald-600" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/40"
          label={`Revenus — ${stats.finances.periode}`}
          value={formatFCFA(stats.finances.revenusMois)}
          trend={stats.finances.revenusAttendus > 0 ? `${Math.round((stats.finances.revenusMois / stats.finances.revenusAttendus) * 100)}%` : undefined}
          trendUp={(stats.finances.revenusMois / (stats.finances.revenusAttendus || 1)) >= 0.8}
          href="/finances"
        />
        <StatCard
          icon={<AlertTriangle className="size-5 text-red-600" />}
          iconBg="bg-red-100 dark:bg-red-900/40"
          label={`Impayés — ${stats.finances.periode}`}
          value={formatFCFA(stats.finances.impayesMois)}
          sub={`Loyers: ${formatFCFA(stats.finances.impayesLoyers)} · Charges: ${formatFCFA(stats.finances.impayesCharges)}`}
          href="/situation"
        />
        <StatCard
          icon={<Building2 className="size-5 text-sky-600" />}
          iconBg="bg-sky-100 dark:bg-sky-900/40"
          label="Taux d'occupation"
          value={`${pct}%`}
          sub={`${stats.appartements.occupes} occupés · ${stats.appartements.libres} libres`}
          trend={`${stats.appartements.occupes}/${stats.appartements.total}`}
          trendUp={pct >= 80}
          href="/appartements"
        />
        <StatCard
          icon={<Key className="size-5 text-amber-600" />}
          iconBg="bg-amber-100 dark:bg-amber-900/40"
          label="Appartements libres"
          value={`${stats.appartements.libres}`}
          sub="disponibles à la location"
          href="/appartements?statut=LIBRE"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Évolution des revenus</CardTitle>
              <Badge variant="outline" className="text-[10px] font-normal">6 derniers mois</Badge>
            </div>
          </CardHeader>
          <CardContent><RevenusChart data={evolution} /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Occupation</CardTitle></CardHeader>
          <CardContent><OccupationPie occupes={stats.appartements.occupes} libres={stats.appartements.libres} /></CardContent>
        </Card>
      </div>

      {/* Highlights + À encaisser */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Highlights */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Résumé financier</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-xs text-muted-foreground">Loyers encaissés</span>
                <span className="text-sm font-semibold text-foreground">{formatFCFA(stats.finances.revenusLoyers)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-xs text-muted-foreground">Charges encaissées</span>
                <span className="text-sm font-semibold text-foreground">{formatFCFA(stats.finances.revenusCharges)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-xs text-muted-foreground">Cautions reçues</span>
                <span className="text-sm font-semibold text-foreground">{formatFCFA(stats.finances.revenusCautions)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-xs text-muted-foreground">Attendu ce mois</span>
                <span className="text-sm font-semibold text-sky-600">{formatFCFA(stats.finances.revenusAttendus)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-medium text-foreground">Total impayés</span>
                <span className="text-sm font-bold text-red-600">{formatFCFA(stats.finances.impayesMois)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* À encaisser cette semaine */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">💳 À encaisser cette semaine</CardTitle>
              {stats.alertes.aEncaisserSemaine.length > 0 && <Badge variant="outline" className="text-sky-600 border-sky-300">{stats.alertes.aEncaisserSemaine.length}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            {stats.alertes.aEncaisserSemaine.length === 0 ? (
              <div className="text-center py-8"><div className="text-3xl mb-2">✅</div><p className="text-muted-foreground text-sm">Rien à encaisser cette semaine</p></div>
            ) : (
              <div className="space-y-2">
                {stats.alertes.aEncaisserSemaine.map((l: any) => (
                  <Link key={l.bailId} href={`/paiements/nouveau?bailId=${l.bailId}`} className="flex justify-between items-center p-2.5 bg-sky-50 dark:bg-sky-950/20 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-950/30 transition-colors">
                    <div>
                      <p className="font-medium text-foreground text-xs">{l.nom}</p>
                      <p className="text-[10px] text-muted-foreground">{l.appartement} · limite le {l.jourLimite}</p>
                    </div>
                    <Badge variant="outline" className="text-sky-700 border-sky-300 text-[10px]">{formatFCFA(l.montantAttendu)}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AlertesTab({ stats }: { stats: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Impayés */}
        <Card className={stats.alertes.impayesLocataires.length > 0 ? "border-red-200 dark:border-red-800" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="size-4 text-red-500" /> Impayés ce mois
              </CardTitle>
              {stats.alertes.impayesLocataires.length > 0 && <Badge variant="destructive">{stats.alertes.impayesLocataires.length}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto">
            {stats.alertes.impayesLocataires.length === 0 ? (
              <div className="text-center py-8"><div className="text-3xl mb-2">✅</div><p className="text-muted-foreground text-sm">Tous les locataires sont à jour</p></div>
            ) : (
              <div className="space-y-2">
                {stats.alertes.impayesLocataires.map((l: any) => (
                  <Link key={l.locataireId} href={`/locataires/${l.locataireId}`} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors">
                    <span className="font-medium text-foreground text-sm">{l.nom}</span>
                    <Badge variant="destructive">{formatFCFA(l.montantDu)}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Baux expirants */}
        <Card className={stats.alertes.bauxExpirants.length > 0 ? "border-orange-200 dark:border-orange-800" : ""}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="size-4 text-orange-500" /> Baux expirant bientôt
              </CardTitle>
              {stats.alertes.bauxExpirants.length > 0 && <Badge variant="outline" className="text-orange-600 border-orange-300">{stats.alertes.bauxExpirants.length}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto">
            {stats.alertes.bauxExpirants.length === 0 ? (
              <div className="text-center py-8"><div className="text-3xl mb-2">✅</div><p className="text-muted-foreground text-sm">Aucun bail n&apos;expire dans les 30 prochains jours</p></div>
            ) : (
              <div className="space-y-2">
                {stats.alertes.bauxExpirants.map((b: any) => (
                  <Link key={b.bailId} href={`/baux/${b.bailId}`} className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors">
                    <div>
                      <span className="font-medium text-foreground text-sm">{b.locataire}</span>
                      <span className="text-muted-foreground ml-1.5 text-xs">({b.appartement})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-orange-600">
                      <Clock className="size-3" />
                      <span className="text-xs font-medium">{b.joursRestants}j</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ActivitesTab({ activites }: { activites: any[] }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Activité récente</CardTitle></CardHeader>
      <CardContent>
        {activites.length === 0 ? (
          <div className="text-center py-12"><div className="text-3xl mb-2">📭</div><p className="text-muted-foreground text-sm">Aucune activité récente</p></div>
        ) : (
          <div className="space-y-1">
            {activites.map((a: any, i: number) => (
              <div key={i} className="flex gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm shrink-0">{a.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{a.message}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{formatDate(a.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
