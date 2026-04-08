import { getAppartements } from "@/actions/appartements";
import { getImmeubles } from "@/actions/immeubles";
import { formatFCFA, ETAGE_LABELS, TYPE_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import Link from "next/link";

export default async function AppartementsPage({ searchParams }: { searchParams: Promise<{ q?: string; statut?: string; immeuble?: string }> }) {
  const { q, statut, immeuble } = await searchParams;
  const [appartements, immeubles] = await Promise.all([
    getAppartements({ recherche: q, statut, immeubleId: immeuble }),
    getImmeubles(),
  ]);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Appartements</h1>
        <Link href="/appartements/nouveau"><Button>+ Ajouter</Button></Link>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <SearchBar placeholder="Rechercher par numéro..." />
        <div className="flex gap-1">
          <Link href="/appartements" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!statut && !immeuble ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Tous</Link>
          <Link href="/appartements?statut=LIBRE" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statut === "LIBRE" ? "bg-emerald-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>Libres</Link>
          <Link href="/appartements?statut=OCCUPE" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statut === "OCCUPE" ? "bg-sky-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>Occupés</Link>
        </div>
      </div>
      {/* Filtre par immeuble */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground py-1">Immeuble :</span>
        <Link href={`/appartements${statut ? `?statut=${statut}` : ""}`} className={`text-xs px-3 py-1 rounded-full border transition-colors ${!immeuble ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Tous</Link>
        {immeubles.map((i) => (
          <Link key={i.id} href={`/appartements?immeuble=${i.id}${statut ? `&statut=${statut}` : ""}`} className={`text-xs px-3 py-1 rounded-full border transition-colors ${immeuble === i.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
            {i.nom} ({i._count.appartements})
          </Link>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{appartements.length} appartement(s)</p>

      {appartements.length === 0 ? (
        <EmptyState icon="🏠" title="Aucun appartement" description="Ajoutez votre premier appartement pour commencer" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 stagger-in">
          {appartements.map((a) => (
            <Link key={a.id} href={`/appartements/${a.id}`} className="group">
              <div className={`bg-card border rounded-xl p-4 hover:shadow-lg transition-all hover:-translate-y-1 relative overflow-hidden ${a.statut === "LIBRE" ? "border-emerald-200 dark:border-emerald-900" : "border-sky-200 dark:border-sky-900"}`}>
                <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-[40px] ${a.statut === "LIBRE" ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-sky-50 dark:bg-sky-950/30"}`} />
                <div className="relative">
                  <div className="text-2xl font-bold text-foreground">{a.numero}</div>
                  <p className="text-xs text-muted-foreground mt-1">{ETAGE_LABELS[a.etage]}</p>
                  <p className="text-xs text-muted-foreground">{TYPE_LABELS[a.type] || a.type}</p>
                  {a.immeuble && <p className="text-[10px] text-primary mt-1">{a.immeuble.nom}</p>}
                  <p className="text-sm font-semibold text-foreground mt-3">{formatFCFA(a.loyerBase)}</p>
                  {a.baux[0]?.totalCharges > 0 && <p className="text-xs text-muted-foreground">Charges : {formatFCFA(a.baux[0].totalCharges)}</p>}
                  <div className="mt-2">
                    <StatusBadge status={a.statut === "LIBRE" ? "libre" : "occupe"} label={a.statut === "LIBRE" ? "Libre" : "Occupé"} />
                  </div>
                  {a.locataireActuel && (
                    <p className="text-[10px] text-muted-foreground mt-2 truncate">{a.locataireActuel.prenom} {a.locataireActuel.nom}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
