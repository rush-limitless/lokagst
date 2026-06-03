import { getAppartements } from "@/actions/appartements";
import { getImmeubles } from "@/actions/immeubles";
import { formatFCFA, ETAGE_LABELS, TYPE_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { EmptyState } from "@/components/empty-state";
import Link from "next/link";
import { Home, Plus, Building2 } from "lucide-react";

export default async function AppartementsPage({ searchParams }: { searchParams: Promise<{ q?: string; statut?: string; immeuble?: string }> }) {
  const { q, statut, immeuble } = await searchParams;
  const [appartements, immeubles] = await Promise.all([
    getAppartements({ recherche: q, statut, immeubleId: immeuble }),
    getImmeubles(),
  ]);

  // Group by immeuble then by etage
  const etageOrder = ["CINQUIEME", "QUATRIEME", "TROISIEME", "DEUXIEME", "PREMIER", "RDC", "AUTRE"];
  const grouped: { imm: typeof immeubles[0]; etages: { etage: string; apparts: typeof appartements }[] }[] = [];
  for (const im of immeubles) {
    const apps = appartements.filter((a) => a.immeuble?.id === im.id);
    if (apps.length === 0) continue;
    const etages = etageOrder
      .map((e) => ({ etage: e, apparts: apps.filter((a) => a.etage === e) }))
      .filter((g) => g.apparts.length > 0);
    grouped.push({ imm: im, etages });
  }

  const totalLibres = appartements.filter(a => a.statut === "LIBRE").length;
  const totalOccupes = appartements.filter(a => a.statut === "OCCUPE").length;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2"><Home className="w-6 h-6 text-primary" /> Appartements</h1>
          <p className="text-sm text-muted-foreground mt-1">{appartements.length} logements — {totalOccupes} occupés, {totalLibres} libres</p>
        </div>
        <Link href="/appartements/nouveau"><Button className="gap-1.5"><Plus className="w-4 h-4" /> Ajouter</Button></Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">
        <SearchBar placeholder="Rechercher par numéro..." />
        <div className="flex gap-1">
          <Link href="/appartements" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!statut && !immeuble ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Tous</Link>
          <Link href="/appartements?statut=LIBRE" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statut === "LIBRE" ? "bg-emerald-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>🟢 Libres</Link>
          <Link href="/appartements?statut=OCCUPE" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statut === "OCCUPE" ? "bg-sky-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>🔵 Occupés</Link>
        </div>
      </div>

      {appartements.length === 0 ? (
        <EmptyState icon="" title="Aucun appartement" description="Ajoutez votre premier appartement pour commencer" />
      ) : (
        <div className="space-y-8">
          {grouped.map(({ imm, etages }) => (
            <div key={imm.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm">
              {/* Toit */}
              <div className="bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-white/80" />
                  <div>
                    <h2 className="text-white font-bold text-lg">{imm.nom}</h2>
                    <p className="text-white/60 text-xs">{imm._count.appartements} logements</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                    {appartements.filter(a => a.immeuble?.id === imm.id && a.statut === "LIBRE").length} libres
                  </span>
                  <span className="text-xs bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full">
                    {appartements.filter(a => a.immeuble?.id === imm.id && a.statut === "OCCUPE").length} occupés
                  </span>
                </div>
              </div>

              {/* Étages (vue en coupe) */}
              <div className="divide-y divide-border">
                {etages.map(({ etage, apparts }) => (
                  <div key={etage} className="flex items-stretch">
                    {/* Label étage */}
                    <div className="w-24 md:w-32 flex-shrink-0 bg-muted/30 flex items-center justify-center border-r">
                      <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider text-center px-2">
                        {ETAGE_LABELS[etage] || etage}
                      </span>
                    </div>
                    {/* Appartements de l'étage */}
                    <div className="flex-1 flex flex-wrap gap-2 p-3">
                      {apparts.map((a) => (
                        <Link key={a.id} href={`/appartements/${a.id}`} className="group relative">
                          <div className={`
                            min-w-[140px] md:min-w-[160px] rounded-xl p-3 border-2 transition-all
                            hover:shadow-md hover:-translate-y-0.5
                            ${a.statut === "LIBRE"
                              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-700"
                              : "border-sky-300 bg-sky-50 dark:bg-sky-950/20 dark:border-sky-700"
                            }
                          `}>
                            {/* Indicateur statut */}
                            <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${a.statut === "LIBRE" ? "bg-emerald-500 animate-pulse" : "bg-sky-500"}`} />

                            <p className="font-bold text-sm text-foreground truncate">{a.numero}</p>
                            <p className="text-[10px] text-muted-foreground">{TYPE_LABELS[a.type] || a.type}</p>

                            <div className="mt-2 pt-2 border-t border-current/10">
                              {a.statut === "LIBRE" ? (
                                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Disponible</p>
                              ) : (
                                <>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {a.locataireActuel ? `${a.locataireActuel.prenom} ${a.locataireActuel.nom}` : "Occupé"}
                                  </p>
                                  <p className="text-xs font-semibold text-foreground mt-0.5">{formatFCFA(a.loyerBase)}</p>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Base / fondation */}
              <div className="h-2 bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
