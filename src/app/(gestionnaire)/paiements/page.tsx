import { getPaiements } from "@/actions/paiements";
import { formatFCFA, formatMois } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import { EnvoyerRecuButton } from "./envoyer-recu-button";
import { SupprimerPaiementButton } from "./supprimer-paiement-button";
import { Plus, Calendar, Wallet, Clock, Filter, X, Receipt, FileCheck, Paperclip } from "lucide-react";

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

  const now = new Date();
  const totalMois = filtered.filter((p) => new Date(p.moisConcerne).getMonth() === now.getMonth() && new Date(p.moisConcerne).getFullYear() === now.getFullYear()).reduce((s, p) => s + p.montant, 0);
  const enAttente = filtered.filter((p) => !p.valide).length;
  const hasFilters = q || appart || mois;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2"><Wallet className="size-6 text-primary" /> Paiements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{total} paiements enregistrés</p>
        </div>
        <div className="flex gap-2">
          <Link href="/calendrier"><Button variant="outline" size="sm" className="gap-1.5"><Calendar className="size-3.5" /> Calendrier</Button></Link>
          <Link href="/paiements/nouveau"><Button size="sm" className="gap-1.5"><Plus className="size-3.5" /> Enregistrer</Button></Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center"><Wallet className="size-5 text-emerald-600" /></div>
              <div>
                <p className="text-lg font-bold text-emerald-600">{formatFCFA(totalMois)}</p>
                <p className="text-[11px] text-muted-foreground">Encaissé ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center"><Receipt className="size-5 text-sky-600" /></div>
              <div>
                <p className="text-lg font-bold text-foreground">{total}</p>
                <p className="text-[11px] text-muted-foreground">Total paiements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {enAttente > 0 && (
          <Card className="border-orange-200 dark:border-orange-800">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center"><Clock className="size-5 text-orange-600" /></div>
                <div>
                  <p className="text-lg font-bold text-orange-600">{enAttente}</p>
                  <p className="text-[11px] text-muted-foreground">En attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <form className="flex gap-3 flex-wrap items-end">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Filter className="size-3.5" /> Filtres</div>
            <input name="q" defaultValue={q || ""} placeholder="Locataire..." className="h-8 px-2.5 text-xs border rounded-lg bg-background w-36 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            <input name="appart" defaultValue={appart || ""} placeholder="Appartement..." className="h-8 px-2.5 text-xs border rounded-lg bg-background w-32 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            <input name="mois" type="month" defaultValue={mois || ""} className="h-8 px-2.5 text-xs border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
            <Button type="submit" size="sm" variant="outline" className="h-8 text-xs gap-1"><Filter className="size-3" /> Filtrer</Button>
            {hasFilters && <Link href="/paiements"><Button type="button" size="sm" variant="ghost" className="h-8 text-xs gap-1"><X className="size-3" /> Reset</Button></Link>}
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="p-3 text-left font-medium">Locataire</th>
                <th className="p-3 text-left font-medium">Appart.</th>
                <th className="p-3 text-left font-medium">Mois</th>
                <th className="p-3 text-right font-medium">Loyer</th>
                <th className="p-3 text-right font-medium">Charges</th>
                <th className="p-3 text-right font-medium">Caution</th>
                <th className="p-3 text-right font-medium">Total</th>
                <th className="p-3 text-left font-medium">Mode</th>
                <th className="p-3 text-left font-medium">Statut</th>
                <th className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p) => (
                <tr key={p.id} className={`hover:bg-muted/30 transition-colors ${!p.valide ? "bg-orange-50/50 dark:bg-orange-950/10" : ""}`}>
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                        {p.bail.locataire.prenom[0]}{p.bail.locataire.nom[0]}
                      </div>
                      <span className="font-medium text-foreground text-xs">{p.bail.locataire.prenom} {p.bail.locataire.nom}</span>
                    </div>
                  </td>
                  <td className="p-3"><Badge variant="outline" className="text-[10px] font-normal">{p.bail.appartement.numero}</Badge></td>
                  <td className="p-3 text-xs text-muted-foreground">{formatMois(p.moisConcerne)}</td>
                  <td className="p-3 text-right text-xs text-muted-foreground">{formatFCFA(p.montantLoyer)}</td>
                  <td className="p-3 text-right text-xs text-muted-foreground">{formatFCFA(p.montantCharges)}</td>
                  <td className="p-3 text-right text-xs text-muted-foreground">{p.montantCaution > 0 ? formatFCFA(p.montantCaution) : "—"}</td>
                  <td className="p-3 text-right font-semibold text-foreground text-xs">{formatFCFA(p.montant)}</td>
                  <td className="p-3">
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      {p.modePaiement === "MOBILE_MONEY" ? "📱 MM" : p.modePaiement === "ESPECES" ? "💵 Esp." : "🏦 Vir."}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {!p.valide ? <StatusBadge status="en_cours" label="En attente" /> : <StatusBadge status={p.statut === "PAYE" ? "paye" : "partiel"} label={p.statut === "PAYE" ? "Payé" : "Partiel"} />}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/paiements/recu?id=${p.id}`} title="Reçu"><Button variant="ghost" size="icon-xs"><Receipt className="size-3.5 text-primary" /></Button></Link>
                      {p.statut === "PAYE" && <Link href={`/paiements/quittance?id=${p.id}`} title="Quittance"><Button variant="ghost" size="icon-xs"><FileCheck className="size-3.5 text-emerald-600" /></Button></Link>}
                      {p.preuvePaiement && <a href={p.preuvePaiement} target="_blank" title="Preuve"><Button variant="ghost" size="icon-xs"><Paperclip className="size-3.5 text-muted-foreground" /></Button></a>}
                      <EnvoyerRecuButton paiementId={p.id} />
                      <SupprimerPaiementButton id={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">Aucun paiement trouvé</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {currentPage > 1 && <Link href={`/paiements?page=${currentPage - 1}${q ? `&q=${q}` : ""}`}><Button variant="outline" size="sm">← Précédent</Button></Link>}
          <span className="flex items-center text-sm text-muted-foreground px-3">Page {currentPage} / {pages} ({total})</span>
          {currentPage < pages && <Link href={`/paiements?page=${currentPage + 1}${q ? `&q=${q}` : ""}`}><Button variant="outline" size="sm">Suivant →</Button></Link>}
        </div>
      )}
    </div>
  );
}
