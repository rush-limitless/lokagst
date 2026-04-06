import { getEcheancesMois } from "@/actions/calendrier";
import { formatFCFA } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function CalendrierPage({ searchParams }: { searchParams: Promise<{ m?: string; y?: string }> }) {
  const { m, y } = await searchParams;
  const now = new Date();
  const mois = m ? parseInt(m) : now.getMonth();
  const annee = y ? parseInt(y) : now.getFullYear();
  const echeances = await getEcheancesMois(annee, mois);

  const moisLabel = new Date(annee, mois).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const prevM = mois === 0 ? 11 : mois - 1;
  const prevY = mois === 0 ? annee - 1 : annee;
  const nextM = mois === 11 ? 0 : mois + 1;
  const nextY = mois === 11 ? annee + 1 : annee;

  const payes = echeances.filter((e) => e.paye);
  const partiels = echeances.filter((e) => e.partiel);
  const impayes = echeances.filter((e) => !e.paye && !e.partiel);
  const totalAttendu = echeances.reduce((s, e) => s + e.montant, 0);
  const totalPaye = echeances.reduce((s, e) => s + e.montantPaye, 0);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Calendrier des échéances</h1>
        <div className="flex items-center gap-2">
          <Link href={`/calendrier?m=${prevM}&y=${prevY}`} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-muted">←</Link>
          <span className="text-sm font-medium capitalize min-w-[140px] text-center">{moisLabel}</span>
          <Link href={`/calendrier?m=${nextM}&y=${nextY}`} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-muted">→</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass rounded-xl p-4 text-center"><div className="text-xl font-bold text-foreground">{echeances.length}</div><p className="text-xs text-muted-foreground">Échéances</p></div>
        <div className="glass rounded-xl p-4 text-center"><div className="text-xl font-bold text-emerald-600">{payes.length}</div><p className="text-xs text-muted-foreground">Payés</p></div>
        <div className="glass rounded-xl p-4 text-center"><div className="text-xl font-bold text-red-600">{impayes.length}</div><p className="text-xs text-muted-foreground">Impayés</p></div>
        <div className="glass rounded-xl p-4 text-center"><div className="text-xl font-bold text-primary">{totalAttendu > 0 ? Math.round(totalPaye / totalAttendu * 100) : 0}%</div><p className="text-xs text-muted-foreground">Recouvrement</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-emerald-600">✅ Payés ({payes.length})</CardTitle></CardHeader>
          <CardContent className="max-h-64 overflow-y-auto space-y-2">
            {payes.map((e) => (
              <Link key={e.id} href={`/baux/${e.id}`} className="flex justify-between items-center p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/10 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors">
                <div><p className="text-sm font-medium text-foreground">{e.locataire}</p><p className="text-[10px] text-muted-foreground">{e.appartement}</p></div>
                <span className="text-xs font-bold text-emerald-600">{formatFCFA(e.montant)}</span>
              </Link>
            ))}
            {payes.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aucun</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-orange-600">⏳ Partiels ({partiels.length})</CardTitle></CardHeader>
          <CardContent className="max-h-64 overflow-y-auto space-y-2">
            {partiels.map((e) => (
              <Link key={e.id} href={`/baux/${e.id}`} className="flex justify-between items-center p-2 rounded-lg bg-orange-50/50 dark:bg-orange-950/10 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors">
                <div><p className="text-sm font-medium text-foreground">{e.locataire}</p><p className="text-[10px] text-muted-foreground">{e.appartement}</p></div>
                <div className="text-right"><span className="text-xs font-bold text-orange-600">{formatFCFA(e.montantPaye)}</span><p className="text-[10px] text-muted-foreground">/ {formatFCFA(e.montant)}</p></div>
              </Link>
            ))}
            {partiels.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aucun</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-red-600">❌ Impayés ({impayes.length})</CardTitle></CardHeader>
          <CardContent className="max-h-64 overflow-y-auto space-y-2">
            {impayes.map((e) => (
              <Link key={e.id} href={`/baux/${e.id}`} className="flex justify-between items-center p-2 rounded-lg bg-red-50/50 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                <div><p className="text-sm font-medium text-foreground">{e.locataire}</p><p className="text-[10px] text-muted-foreground">{e.appartement} — dû le {e.jourLimite}</p></div>
                <span className="text-xs font-bold text-red-600">{formatFCFA(e.montant)}</span>
              </Link>
            ))}
            {impayes.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Tous payés ✅</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
