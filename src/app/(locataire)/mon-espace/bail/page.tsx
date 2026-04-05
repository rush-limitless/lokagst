import { getMonBail } from "@/actions/portail-locataire";
import { formatFCFA, formatDate, ETAGE_LABELS, STATUT_BAIL_LABELS } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function MonBail() {
  const bail = await getMonBail();
  if (!bail) return <div><h1 className="text-2xl font-bold text-blue-950">Mon bail</h1><p className="text-gray-500 mt-4">Aucun bail actif.</p></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-950">Mon bail</h1>
      <Card>
        <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div><span className="text-gray-500 text-sm">Appartement</span><p className="font-medium">{bail.appartement.numero} — {ETAGE_LABELS[bail.appartement.etage]}</p></div>
          <div><span className="text-gray-500 text-sm">Type</span><p className="font-medium">{bail.appartement.type}</p></div>
          <div><span className="text-gray-500 text-sm">Statut</span><p><Badge variant="outline" className="text-green-600">{STATUT_BAIL_LABELS[bail.statut]}</Badge></p></div>
          <div><span className="text-gray-500 text-sm">Date de début</span><p className="font-medium">{formatDate(bail.dateDebut)}</p></div>
          <div><span className="text-gray-500 text-sm">Date de fin</span><p className="font-medium">{formatDate(bail.dateFin)}</p></div>
          <div><span className="text-gray-500 text-sm">Durée</span><p className="font-medium">{bail.dureeMois} mois</p></div>
          <div><span className="text-gray-500 text-sm">Loyer mensuel</span><p className="font-medium text-lg">{formatFCFA(bail.montantLoyer)}</p></div>
          <div><span className="text-gray-500 text-sm">Caution versée</span><p className="font-medium">{formatFCFA(bail.montantCaution)}</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
