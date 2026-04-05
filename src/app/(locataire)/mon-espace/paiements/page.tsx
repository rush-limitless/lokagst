import { getMesPaiements } from "@/actions/portail-locataire";
import { formatFCFA, formatDate, MODE_PAIEMENT_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function MesPaiements() {
  const paiements = await getMesPaiements();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-950">Mes paiements</h1>
      {paiements.length === 0 ? <p className="text-gray-500">Aucun paiement enregistré.</p> : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-sm text-gray-500">
              <tr><th className="p-3">Mois</th><th className="p-3">Montant</th><th className="p-3">Mode</th><th className="p-3">Date</th><th className="p-3">Statut</th><th className="p-3">Reste dû</th></tr>
            </thead>
            <tbody className="divide-y">
              {paiements.map((p) => (
                <tr key={p.id}>
                  <td className="p-3">{formatDate(p.moisConcerne)}</td>
                  <td className="p-3 font-medium">{formatFCFA(p.montant)}</td>
                  <td className="p-3 text-sm">{MODE_PAIEMENT_LABELS[p.modePaiement]}</td>
                  <td className="p-3 text-sm">{formatDate(p.datePaiement)}</td>
                  <td className="p-3"><Badge variant={p.statut === "PAYE" ? "outline" : "destructive"} className={p.statut === "PAYE" ? "text-green-600 border-green-600" : ""}>{p.statut === "PAYE" ? "Payé" : "Partiel"}</Badge></td>
                  <td className="p-3">{p.resteDu > 0 ? formatFCFA(p.resteDu) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
