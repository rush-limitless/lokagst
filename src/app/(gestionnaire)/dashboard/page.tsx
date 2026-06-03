import { getDashboardStats, getRevenusEvolution } from "@/actions/dashboard";
import { getDernieresActivites } from "@/actions/activites";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2, TrendingUp, AlertTriangle, Key, Plus, FileText } from "lucide-react";
import { DashboardTabs } from "./dashboard-tabs";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { AnimatedStatCard } from "@/components/animated-stat-card";
import { SmartAlerts } from "@/components/smart-alerts";
import { ActivityTimeline } from "@/components/activity-timeline";
import { PrevisionTresorerie } from "@/components/prevision-tresorerie";


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
              <Link href="/api/rapport-pdf" target="_blank"><Button size="sm" className="bg-card/10 hover:bg-card/20 text-white border-white/20 backdrop-blur-sm gap-1.5" variant="outline"><FileText className="size-3.5" /> Rapport PDF</Button></Link>
            </div>
          </div>
          <div className="mt-5 bg-card/10 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-300 to-emerald-400 rounded-full progress-animated" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-sky-200/60 text-xs mt-1.5">{pct}% d&apos;occupation — {stats.appartements.occupes}/{stats.appartements.total} appartements</p>
        </div>
      </div>

      {/* Stat cards */}
      <SmartAlerts />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 stagger-in">
        <AnimatedStatCard
          icon={<Building2 className="size-5 text-sky-600" />}
          iconBg="bg-sky-100 dark:bg-sky-900/40"
          label="Taux d'occupation"
          value={pct}
          suffix="%"
          sub={`${stats.appartements.occupes} occupés · ${stats.appartements.libres} libres`}
        />
        <AnimatedStatCard
          icon={<TrendingUp className="size-5 text-emerald-600" />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/40"
          label={`Revenus — ${stats.finances.periode}`}
          value={stats.finances.revenusMois}
          suffix=" FCFA"
          trend={stats.finances.revenusAttendus > 0 ? `${Math.round((stats.finances.revenusMois / stats.finances.revenusAttendus) * 100)}%` : undefined}
          trendUp={(stats.finances.revenusMois / (stats.finances.revenusAttendus || 1)) >= 0.8}
          sparkData={evolution.map((e: any) => e.revenus)}
          sparkColor="#10b981"
        />
        <AnimatedStatCard
          icon={<AlertTriangle className="size-5 text-red-600" />}
          iconBg="bg-red-100 dark:bg-red-900/40"
          label={`Impayés — ${stats.finances.periode}`}
          value={stats.finances.impayesMois}
          suffix=" FCFA"
          sparkData={evolution.map((e: any) => e.attendus - e.revenus)}
          sparkColor="#ef4444"
        />
        <AnimatedStatCard
          icon={<Key className="size-5 text-sky-600" />}
          iconBg="bg-sky-100 dark:bg-sky-900/40"
          label="Appartements libres"
          value={stats.appartements.libres}
          sub="disponibles à la location"
        />
      </div>

      {/* Onboarding */}
      <OnboardingChecklist counts={{ immeubles: stats.appartements.total > 0 ? 1 : 0, appartements: stats.appartements.total, locataires: stats.appartements.occupes, baux: stats.appartements.occupes, paiements: stats.finances.revenusMois > 0 ? 1 : 0 }} />

      {/* Timeline + Prévision */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2"><ActivityTimeline /></div>
        <PrevisionTresorerie />
      </div>

      {/* Onglets */}
      <DashboardTabs
        evolution={evolution}
        stats={stats}
        activites={activites}
      />
    </div>
  );
}
