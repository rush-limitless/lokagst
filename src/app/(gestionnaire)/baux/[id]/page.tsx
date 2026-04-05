import { getBail } from "@/actions/baux";
import { formatFCFA, formatDate, STATUT_BAIL_LABELS, MODE_PAIEMENT_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

export default async function BailDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bail = await getBail(id);
  if (!bail) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-950">Bail — {bail.locataire.prenom} {bail.locataire.nom}</h1>
      <Card>
        <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div><span className="text-gray-500 text-sm">Appartement</span><p className="font-medium">{bail.appartement.numero}</p></div>
          <div><span className="text-gray-500 text-sm">Début</span><p className="font-medium">{formatDate(bail.dateDebut)}</p></div>
          <div><span className="text-gray-500 text-sm">Fin</span><p className="font-medium">{formatDate(bail.dateFin)}</p></div>
          <div><span className="text-gray-500 text-sm">Loyer</span><p className="font-medium">{formatFCFA(bail.montantLoyer)}</p></div>
          <div><span className="text-gray-500 text-sm">Caution</span><p className="font-medium">{formatFCFA(bail.montantCaution)}</p></div>
          <div><span className="text-gray-500 text-sm">Statut</span><p><Badge variant="outline">{STATUT_BAIL_LABELS[bail.statut]}</Badge></p></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Paiements</CardTitle></CardHeader>
        <CardContent>
          {bail.paiements.length === 0 ? <p className="text-gray-500 text-sm">Aucun paiement</p> : (
            <div className="space-y-1">
              {bail.paiements.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                  <span>{formatDate(p.moisConcerne)}</span>
                  <span className="font-medium">{formatFCFA(p.montant)}</span>
                  <span>{MODE_PAIEMENT_LABELS[p.modePaiement]}</span>
                  <Badge variant={p.statut === "PAYE" ? "outline" : "destructive"} className={p.statut === "PAYE" ? "text-green-600" : ""}>{p.statut === "PAYE" ? "Payé" : "Partiel"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
