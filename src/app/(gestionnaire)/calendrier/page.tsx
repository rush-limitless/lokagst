import { getEcheancesMois } from "@/actions/calendrier";
import { formatFCFA } from "@/lib/utils";
import Link from "next/link";

export default async function CalendrierPage({ searchParams }: { searchParams: Promise<{ m?: string; y?: string; vue?: string }> }) {
  const { m, y, vue } = await searchParams;
  const now = new Date();
  const mois = m ? parseInt(m) : now.getMonth();
  const annee = y ? parseInt(y) : now.getFullYear();
  const echeances = await getEcheancesMois(annee, mois);

  const moisLabel = new Date(annee, mois).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const prevM = mois === 0 ? 11 : mois - 1;
  const prevY = mois === 0 ? annee - 1 : annee;
  const nextM = mois === 11 ? 0 : mois + 1;
  const nextY = mois === 11 ? annee + 1 : annee;

  // Vue semaine : filtrer les échéances dont le jourLimite est dans les 7 prochains jours
  const isSemaine = vue === "semaine";
  const jourAujourdhui = now.getDate();
  const echeancesFiltrees = isSemaine
    ? echeances.filter((e) => e.jourLimite >= jourAujourdhui && e.jourLimite <= jourAujourdhui + 7)
    : echeances;

  const payes = echeancesFiltrees.filter((e) => e.paye);
  const partiels = echeancesFiltrees.filter((e) => e.partiel);
  const impayes = echeancesFiltrees.filter((e) => !e.paye && !e.partiel);
  const totalAttendu = echeancesFiltrees.reduce((s, e) => s + e.montant, 0);
  const totalPaye = echeancesFiltrees.reduce((s, e) => s + e.montantPaye, 0);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Calendrier des échéances</h1>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 border rounded-lg p-0.5">
            <Link href={`/calendrier?m=${mois}&y=${annee}`} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${!isSemaine ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Mois</Link>
            <Link href={`/calendrier?m=${mois}&y=${annee}&vue=semaine`} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${isSemaine ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Semaine</Link>
          </div>
          <Link href={`/calendrier?m=${prevM}&y=${prevY}${isSemaine ? "&vue=semaine" : ""}`} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-muted">←</Link>
          <span className="text-sm font-medium capitalize min-w-[140px] text-center">{moisLabel}</span>
          <Link href={`/calendrier?m=${nextM}&y=${nextY}${isSemaine ? "&vue=semaine" : ""}`} className="px-3 py-1.5 border rounded-lg text-sm hover:bg-muted">→</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass rounded-xl p-4 text-center"><div className="text-xl font-bold text-foreground">{echeances.length}</div><p className="text-xs text-muted-foreground">Échéances</p></div>
        <div className="glass rounded-xl p-4 text-center"><div className="text-xl font-bold text-emerald-600">{payes.length}</div><p className="text-xs text-muted-foreground">Payés</p></div>
        <div className="glass rounded-xl p-4 text-center"><div className="text-xl font-bold text-red-600">{impayes.length}</div><p className="text-xs text-muted-foreground">Impayés</p></div>
        <div className="glass rounded-xl p-4 text-center"><div className="text-xl font-bold text-primary">{totalAttendu > 0 ? Math.round(totalPaye / totalAttendu * 100) : 0}%</div><p className="text-xs text-muted-foreground">Recouvrement</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px]">
        {/* Colonne PAYÉS */}
        <div className="bg-card rounded-2xl border p-3 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm font-bold text-foreground">Payés</span>
            </div>
            <span className="text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">{payes.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {payes.map((e) => (
              <Link key={e.id} href={`/baux/${e.id}`} className="block p-3 bg-white dark:bg-gray-900 rounded-xl border border-emerald-100 dark:border-emerald-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <p className="text-sm font-semibold text-foreground">{e.locataire}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{e.appartement}{e.periodicite !== "MENSUEL" ? ` · ${e.periodicite.toLowerCase()}` : ""}</p>
                <p className="text-xs font-bold text-emerald-600 mt-2">{formatFCFA(e.montant)} ✓</p>
              </Link>
            ))}
            {payes.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucun paiement</p>}
          </div>
        </div>

        {/* Colonne PARTIELS */}
        <div className="bg-card rounded-2xl border p-3 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm font-bold text-foreground">Partiels</span>
            </div>
            <span className="text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">{partiels.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {partiels.map((e) => (
              <Link key={e.id} href={`/baux/${e.id}`} className="block p-3 bg-white dark:bg-gray-900 rounded-xl border border-orange-100 dark:border-orange-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <p className="text-sm font-semibold text-foreground">{e.locataire}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{e.appartement}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-orange-600 font-bold">{formatFCFA(e.montantPaye)}</span>
                    <span className="text-muted-foreground">/ {formatFCFA(e.montant)}</span>
                  </div>
                  <div className="h-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.round(e.montantPaye / e.montant * 100)}%` }} />
                  </div>
                </div>
              </Link>
            ))}
            {partiels.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Aucun</p>}
          </div>
        </div>

        {/* Colonne IMPAYÉS */}
        <div className="bg-card rounded-2xl border p-3 flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-bold text-foreground">Impayés</span>
            </div>
            <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">{impayes.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {impayes.map((e) => (
              <Link key={e.id} href={`/baux/${e.id}`} className="block p-3 bg-white dark:bg-gray-900 rounded-xl border border-red-100 dark:border-red-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <p className="text-sm font-semibold text-foreground">{e.locataire}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{e.appartement} — dû le {e.jourLimite}</p>
                <p className="text-xs font-bold text-red-600 mt-2">{formatFCFA(e.montant)}</p>
              </Link>
            ))}
            {impayes.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">✅ Tous payés !</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
