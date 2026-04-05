import { getLocataire } from "@/actions/locataires";
import { formatFCFA, formatDate, STATUT_BAIL_LABELS, MODE_PAIEMENT_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";

export default async function LocataireDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loc = await getLocataire(id);
  if (!loc) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-950">{loc.prenom} {loc.nom}</h1>
      <Card>
        <CardContent className="pt-6 grid grid-cols-2 gap-4">
          <div><span className="text-gray-500 text-sm">Téléphone</span><p className="font-medium">{loc.telephone}</p></div>
          <div><span className="text-gray-500 text-sm">Email</span><p className="font-medium">{loc.email || "—"}</p></div>
          <div><span className="text-gray-500 text-sm">CNI</span><p className="font-medium">{loc.numeroCNI || "—"}</p></div>
          <div><span className="text-gray-500 text-sm">Date d&apos;entrée</span><p className="font-medium">{formatDate(loc.dateEntree)}</p></div>
        </CardContent>
      </Card>
      {loc.baux.map((b) => (
        <Card key={b.id}>
          <CardHeader><CardTitle>Bail — {STATUT_BAIL_LABELS[b.statut]} <Badge variant="outline" className="ml-2">{b.appartement.numero}</Badge></CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><span className="text-gray-500">Période</span><p>{formatDate(b.dateDebut)} → {formatDate(b.dateFin)}</p></div>
              <div><span className="text-gray-500">Loyer</span><p>{formatFCFA(b.montantLoyer)}</p></div>
              <div><span className="text-gray-500">Caution</span><p>{formatFCFA(b.montantCaution)}</p></div>
            </div>
            {b.paiements.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Paiements</h4>
                <div className="space-y-1">
                  {b.paiements.map((p) => (
                    <div key={p.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                      <span>{formatDate(p.moisConcerne)}</span>
                      <span>{formatFCFA(p.montant)}</span>
                      <span>{MODE_PAIEMENT_LABELS[p.modePaiement]}</span>
                      <Badge variant={p.statut === "PAYE" ? "outline" : "destructive"} className={p.statut === "PAYE" ? "text-green-600" : ""}>{p.statut === "PAYE" ? "Payé" : "Partiel"}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
