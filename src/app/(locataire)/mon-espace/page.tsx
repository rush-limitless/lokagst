import { getMonEspace } from "@/actions/portail-locataire";
import { formatFCFA, formatDate, ETAGE_LABELS } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function MonEspace() {
  const data = await getMonEspace();
  if (!data) return <p>Aucune donnée trouvée.</p>;

  const bail = data.baux[0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-blue-950">Bienvenue, {data.prenom} {data.nom}</h1>

      {bail ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Appartement</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bail.appartement.numero}</div>
                <p className="text-sm text-gray-500">{ETAGE_LABELS[bail.appartement.etage]} — {bail.appartement.type}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Loyer mensuel</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatFCFA(bail.montantLoyer)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-500">Fin du bail</CardTitle></CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDate(bail.dateFin)}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Derniers paiements</CardTitle>
                <Link href="/mon-espace/paiements" className="text-blue-600 text-sm hover:underline">Voir tout</Link>
              </div>
            </CardHeader>
            <CardContent>
              {bail.paiements.length === 0 ? <p className="text-gray-500 text-sm">Aucun paiement</p> : (
                <div className="space-y-2">
                  {bail.paiements.map((p) => (
                    <div key={p.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <span>{formatDate(p.moisConcerne)}</span>
                      <span className="font-medium">{formatFCFA(p.montant)}</span>
                      <Badge variant={p.statut === "PAYE" ? "outline" : "destructive"} className={p.statut === "PAYE" ? "text-green-600" : ""}>{p.statut === "PAYE" ? "Payé" : "Partiel"}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-gray-500">Aucun bail actif.</p>
      )}
    </div>
  );
}
