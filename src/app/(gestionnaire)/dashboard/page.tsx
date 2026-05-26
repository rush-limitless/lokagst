import { getDashboardStats, getRevenusEvolution } from "@/actions/dashboard";
import { getDernieresActivites } from "@/actions/activites";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, FileText, Users, Calendar } from "lucide-react";
import { DashboardTabs } from "./dashboard-tabs";

export default async function DashboardPage() {
  const [stats, evolution, activites] = await Promise.all([
    getDashboardStats(), getRevenusEvolution(6), getDernieresActivites(),
  ]);

  const now = new Date();
  const pct = stats.appartements.tauxOccupation;
  const dateRange = `${new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })} - ${now.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Calendar className="size-3.5" />
            {dateRange}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/paiements/nouveau"><Button size="sm" className="gap-1.5"><Plus className="size-3.5" /> Paiement</Button></Link>
          <Link href="/baux/nouveau"><Button size="sm" variant="outline" className="gap-1.5"><FileText className="size-3.5" /> Bail</Button></Link>
          <Link href="/locataires/nouveau"><Button size="sm" variant="outline" className="gap-1.5"><Users className="size-3.5" /> Locataire</Button></Link>
        </div>
      </div>

      {/* Tabs */}
      <DashboardTabs
        stats={stats}
        evolution={evolution}
        activites={activites}
        pct={pct}
      />
    </div>
  );
}
