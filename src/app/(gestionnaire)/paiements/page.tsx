import { getPaiements } from "@/actions/paiements";
import { formatFCFA, formatMois } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import { EnvoyerRecuButton } from "./envoyer-recu-button";
import { SupprimerPaiementButton } from "./supprimer-paiement-button";
import { ValiderPaiementButton } from "./valider-paiement-button";
import { Plus, Calendar, Wallet, Filter, X, Receipt, FileCheck, Paperclip } from "lucide-react";

export default async function PaiementsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; appart?: string; mois?: string; valide?: string }> }) {
  const { q, page, appart, mois, valide } = await searchParams;
  const currentPage = parseInt(page || "1");

  // Filtre côté serveur
  const where: any = {};
  if (q) where.bail = { locataire: { OR: [{ nom: { contains: q, mode: "insensitive" } }, { prenom: { contains: q, mode: "insensitive" } }] } };
  if (appart) where.bail = { ...where.bail, appartement: { numero: { contains: appart, mode: "insensitive" } } };
  if (mois) {
    const [y, m] = mois.split("-").map(Number);
    where.moisConcerne = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
  }
  if (valide === "oui") where.valide = true;
  else if (valide === "non") where.valide = false;

  const { paiements: allPaiements, total, pages } = await getPaiements({ page: currentPage, limit: 50, where });
  const filtered = allPaiements;

  const now = new Date();
  const totalMois = filtered.filter((p) => new Date(p.moisConcerne).getMonth() === now.getMonth() && new Date(p.moisConcerne).getFullYear() === now.getFullYear()).reduce((s, p) => s + p.montant, 0);
  const enAttente = filtered.filter((p) => !p.valide).length;
  const hasFilters = q || appart || mois || valide;

  // Soldes par immeuble (basé sur les paiements du mois courant)
  const paiementsMoisCourant = allPaiements.filter((p) => new Date(p.moisConcerne).getMonth() === now.getMonth() && new Date(p.moisConcerne).getFullYear() === now.getFullYear());
  const parImmeuble: Record<string, number> = {};
  paiementsMoisCourant.forEach((p) => {
    const appt = p.bail.appartement.numero;
    const imm = appt.includes("SB") ? "Santa Barbara" : "La'ag Tchang";
    parImmeuble[imm] = (parImmeuble[imm] || 0) + p.montant;
  });

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

      {/* Soldes par immeuble */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        <div className="flex-shrink-0 bg-gradient-to-br from-sky-500 to-sky-700 rounded-xl p-4 text-white min-w-[180px]">
          <p className="text-sky-100 text-[10px] uppercase tracking-wider">Total ce mois</p>
          <p className="text-xl font-bold mt-1">{formatFCFA(totalMois)}</p>
        </div>
        {Object.entries(parImmeuble).map(([imm, montant]) => (
          <div key={imm} className="flex-shrink-0 bg-card border rounded-xl p-4 min-w-[160px]">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">🏢 {imm}</p>
            <p className="text-lg font-bold text-foreground mt-1">{formatFCFA(montant)}</p>
          </div>
        ))}
        {enAttente > 0 && (
          <div className="flex-shrink-0 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 min-w-[140px]">
            <p className="text-[10px] text-orange-600 uppercase tracking-wider">⏳ En attente</p>
            <p className="text-lg font-bold text-orange-600 mt-1">{enAttente}</p>
          </div>
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
            <select name="valide" defaultValue={valide || ""} className="h-8 px-2.5 text-xs border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
              <option value="">Tous</option>
              <option value="oui">✅ Validés</option>
              <option value="non">⏳ En attente</option>
            </select>
            <Button type="submit" size="sm" variant="outline" className="h-8 text-xs gap-1"><Filter className="size-3" /> Filtrer</Button>
            {hasFilters && <Link href="/paiements"><Button type="button" size="sm" variant="ghost" className="h-8 text-xs gap-1"><X className="size-3" /> Reset</Button></Link>}
          </form>
        </CardContent>
      </Card>

      {/* Mobile cards view */}
      <div className="md:hidden space-y-3">
        {filtered.map((p) => (
          <Card key={p.id} className={`${!p.valide ? "border-orange-200 dark:border-orange-800" : ""}`}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                    {p.bail.locataire.prenom[0]}{p.bail.locataire.nom[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.bail.locataire.prenom} {p.bail.locataire.nom}</p>
                    <p className="text-[10px] text-muted-foreground">{p.bail.appartement.numero} · {formatMois(p.moisConcerne)}</p>
                  </div>
                </div>
                {!p.valide ? <Badge variant="outline" className="text-orange-600 border-orange-300 text-[10px]">En attente</Badge> : <Badge variant={p.statut === "PAYE" ? "outline" : "destructive"} className={p.statut === "PAYE" ? "text-emerald-600 border-emerald-300 text-[10px]" : "text-[10px]"}>{p.statut === "PAYE" ? "Payé" : "Partiel"}</Badge>}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">{formatFCFA(p.montant)}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {p.modePaiement === "MOBILE_MONEY" ? "🟠 Mobile" : p.modePaiement === "ESPECES" ? "💵 Espèces" : "🏦 Virement"}
                </Badge>
              </div>
              {(p.montantLoyer > 0 || p.montantCharges > 0) && (
                <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                  {p.montantLoyer > 0 && <span>Loyer: {formatFCFA(p.montantLoyer)}</span>}
                  {p.montantCharges > 0 && <span>Charges: {formatFCFA(p.montantCharges)}</span>}
                  {p.montantCaution > 0 && <span>Caution: {formatFCFA(p.montantCaution)}</span>}
                </div>
              )}
              <div className="flex items-center justify-end gap-1 mt-2">
                <Link href={`/paiements/recu?id=${p.id}`}><Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1"><Receipt className="size-3" /> Reçu</Button></Link>
                {!p.valide && <ValiderPaiementButton id={p.id} />}
                <SupprimerPaiementButton id={p.id} />
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">Aucun paiement trouvé</div>}
      </div>

      {/* Desktop Table */}
      <Card className="overflow-hidden hidden md:block">
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
                      {p.modePaiement === "MOBILE_MONEY" ? "🟠 Mobile" : p.modePaiement === "ESPECES" ? "💵 Espèces" : "🏦 Vir."}
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
                      {!p.valide && <ValiderPaiementButton id={p.id} />}
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
          {currentPage > 1 && <Link href={`/paiements?page=${currentPage - 1}${q ? `&q=${q}` : ""}${appart ? `&appart=${appart}` : ""}${mois ? `&mois=${mois}` : ""}${valide ? `&valide=${valide}` : ""}`}><Button variant="outline" size="sm">← Précédent</Button></Link>}
          <span className="flex items-center text-sm text-muted-foreground px-3">Page {currentPage} / {pages} ({total})</span>
          {currentPage < pages && <Link href={`/paiements?page=${currentPage + 1}${q ? `&q=${q}` : ""}${appart ? `&appart=${appart}` : ""}${mois ? `&mois=${mois}` : ""}${valide ? `&valide=${valide}` : ""}`}><Button variant="outline" size="sm">Suivant →</Button></Link>}
        </div>
      )}
    </div>
  );
}
