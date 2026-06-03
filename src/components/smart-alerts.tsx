import { prisma } from "@/lib/prisma";
import { AlertTriangle, Clock, Wrench, TrendingDown } from "lucide-react";
import Link from "next/link";

export async function SmartAlerts() {
  const now = new Date();
  const dans7j = new Date(now.getTime() + 7 * 86400000);
  const alerts: { icon: React.ReactNode; text: string; href: string; color: string }[] = [];

  const [bauxExpirent, suspendus, maintenanceUrgente] = await Promise.all([
    prisma.bail.count({ where: { statut: "ACTIF", dateFin: { lte: dans7j, gte: now } } }),
    prisma.bail.count({ where: { statut: "SUSPENDU" } }),
    prisma.maintenance.count({ where: { statut: "SIGNALE" } }),
  ]);

  if (bauxExpirent > 0) alerts.push({ icon: <Clock className="size-3.5" />, text: `${bauxExpirent} bail(s) expire(nt) dans 7 jours`, href: "/baux", color: "text-amber-700 dark:text-amber-400" });
  if (suspendus > 0) alerts.push({ icon: <AlertTriangle className="size-3.5" />, text: `${suspendus} bail(s) suspendu(s)`, href: "/situation", color: "text-red-700 dark:text-red-400" });
  if (maintenanceUrgente > 0) alerts.push({ icon: <Wrench className="size-3.5" />, text: `${maintenanceUrgente} ticket(s) maintenance en attente`, href: "/maintenance", color: "text-orange-700 dark:text-orange-400" });

  // Impayés lourds (3+ mois)
  const bauxAvecImpayes = await prisma.bail.findMany({ where: { statut: "ACTIF" }, include: { locataire: true, paiements: true }, take: 100 });
  let impayes3mois = 0;
  for (const b of bauxAvecImpayes) {
    let moisSansPaie = 0;
    for (let i = 0; i < 3; i++) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const paie = b.paiements.find(p => { const mc = new Date(p.moisConcerne); return mc.getMonth() === m.getMonth() && mc.getFullYear() === m.getFullYear(); });
      if (!paie) moisSansPaie++;
    }
    if (moisSansPaie >= 3) impayes3mois++;
  }
  if (impayes3mois > 0) alerts.push({ icon: <TrendingDown className="size-3.5" />, text: `${impayes3mois} locataire(s) avec 3+ mois d'impayés`, href: "/situation?filtre=impayes", color: "text-red-700 dark:text-red-400" });

  if (alerts.length === 0) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex flex-wrap gap-3">
      {alerts.map((a, i) => (
        <Link key={i} href={a.href} className={`flex items-center gap-1.5 text-xs font-medium ${a.color} hover:underline`}>
          {a.icon} {a.text}
        </Link>
      ))}
    </div>
  );
}
