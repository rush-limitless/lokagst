import { getAppartement } from "@/actions/appartements";
import { formatFCFA, formatDate, ETAGE_LABELS, STATUT_BAIL_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

export default async function AppartementDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const appart = await getAppartement(id);
  if (!appart) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-950">Appartement {appart.numero}</h1>
      <Card>
        <CardContent className="pt-6 grid grid-cols-2 gap-4">
          <div><span className="text-gray-500 text-sm">Étage</span><p className="font-medium">{ETAGE_LABELS[appart.etage]}</p></div>
          <div><span className="text-gray-500 text-sm">Type</span><p className="font-medium">{appart.type}</p></div>
          <div><span className="text-gray-500 text-sm">Loyer de base</span><p className="font-medium">{formatFCFA(appart.loyerBase)}</p></div>
          <div><span className="text-gray-500 text-sm">Statut</span><p><Badge variant={appart.statut === "LIBRE" ? "outline" : "destructive"}>{appart.statut === "LIBRE" ? "Libre" : "Occupé"}</Badge></p></div>
          {appart.description && <div className="col-span-2"><span className="text-gray-500 text-sm">Description</span><p>{appart.description}</p></div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Historique des baux</CardTitle></CardHeader>
        <CardContent>
          {appart.baux.length === 0 ? <p className="text-gray-500 text-sm">Aucun bail</p> : (
            <div className="space-y-2">
              {appart.baux.map((b) => (
                <div key={b.id} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <span className="font-medium">{b.locataire.prenom} {b.locataire.nom}</span>
                    <span className="text-gray-500 text-sm ml-2">{formatDate(b.dateDebut)} → {formatDate(b.dateFin)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{formatFCFA(b.montantLoyer)}/mois</span>
                    <Badge variant="outline">{STATUT_BAIL_LABELS[b.statut]}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
