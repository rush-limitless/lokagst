import { getPaiements } from "@/actions/paiements";
import { formatFCFA, formatDate, MODE_PAIEMENT_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { SearchBar } from "@/components/search-bar";
import Link from "next/link";
import { EnvoyerRecuButton } from "./envoyer-recu-button";
import { SupprimerPaiementButton } from "./supprimer-paiement-button";

export default async function PaiementsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; appart?: string; mois?: string }> }) {
  const { q, page, appart, mois } = await searchParams;
  const currentPage = parseInt(page || "1");
  const { paiements: allPaiements, total, pages } = await getPaiements({ page: currentPage, limit: 50 });

  let filtered = allPaiements;
  if (q) filtered = filtered.filter((p) => `${p.bail.locataire.prenom} ${p.bail.locataire.nom}`.toLowerCase().includes(q.toLowerCase()));
  if (appart) filtered = filtered.filter((p) => p.bail.appartement.numero.toLowerCase().includes(appart.toLowerCase()));
  if (mois) {
    const [y, m] = mois.split("-").map(Number);
    filtered = filtered.filter((p) => new Date(p.moisConcerne).getFullYear() === y && new Date(p.moisConcerne).getMonth() === m - 1);
  }

  const totalMois = filtered.filter((p) => {
    const now = new Date();
    return new Date(p.moisConcerne).getMonth() === now.getMonth() && new Date(p.moisConcerne).getFullYear() === now.getFullYear();
  }).reduce((s, p) => s + p.montant, 0);

  const enAttente = filtered.filter((p) => !p.valide).length;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Paiements</h1>
          <Link href="/calendrier" className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full hover:bg-secondary/80">📅 Calendrier</Link>
        </div>
        <Link href="/paiements/nouveau"><Button>+ Enregistrer</Button></Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="glass rounded-xl p-4 text-center"><div className="text-lg font-bold text-emerald-600">{formatFCFA(totalMois)}</div><p className="text-xs text-muted-foreground">Encaissé ce mois</p></div>
        <div className="glass rounded-xl p-4 text-center"><div className="text-lg font-bold text-foreground">{total}</div><p className="text-xs text-muted-foreground">Total paiements</p></div>
        {enAttente > 0 && <div className="glass rounded-xl p-4 text-center"><div className="text-lg font-bold text-orange-600">{enAttente}</div><p className="text-xs text-muted-foreground">En attente de validation</p></div>}
      </div>

      <SearchBar placeholder="Filtrer par locataire..." />

      {/* Filtres avancés */}
      <form className="flex gap-2 flex-wrap items-end">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-muted-foreground uppercase">Locataire</label>
          <input name="q" defaultValue={q || ""} placeholder="Nom..." className="h-8 px-2 text-xs border rounded-md bg-background w-36" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-muted-foreground uppercase">Appartement</label>
          <input name="appart" defaultValue={appart || ""} placeholder="Ex: A12, SB..." className="h-8 px-2 text-xs border rounded-md bg-background w-32" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-muted-foreground uppercase">Mois</label>
          <input name="mois" type="month" defaultValue={mois || ""} className="h-8 px-2 text-xs border rounded-md bg-background" />
        </div>
        <Button type="submit" size="sm" variant="outline" className="h-8 text-xs">Filtrer</Button>
        {(q || appart || mois) && <Link href="/paiements"><Button type="button" size="sm" variant="ghost" className="h-8 text-xs">✕ Reset</Button></Link>}
      </form>

      <div className="bg-card rounded-xl border overflow-x-auto table-scroll">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
            <tr><th className="p-3 text-left">Locataire</th><th className="p-3">Appart.</th><th className="p-3">Mois</th><th className="p-3 text-right">Loyer</th><th className="p-3 text-right">Charges</th><th className="p-3 text-right">Caution</th><th className="p-3 text-right">Total</th><th className="p-3">Mode</th><th className="p-3">Statut</th><th className="p-3">Preuve</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p) => (
              <tr key={p.id} className={`hover:bg-muted/30 transition-colors ${!p.valide ? "bg-orange-50/50 dark:bg-orange-950/10" : ""}`}>
                <td className="p-3 font-medium text-foreground">{p.bail.locataire.prenom} {p.bail.locataire.nom}</td>
                <td className="p-3 text-center text-muted-foreground">{p.bail.appartement.numero}</td>
                <td className="p-3 text-center text-muted-foreground">{formatDate(p.moisConcerne)}</td>
                <td className="p-3 text-right text-muted-foreground">{formatFCFA(p.montantLoyer)}</td>
                <td className="p-3 text-right text-muted-foreground">{formatFCFA(p.montantCharges)}</td>
                <td className="p-3 text-right text-muted-foreground">{p.montantCaution > 0 ? formatFCFA(p.montantCaution) : "—"}</td>
                <td className="p-3 text-right font-medium text-foreground">{formatFCFA(p.montant)}</td>
                <td className="p-3 text-center text-xs text-muted-foreground">{MODE_PAIEMENT_LABELS[p.modePaiement] || p.modePaiement}</td>
                <td className="p-3">
                  {!p.valide ? <StatusBadge status="en_cours" label="En attente" /> : <StatusBadge status={p.statut === "PAYE" ? "paye" : "partiel"} label={p.statut === "PAYE" ? "Payé" : "Partiel"} />}
                </td>
                <td className="p-3">{p.preuvePaiement ? <a href={p.preuvePaiement} target="_blank" className="text-primary text-xs">📎 Voir</a> : <span className="text-muted-foreground text-xs">—</span>}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Link href={`/paiements/recu?id=${p.id}`} className="text-primary text-xs hover:underline">Reçu</Link>
                    {p.statut === "PAYE" && <Link href={`/paiements/quittance?id=${p.id}`} className="text-emerald-600 text-xs hover:underline">Quittance</Link>}
                    <EnvoyerRecuButton paiementId={p.id} />
                    <SupprimerPaiementButton id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={11} className="p-6 text-center text-muted-foreground">Aucun paiement</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {currentPage > 1 && (
            <Link href={`/paiements?page=${currentPage - 1}${q ? `&q=${q}` : ""}`}>
              <Button variant="outline" size="sm">← Précédent</Button>
            </Link>
          )}
          <span className="flex items-center text-sm text-muted-foreground px-3">
            Page {currentPage} / {pages} ({total} paiements)
          </span>
          {currentPage < pages && (
            <Link href={`/paiements?page=${currentPage + 1}${q ? `&q=${q}` : ""}`}>
              <Button variant="outline" size="sm">Suivant →</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
