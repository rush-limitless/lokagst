import { getDepenses, getBilanComptable } from "@/actions/depenses";
import { formatFCFA, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { NouvelleDepenseForm } from "./nouvelle-depense-form";
import { SupprimerDepenseButton } from "./supprimer-depense-button";

const CAT_LABELS: Record<string, string> = {
  TRAVAUX: "🔨 Travaux", ENTRETIEN: "🧹 Entretien", ASSURANCE: "🛡️ Assurance",
  TAXE_FONCIERE: "🏛️ Taxe foncière", EAU_ELECTRICITE: "💡 Eau/Électricité",
  FRAIS_GESTION: "📋 Frais de gestion", AUTRE: "📦 Autre",
};

export default async function DepensesPage({ searchParams }: { searchParams: Promise<{ annee?: string }> }) {
  const { annee } = await searchParams;
  const year = annee ? parseInt(annee) : new Date().getFullYear();
  const [depenses, bilan] = await Promise.all([getDepenses({ annee: year }), getBilanComptable(year)]);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">📒 Dépenses &amp; Comptabilité</h1>
          <p className="text-sm text-muted-foreground">Suivi des dépenses et bilan comptable {year}</p>
        </div>
        <div className="flex gap-2">
          {[year - 1, year, year + 1].filter((y) => y <= new Date().getFullYear()).map((y) => (
            <Link key={y} href={`/depenses?annee=${y}`} className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${y === year ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{y}</Link>
          ))}
        </div>
      </div>

      {/* Bilan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="pt-5"><p className="text-[11px] text-emerald-600 font-medium uppercase">Revenus</p><p className="text-xl font-bold text-emerald-700 mt-1">{formatFCFA(bilan.totalRevenus)}</p></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-5"><p className="text-[11px] text-red-600 font-medium uppercase">Dépenses</p><p className="text-xl font-bold text-red-700 mt-1">{formatFCFA(bilan.totalDepenses)}</p></CardContent>
        </Card>
        <Card className={`bg-gradient-to-br ${bilan.resultatNet >= 0 ? "from-sky-50 to-sky-100/50 dark:from-sky-950/30 border-sky-200 dark:border-sky-800" : "from-orange-50 to-orange-100/50 dark:from-orange-950/30 border-orange-200 dark:border-orange-800"}`}>
          <CardContent className="pt-5"><p className="text-[11px] text-sky-600 font-medium uppercase">Résultat net</p><p className={`text-xl font-bold mt-1 ${bilan.resultatNet >= 0 ? "text-sky-700" : "text-orange-700"}`}>{formatFCFA(bilan.resultatNet)}</p></CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5"><p className="text-[11px] text-muted-foreground font-medium uppercase">Nb dépenses</p><p className="text-xl font-bold text-foreground mt-1">{depenses.length}</p></CardContent>
        </Card>
      </div>

      {/* Par catégorie */}
      {Object.keys(bilan.parCategorie).length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Répartition par catégorie</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(bilan.parCategorie).sort((a, b) => b[1] - a[1]).map(([cat, montant]) => {
                const pct = bilan.totalDepenses > 0 ? Math.round((montant / bilan.totalDepenses) * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1"><span>{CAT_LABELS[cat] || cat}</span><span className="font-medium">{formatFCFA(montant)} ({pct}%)</span></div>
                    <div className="bg-muted rounded-full h-2 overflow-hidden"><div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulaire + Liste */}
      <NouvelleDepenseForm />

      {depenses.length === 0 ? (
        <div className="text-center py-8"><div className="text-4xl mb-3">📭</div><p className="text-muted-foreground">Aucune dépense enregistrée en {year}</p></div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr><th className="text-left p-3">Date</th><th className="text-left p-3">Catégorie</th><th className="text-left p-3">Description</th><th className="text-left p-3">Immeuble</th><th className="text-right p-3">Montant</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {depenses.map((d) => (
                <tr key={d.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">{formatDate(d.date)}</td>
                  <td className="p-3"><Badge variant="outline" className="text-xs">{CAT_LABELS[d.categorie] || d.categorie}</Badge></td>
                  <td className="p-3"><p className="font-medium">{d.description}</p>{d.fournisseur && <p className="text-xs text-muted-foreground">{d.fournisseur}</p>}</td>
                  <td className="p-3 text-muted-foreground">{d.immeuble?.nom || "Général"}</td>
                  <td className="p-3 text-right font-medium text-red-600">{formatFCFA(d.montant)}</td>
                  <td className="p-3"><SupprimerDepenseButton id={d.id} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
