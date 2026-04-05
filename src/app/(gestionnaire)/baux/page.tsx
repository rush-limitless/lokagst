import { getBaux } from "@/actions/baux";
import { formatFCFA, formatDate, STATUT_BAIL_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function BauxPage() {
  const baux = await getBaux();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-950">Contrats / Baux</h1>
        <Link href="/baux/nouveau"><Button>+ Nouveau bail</Button></Link>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-sm text-gray-500">
            <tr><th className="p-3">Locataire</th><th className="p-3">Appartement</th><th className="p-3">Début</th><th className="p-3">Fin</th><th className="p-3">Loyer</th><th className="p-3">Statut</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {baux.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium">{b.locataire.prenom} {b.locataire.nom}</td>
                <td className="p-3">{b.appartement.numero}</td>
                <td className="p-3 text-sm">{formatDate(b.dateDebut)}</td>
                <td className="p-3 text-sm">{formatDate(b.dateFin)}</td>
                <td className="p-3">{formatFCFA(b.montantLoyer)}</td>
                <td className="p-3"><Badge variant={b.statut === "ACTIF" ? "outline" : "destructive"} className={b.statut === "ACTIF" ? "text-green-600 border-green-600" : ""}>{STATUT_BAIL_LABELS[b.statut]}</Badge></td>
                <td className="p-3"><Link href={`/baux/${b.id}`} className="text-blue-600 text-sm hover:underline">Voir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
