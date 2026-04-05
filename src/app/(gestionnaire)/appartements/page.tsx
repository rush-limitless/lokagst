import { getAppartements } from "@/actions/appartements";
import { formatFCFA, ETAGE_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AppartementsPage() {
  const appartements = await getAppartements();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-950">Appartements</h1>
        <Link href="/appartements/nouveau"><Button>+ Ajouter</Button></Link>
      </div>
      <p className="text-gray-500">{appartements.length} appartements ({appartements.filter(a => a.statut === "OCCUPE").length} occupés, {appartements.filter(a => a.statut === "LIBRE").length} libres)</p>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-sm text-gray-500">
            <tr>
              <th className="p-3">Numéro</th>
              <th className="p-3">Étage</th>
              <th className="p-3">Type</th>
              <th className="p-3">Loyer</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Locataire</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {appartements.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium">{a.numero}</td>
                <td className="p-3">{ETAGE_LABELS[a.etage]}</td>
                <td className="p-3">{a.type}</td>
                <td className="p-3">{formatFCFA(a.loyerBase)}</td>
                <td className="p-3">
                  <Badge variant={a.statut === "LIBRE" ? "outline" : "destructive"} className={a.statut === "LIBRE" ? "text-green-600 border-green-600" : ""}>
                    {a.statut === "LIBRE" ? "Libre" : "Occupé"}
                  </Badge>
                </td>
                <td className="p-3 text-sm text-gray-500">{a.locataireActuel ? `${a.locataireActuel.prenom} ${a.locataireActuel.nom}` : "—"}</td>
                <td className="p-3"><Link href={`/appartements/${a.id}`} className="text-blue-600 text-sm hover:underline">Voir</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
