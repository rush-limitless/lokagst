import { getMaintenances } from "@/actions/maintenance";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Wrench, Plus, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

const COLUMNS = [
  { key: "SIGNALE", label: "Signalé", icon: <AlertCircle className="size-4 text-orange-500" />, color: "border-t-orange-500", bg: "bg-orange-50/50 dark:bg-orange-950/10" },
  { key: "EN_COURS", label: "En cours", icon: <Clock className="size-4 text-blue-500" />, color: "border-t-blue-500", bg: "bg-blue-50/50 dark:bg-blue-950/10" },
  { key: "RESOLU", label: "Résolu", icon: <CheckCircle2 className="size-4 text-emerald-500" />, color: "border-t-emerald-500", bg: "bg-emerald-50/50 dark:bg-emerald-950/10" },
];

const PRIORITE_BADGE: Record<string, string> = { BASSE: "bg-muted text-muted-foreground", NORMALE: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400", URGENTE: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400" };

export default async function MaintenancePage() {
  const tickets = await getMaintenances();

  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2"><Wrench className="size-6 text-primary" /> Maintenance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{tickets.length} ticket(s)</p>
        </div>
        <Link href="/maintenance/nouveau"><Button size="sm" className="gap-1.5"><Plus className="size-3.5" /> Signaler</Button></Link>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colTickets = tickets.filter((t) => t.statut === col.key);
          return (
            <div key={col.key} className={`rounded-xl border border-t-4 ${col.color} ${col.bg} p-3`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {col.icon}
                  <span className="text-sm font-semibold text-foreground">{col.label}</span>
                </div>
                <Badge variant="secondary" className="text-[10px]">{colTickets.length}</Badge>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {colTickets.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">Aucun ticket</p>
                ) : (
                  colTickets.map((t) => (
                    <Link key={t.id} href={`/maintenance/${t.id}`} className="block">
                      <Card className="hover:shadow-md transition-all hover:-translate-y-0.5">
                        <CardContent className="pt-3 pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-foreground leading-tight">{t.titre}</p>
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${PRIORITE_BADGE[t.priorite]}`}>{t.priorite}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[8px] font-bold">
                              {t.locataire.prenom[0]}{t.locataire.nom[0]}
                            </div>
                            <span className="text-[11px] text-muted-foreground">{t.locataire.prenom} {t.locataire.nom}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline" className="text-[9px] font-normal">{t.appartement.numero}</Badge>
                            <span className="text-[10px] text-muted-foreground">{formatDate(t.creeLe)}</span>
                          </div>
                          {t.photos && t.photos.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {t.photos.slice(0, 3).map((p: string, i: number) => (
                                <img key={i} src={p} alt="" className="w-8 h-8 rounded object-cover" />
                              ))}
                              {t.photos.length > 3 && <span className="text-[10px] text-muted-foreground self-center">+{t.photos.length - 3}</span>}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
