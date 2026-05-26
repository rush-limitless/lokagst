"use client";

import { useState } from "react";
import { cn, formatFCFA, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RevenusChart } from "@/components/charts/revenus-chart";
import { OccupationPie } from "@/components/charts/occupation-pie";
import Link from "next/link";
import { Clock, AlertTriangle, Activity, BarChart3 } from "lucide-react";

export function DashboardTabs({ evolution, stats, activites }: { evolution: any; stats: any; activites: any[] }) {
  const [tab, setTab] = useState<"overview" | "alertes" | "activites">("overview");

  const alertCount = stats.alertes.impayesLocataires.length + stats.alertes.bauxExpirants.length;

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 border-b overflow-x-auto">
        <TabButton active={tab === "overview"} onClick={() => setTab("overview")} icon={<BarChart3 className="size-3.5" />} label="Vue d'ensemble" />
        <TabButton active={tab === "alertes"} onClick={() => setTab("alertes")} icon={<AlertTriangle className="size-3.5" />} label="Alertes" badge={alertCount > 0 ? alertCount : undefined} />
        <TabButton active={tab === "activites"} onClick={() => setTab("activites")} icon={<Activity className="size-3.5" />} label="Activités" />
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Évolution des revenus</CardTitle>
                  <Badge variant="outline" className="text-[10px]">6 mois</Badge>
                </div>
              </CardHeader>
              <CardContent><RevenusChart data={evolution} /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Occupation</CardTitle></CardHeader>
              <CardContent><OccupationPie occupes={stats.appartements.occupes} libres={stats.appartements.libres} /></CardContent>
            </Card>
          </div>

          {/* À encaisser */}
          {stats.alertes.aEncaisserSemaine.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">📋 Rappels</CardTitle>
                  <Badge variant="outline" className="text-[10px]">{stats.alertes.aEncaisserSemaine.length + stats.alertes.bauxExpirants.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {stats.alertes.aEncaisserSemaine.map((l: any) => (
                    <Link key={l.bailId} href={`/paiements/nouveau?bailId=${l.bailId}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors border-l-4 border-l-sky-500">
                      <div className="text-center shrink-0 w-10"><p className="text-[10px] text-muted-foreground uppercase">Jour</p><p className="text-sm font-bold text-foreground">{l.jourLimite}</p></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{l.nom}</p>
                        <p className="text-[10px] text-muted-foreground">{l.appartement} · {formatFCFA(l.montantAttendu)}</p>
                      </div>
                      <Badge variant="outline" className="text-sky-600 border-sky-300 text-[9px] shrink-0">À encaisser</Badge>
                    </Link>
                  ))}
                  {stats.alertes.bauxExpirants.map((b: any) => (
                    <Link key={b.bailId} href={`/baux/${b.bailId}`} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors border-l-4 border-l-orange-400">
                      <div className="text-center shrink-0 w-10"><p className="text-[10px] text-muted-foreground uppercase">Dans</p><p className="text-sm font-bold text-foreground">{b.joursRestants}j</p></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{b.locataire}</p>
                        <p className="text-[10px] text-muted-foreground">{b.appartement} · Bail expire</p>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-300 text-[9px] shrink-0">Expiration</Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === "alertes" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Impayés */}
          <Card className={stats.alertes.impayesLocataires.length > 0 ? "border-red-200 dark:border-red-800" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="size-4 text-red-500" /> Impayés ce mois</CardTitle>
                {stats.alertes.impayesLocataires.length > 0 && <Badge variant="destructive">{stats.alertes.impayesLocataires.length}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="max-h-72 overflow-y-auto">
              {stats.alertes.impayesLocataires.length === 0 ? (
                <div className="text-center py-8"><div className="text-3xl mb-2">✅</div><p className="text-muted-foreground text-sm">Tous à jour</p></div>
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
                <CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="size-4 text-orange-500" /> Baux expirant bientôt</CardTitle>
                {stats.alertes.bauxExpirants.length > 0 && <Badge variant="outline" className="text-orange-600 border-orange-300">{stats.alertes.bauxExpirants.length}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="max-h-72 overflow-y-auto">
              {stats.alertes.bauxExpirants.length === 0 ? (
                <div className="text-center py-8"><div className="text-3xl mb-2">✅</div><p className="text-muted-foreground text-sm">Aucun dans les 30 prochains jours</p></div>
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
      )}

      {tab === "activites" && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Activité récente</CardTitle></CardHeader>
          <CardContent>
            {activites.length === 0 ? (
              <div className="text-center py-12"><div className="text-3xl mb-2">📭</div><p className="text-muted-foreground text-sm">Aucune activité</p></div>
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
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label, badge }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
        active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="ml-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{badge}</span>
      )}
    </button>
  );
}
