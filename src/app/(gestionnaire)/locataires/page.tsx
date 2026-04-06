import { getLocataires } from "@/actions/locataires";
import { ETAGE_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { UserAvatar } from "@/components/user-avatar";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import Link from "next/link";

export default async function LocatairesPage({ searchParams }: { searchParams: Promise<{ q?: string; statut?: string }> }) {
  const { q, statut } = await searchParams;
  const locataires = await getLocataires({ statut: statut || "ACTIF", recherche: q });

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Locataires</h1>
          <Link href="/situation" className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full hover:bg-secondary/80">📋 Situation</Link>
        </div>
        <Link href="/locataires/nouveau"><Button>+ Ajouter</Button></Link>
      </div>
      <div className="flex gap-3 items-center flex-wrap">
        <SearchBar placeholder="Rechercher un locataire..." />
        <Link href="/locataires" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!statut || statut === "ACTIF" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>Actifs</Link>
        <Link href="/locataires?statut=ARCHIVE" className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${statut === "ARCHIVE" ? "bg-orange-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>Anciens</Link>
      </div>
      {locataires.length === 0 ? (
        <EmptyState icon="👤" title={q ? "Aucun résultat" : "Aucun locataire"} description={q ? "Essayez avec un autre terme de recherche" : "Ajoutez votre premier locataire pour commencer"} />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3 stagger-in">
            {locataires.map((l) => (
              <Link key={l.id} href={`/locataires/${l.id}`} className="block bg-card border rounded-xl p-4 hover:shadow-md hover-bounce transition-all hover:-translate-y-0.5">
                <div className="flex items-center gap-3">
                  <UserAvatar nom={l.nom} prenom={l.prenom} photo={l.photo} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{l.prenom} {l.nom}</p>
                    <p className="text-xs text-muted-foreground">{l.telephone}</p>
                  </div>
                  <div className="text-right">
                    {l.baux[0]?.appartement && <p className="text-xs font-medium text-foreground">{l.baux[0].appartement.numero}</p>}
                    <StatusBadge status={l.statut === "ACTIF" ? "actif" : "archive"} label={l.statut === "ACTIF" ? "Actif" : "Archivé"} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {/* Desktop table */}
          <div className="bg-card rounded-xl border overflow-x-auto hidden md:block">
            <table className="w-full">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase tracking-wider">
                <tr><th className="p-3">Locataire</th><th className="p-3">Téléphone</th><th className="p-3">Appartement</th><th className="p-3">Statut</th><th className="p-3">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {locataires.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar nom={l.nom} prenom={l.prenom} photo={l.photo} size="sm" />
                        <span className="font-medium text-foreground">{l.prenom} {l.nom}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{l.telephone}</td>
                    <td className="p-3 text-sm text-foreground">{l.baux[0]?.appartement ? `${l.baux[0].appartement.numero} (${ETAGE_LABELS[l.baux[0].appartement.etage]})` : "—"}</td>
                    <td className="p-3"><StatusBadge status={l.statut === "ACTIF" ? "actif" : "archive"} label={l.statut === "ACTIF" ? "Actif" : "Archivé"} /></td>
                    <td className="p-3"><Link href={`/locataires/${l.id}`} className="text-primary text-sm hover:underline font-medium">Voir →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
