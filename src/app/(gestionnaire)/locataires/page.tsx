import { getLocataires } from "@/actions/locataires";
import { ETAGE_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import Link from "next/link";

export default async function LocatairesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const locataires = await getLocataires({ statut: "ACTIF", recherche: q });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-950">Locataires</h1>
        <Link href="/locataires/nouveau"><Button>+ Ajouter</Button></Link>
      </div>
      <SearchBar placeholder="Rechercher un locataire..." />
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-sm text-gray-500">
            <tr><th className="p-3">Locataire</th><th className="p-3">Téléphone</th><th className="p-3">Appartement</th><th className="p-3">Statut</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {locataires.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {l.photo ? <img src={l.photo} alt="" className="w-9 h-9 rounded-full object-cover" /> : <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">{l.prenom[0]}{l.nom[0]}</div>}
                    <span className="font-medium">{l.prenom} {l.nom}</span>
                  </div>
                </td>
                <td className="p-3">{l.telephone}</td>
                <td className="p-3">{l.baux[0]?.appartement ? `${l.baux[0].appartement.numero} (${ETAGE_LABELS[l.baux[0].appartement.etage]})` : "—"}</td>
                <td className="p-3"><Badge variant="outline" className="text-green-600 border-green-600">Actif</Badge></td>
                <td className="p-3"><Link href={`/locataires/${l.id}`} className="text-blue-600 text-sm hover:underline">Voir</Link></td>
              </tr>
            ))}
            {locataires.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-gray-500">{q ? "Aucun résultat" : "Aucun locataire"}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
