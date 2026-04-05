import { getLocataires } from "@/actions/locataires";
import { ETAGE_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function LocatairesPage() {
  const locataires = await getLocataires({ statut: "ACTIF" });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-950">Locataires</h1>
        <Link href="/locataires/nouveau"><Button>+ Ajouter</Button></Link>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-sm text-gray-500">
            <tr><th className="p-3">Nom</th><th className="p-3">Téléphone</th><th className="p-3">Appartement</th><th className="p-3">Statut</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {locataires.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium">{l.prenom} {l.nom}</td>
                <td className="p-3">{l.telephone}</td>
                <td className="p-3">{l.baux[0]?.appartement ? `${l.baux[0].appartement.numero} (${ETAGE_LABELS[l.baux[0].appartement.etage]})` : "—"}</td>
                <td className="p-3"><Badge variant="outline" className="text-green-600 border-green-600">Actif</Badge></td>
                <td className="p-3"><Link href={`/locataires/${l.id}`} className="text-blue-600 text-sm hover:underline">Voir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
