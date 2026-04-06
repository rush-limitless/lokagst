import { getAuditLogs, getAuditStats } from "@/actions/audit";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const ACTION_ICONS: Record<string, string> = {
  "Création": "🆕", "Modification": "✏️", "Suppression": "🗑️", "Signature": "✍️",
  "Résiliation": "❌", "Renouvellement": "🔄", "Paiement": "💰", "Connexion": "🔐",
  "Archivage": "📦",
};

const ACTION_COLORS: Record<string, string> = {
  "Création": "text-emerald-600", "Modification": "text-sky-600", "Suppression": "text-red-600",
  "Signature": "text-purple-600", "Résiliation": "text-red-600", "Renouvellement": "text-sky-600",
  "Paiement": "text-emerald-600", "Connexion": "text-muted-foreground", "Archivage": "text-orange-600",
};

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ action?: string; entite?: string }> }) {
  const { action, entite } = await searchParams;
  const [logs, stats] = await Promise.all([
    getAuditLogs(100, { action, entite }),
    getAuditStats(),
  ]);

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-xl md:text-2xl font-bold text-foreground">Journal d&apos;audit</h1>
      <p className="text-sm text-muted-foreground">Traçabilité de toutes les actions effectuées dans l&apos;application</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-5 text-center"><div className="text-2xl font-bold text-foreground">{stats.total}</div><p className="text-xs text-muted-foreground">Total actions</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><div className="text-2xl font-bold text-primary">{stats.todayCount}</div><p className="text-xs text-muted-foreground">Aujourd&apos;hui</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><div className="text-2xl font-bold text-foreground">{stats.actions.length}</div><p className="text-xs text-muted-foreground">Types d&apos;actions</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><div className="text-2xl font-bold text-foreground">{stats.entites.length}</div><p className="text-xs text-muted-foreground">Entités</p></CardContent></Card>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        <Link href="/audit" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!action && !entite ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Toutes</Link>
        {stats.actions.slice(0, 6).map((a) => (
          <Link key={a.action} href={`/audit?action=${a.action}`} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${action === a.action ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
            {ACTION_ICONS[a.action] || "📋"} {a.action} ({a._count})
          </Link>
        ))}
      </div>

      <div className="bg-card rounded-xl border overflow-x-auto table-scroll">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground uppercase sticky top-0">
            <tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Utilisateur</th><th className="p-3 text-left">Action</th><th className="p-3 text-left">Entité</th><th className="p-3 text-left">Détails</th></tr>
          </thead>
          <tbody className="divide-y">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-3 text-muted-foreground whitespace-nowrap">{formatDate(l.creeLe)}</td>
                <td className="p-3 text-foreground">{l.utilisateur}</td>
                <td className="p-3">
                  <span className={`font-medium ${ACTION_COLORS[l.action] || "text-foreground"}`}>
                    {ACTION_ICONS[l.action] || "📋"} {l.action}
                  </span>
                </td>
                <td className="p-3 text-foreground">{l.entite} {l.entiteId ? <span className="text-muted-foreground text-xs">({l.entiteId.slice(0, 8)})</span> : ""}</td>
                <td className="p-3 text-muted-foreground max-w-xs truncate">{l.details || "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-muted-foreground">Aucune action enregistrée</p>
                <p className="text-xs text-muted-foreground mt-1">Les actions seront loguées automatiquement</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
