import { getLocataire } from "@/actions/locataires";
import { getSituationLocataire } from "@/actions/situation";
import { formatFCFA, formatDate, STATUT_BAIL_LABELS, MODE_PAIEMENT_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ModifierLocataireForm } from "./modifier-form";
import { ArchiverButton } from "./archiver-button";
import { CreerCompteButton } from "./creer-compte";

export default async function LocataireDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const loc = await getLocataire(id);
  if (!loc) notFound();
  const situation = await getSituationLocataire(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/locataires" className="text-muted-foreground hover:text-foreground text-sm">← Retour</Link>
        {loc.photo ? <img src={loc.photo} alt="" className="w-16 h-16 rounded-full object-cover" /> : <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">{loc.prenom[0]}{loc.nom[0]}</div>}
        <div>
          <h1 className="text-2xl font-bold text-blue-950">{loc.prenom} {loc.nom}</h1>
          <Badge variant="outline" className={loc.statut === "ACTIF" ? "text-green-600" : "text-gray-500"}>{loc.statut}</Badge>
        </div>
        {loc.statut === "ACTIF" && <ArchiverButton locataireId={loc.id} />}
        {loc.statut === "ACTIF" && !loc.utilisateur && <CreerCompteButton locataireId={loc.id} email={loc.email} />}
      </div>

      {situation && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-1">{situation.caution.payee ? "✅" : "❌"}</div>
              <p className="font-medium">Caution</p>
              <p className="text-sm text-gray-500">{formatFCFA(situation.caution.montant)}</p>
              <p className="text-xs mt-1">{situation.caution.payee ? "Payée" : "Non payée"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-1">{situation.loyer.aJour ? "✅" : "❌"}</div>
              <p className="font-medium">Loyer</p>
              {situation.loyer.aJour ? <p className="text-sm text-green-600">À jour</p> : <p className="text-sm text-red-600">{situation.loyer.moisImpayes} mois — {formatFCFA(situation.loyer.montantDu)}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-1">{situation.charges.aJour ? "✅" : "❌"}</div>
              <p className="font-medium">Charges</p>
              {situation.charges.aJour ? <p className="text-sm text-green-600">À jour</p> : <p className="text-sm text-red-600">{formatFCFA(situation.charges.montantDu)}</p>}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className={`text-2xl font-bold ${situation.totalDu > 0 ? "text-red-600" : "text-green-600"}`}>{formatFCFA(situation.totalDu)}</div>
              <p className="font-medium">Total dû</p>
              {situation.penalites.montant > 0 && <p className="text-xs text-red-500">dont {formatFCFA(situation.penalites.montant)} pénalités</p>}
            </CardContent>
          </Card>
        </div>
      )}

      <ModifierLocataireForm locataire={loc} />

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
