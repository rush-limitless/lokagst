import { prisma } from "@/lib/prisma";
import { isMoisEcheance, PERIODICITE_MOIS } from "@/lib/utils";

export async function PrevisionTresorerie() {
  const baux = await prisma.bail.findMany({ where: { statut: "ACTIF" }, select: { dateDebut: true, periodicite: true, totalMensuel: true } });
  const now = new Date();

  const previsions = [1, 2, 3].map(offset => {
    const mois = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const attendu = baux.filter(b => isMoisEcheance(mois, b.dateDebut, b.periodicite)).reduce((s, b) => s + b.totalMensuel * (PERIODICITE_MOIS[b.periodicite] || 1), 0);
    const label = mois.toLocaleDateString("fr-FR", { month: "short" });
    return { label, attendu };
  });

  const max = Math.max(...previsions.map(p => p.attendu), 1);

  return (
    <div className="bg-card border rounded-xl p-4">
      <p className="text-sm font-semibold text-foreground mb-3">📈 Prévision trésorerie</p>
      <div className="flex items-end gap-3 h-20">
        {previsions.map((p, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-foreground">{(p.attendu / 1000000).toFixed(1)}M</span>
            <div className="w-full bg-primary/20 rounded-t-md overflow-hidden" style={{ height: "60px" }}>
              <div className="w-full bg-primary rounded-t-md transition-all" style={{ height: `${(p.attendu / max) * 100}%`, marginTop: `${100 - (p.attendu / max) * 100}%` }} />
            </div>
            <span className="text-[10px] text-muted-foreground capitalize">{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
