import { getAuditLogs, getAuditStats } from "@/actions/audit";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { AuditDetailRow } from "./audit-detail-row";

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

  const serializedLogs = logs.map((l) => ({
    ...l,
    creeLe: l.creeLe.toISOString(),
    icon: ACTION_ICONS[l.action] || "📋",
    color: ACTION_COLORS[l.action] || "text-foreground",
  }));

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-xl md:text-2xl font-bold text-foreground">Journal d&apos;audit</h1>
      <p className="text-sm text-muted-foreground">Traçabilité complète — cliquez sur une ligne pour voir les détails</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-5 text-center"><div className="text-2xl font-bold text-foreground">{stats.total}</div><p className="text-xs text-muted-foreground">Total actions</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><div className="text-2xl font-bold text-primary">{stats.todayCount}</div><p className="text-xs text-muted-foreground">Aujourd&apos;hui</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><div className="text-2xl font-bold text-foreground">{stats.actions.length}</div><p className="text-xs text-muted-foreground">Types d&apos;actions</p></CardContent></Card>
        <Card><CardContent className="pt-5 text-center"><div className="text-2xl font-bold text-foreground">{stats.entites.length}</div><p className="text-xs text-muted-foreground">Entités</p></CardContent></Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Link href="/audit" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!action && !entite ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Toutes</Link>
        {stats.actions.slice(0, 6).map((a) => (
          <Link key={a.action} href={`/audit?action=${a.action}`} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${action === a.action ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
            {ACTION_ICONS[a.action] || "📋"} {a.action} ({a._count})
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        {serializedLogs.length === 0 ? (
          <div className="text-center py-12"><div className="text-4xl mb-3">📋</div><p className="text-muted-foreground">Aucune action enregistrée</p></div>
        ) : (
          serializedLogs.map((l) => <AuditDetailRow key={l.id} log={l} />)
        )}
      </div>
    </div>
  );
}
