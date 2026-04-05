import { getPaiements } from "@/actions/paiements";
import { formatFCFA, formatDate, MODE_PAIEMENT_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { EnvoyerRecuButton } from "./envoyer-recu-button";

export default async function PaiementsPage() {
  const paiements = await getPaiements();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-950">Paiements</h1>
        <Link href="/paiements/nouveau"><Button>+ Enregistrer</Button></Link>
      </div>
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left text-sm text-gray-500">
            <tr><th className="p-3">Locataire</th><th className="p-3">Appart.</th><th className="p-3">Mois</th><th className="p-3">Montant</th><th className="p-3">Mode</th><th className="p-3">Statut</th><th className="p-3">Preuve</th><th className="p-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {paiements.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium">{p.bail.locataire.prenom} {p.bail.locataire.nom}</td>
                <td className="p-3">{p.bail.appartement.numero}</td>
                <td className="p-3 text-sm">{formatDate(p.moisConcerne)}</td>
                <td className="p-3">{formatFCFA(p.montant)}</td>
                <td className="p-3 text-sm">{MODE_PAIEMENT_LABELS[p.modePaiement]}</td>
                <td className="p-3"><Badge variant={p.statut === "PAYE" ? "outline" : "destructive"} className={p.statut === "PAYE" ? "text-green-600 border-green-600" : ""}>{p.statut === "PAYE" ? "Payé" : "Partiel"}</Badge></td>
                <td className="p-3">{p.preuvePaiement ? <a href={p.preuvePaiement} target="_blank" className="text-blue-600 text-sm">📎 Voir</a> : <span className="text-gray-400 text-sm">—</span>}</td>
                <td className="p-3 flex gap-2">
                  <Link href={`/paiements/recu?id=${p.id}`} className="text-blue-600 text-sm hover:underline">Reçu</Link>
                  {p.statut === "PAYE" && <Link href={`/paiements/quittance?id=${p.id}`} className="text-green-600 text-sm hover:underline">Quittance</Link>}
                  <EnvoyerRecuButton paiementId={p.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
