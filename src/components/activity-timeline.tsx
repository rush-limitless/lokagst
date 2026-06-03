import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/utils";
import { CreditCard, AlertTriangle, Wrench } from "lucide-react";

export async function ActivityTimeline() {
  const now = new Date();
  const depuis7j = new Date(now.getTime() - 7 * 86400000);

  const [paiements, penalites, maintenances] = await Promise.all([
    prisma.paiement.findMany({ where: { datePaiement: { gte: depuis7j } }, include: { bail: { include: { locataire: true, appartement: true } } }, orderBy: { datePaiement: "desc" }, take: 8 }),
    prisma.penalite.findMany({ where: { appliqueLe: { gte: depuis7j } }, include: { bail: { include: { locataire: true } } }, orderBy: { appliqueLe: "desc" }, take: 4 }),
    prisma.maintenance.findMany({ where: { creeLe: { gte: depuis7j } }, include: { appartement: true }, orderBy: { creeLe: "desc" }, take: 4 }),
  ]);

  type Event = { date: Date; icon: React.ReactNode; text: string; color: string };
  const events: Event[] = [];

  paiements.forEach(p => events.push({
    date: new Date(p.datePaiement),
    icon: <CreditCard className="size-3.5" />,
    text: `${p.bail.locataire.prenom} ${p.bail.locataire.nom} a payé ${formatFCFA(p.montant)}`,
    color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
  }));

  penalites.forEach(p => events.push({
    date: new Date(p.appliqueLe),
    icon: <AlertTriangle className="size-3.5" />,
    text: `Pénalité ${formatFCFA(p.montant)} — ${p.bail.locataire.prenom} ${p.bail.locataire.nom}`,
    color: "text-red-600 bg-red-100 dark:bg-red-900/30",
  }));

  maintenances.forEach(m => events.push({
    date: new Date(m.creeLe),
    icon: <Wrench className="size-3.5" />,
    text: `Ticket maintenance — ${m.appartement.numero}`,
    color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
  }));

  events.sort((a, b) => b.date.getTime() - a.date.getTime());
  const display = events.slice(0, 10);

  if (display.length === 0) return null;

  return (
    <div className="bg-card border rounded-xl p-4">
      <p className="text-sm font-semibold text-foreground mb-3">⚡ Activité récente</p>
      <div className="space-y-3">
        {display.map((e, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${e.color}`}>{e.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground truncate">{e.text}</p>
              <p className="text-[10px] text-muted-foreground">{timeAgo(e.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `il y a ${mins}min`;
  const heures = Math.floor(mins / 60);
  if (heures < 24) return `il y a ${heures}h`;
  const jours = Math.floor(heures / 24);
  return `il y a ${jours}j`;
}
