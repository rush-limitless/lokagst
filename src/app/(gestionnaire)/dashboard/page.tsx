import { getDashboardStats, getRevenusEvolution } from "@/actions/dashboard";
import { getDernieresActivites } from "@/actions/activites";
import { formatFCFA, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RevenusChart } from "@/components/charts/revenus-chart";
import { OccupationPie } from "@/components/charts/occupation-pie";
import Link from "next/link";
import {
  Building2, TrendingUp, AlertTriangle, Key,
  Plus, FileText, Users, ArrowUpRight, ArrowDownRight, Clock,
} from "lucide-react";
import { DashboardTabs } from "./dashboard-tabs";

function StatCard({ icon, iconBg, label, value, sub, trend, trendUp, href }: {
  icon: React.ReactNode; iconBg: string; label: string; value: string; sub?: string; trend?: string; trendUp?: boolean; href?: string;
}) {
  const card = (
    <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 group">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
          {trend && (
            <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-md ${trendUp ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"}`}>
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
  return href ? <Link href={href}>{card}</Link> : card;
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
      {/* Welcome banner glassmorphism */}
      <div className="mesh-bg bg-gradient-to-br from-[#0d3b5e] to-[#1B6B9E] rounded-2xl p-6 text-white">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{greeting} 👋</h1>
              <p className="text-sky-200/80 text-sm mt-1">{now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/paiements/nouveau"><Button size="sm" className="bg-card/20 hover:bg-card/30 text-white border-0 backdrop-blur-sm gap-1.5"><Plus className="size-3.5" /> Paiement</Button></Link>
              <Link href="/baux/nouveau"><Button size="sm" className="bg-card/10 hover:bg-card/20 text-white border-white/20 backdrop-blur-sm gap-1.5" variant="outline"><FileText className="size-3.5" /> Bail</Button></Link>
              <Link href="/locataires/nouveau"><Button size="sm" className="bg-card/10 hover:bg-card/20 text-white border-white/20 backdrop-blur-sm gap-1.5" variant="outline"><Users className="size-3.5" /> Locataire</Button></Link>
            </div>
          </div>
          <div className="mt-5 bg-card/10 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-300 to-emerald-400 rounded-full progress-animated" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-sky-200/60 text-xs mt-1.5">{pct}% d&apos;occupation — {stats.appartements.occupes}/{stats.appartements.total} appartements</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 stagger-in">
        <StatCard
          icon={<Building2 className="size-5 text-sky-600" />}
          iconBg="bg-sky-100 dark:bg-sky-900/40"
          label="Taux d'occupation"
          value={`${pct}%`}
          sub={`${stats.appartements.occupes} occupés · ${stats.appartements.libres} libres`}
          href="/appartements"
        />
        <StatCard
          icon={<TrendingUp className="size-5 text-emerald-600" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/40"
          label={`Revenus — ${stats.finances.periode}`}
          value={formatFCFA(stats.finances.revenusMois)}
          sub={`Loyers: ${formatFCFA(stats.finances.revenusLoyers)} · Charges: ${formatFCFA(stats.finances.revenusCharges)}`}
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
          icon={<Key className="size-5 text-sky-600" />}
          iconBg="bg-sky-100 dark:bg-sky-900/40"
          label="Appartements libres"
          value={`${stats.appartements.libres}`}
          sub="disponibles à la location"
          href="/appartements?statut=LIBRE"
        />
      </div>

      {/* Onglets : Vue d'ensemble / Alertes / Activités */}
      <DashboardTabs
        evolution={evolution}
        stats={stats}
        activites={activites}
      />
    </div>
  );
}
