import { getMonBail } from "@/actions/portail-locataire";
import { formatFCFA, formatDate, ETAGE_LABELS, STATUT_BAIL_LABELS, PERIODICITE_LABELS } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignerMonBailForm } from "./signer-form";

export default async function MonBail() {
  const bail = await getMonBail();
  if (!bail) return <div><h1 className="text-2xl font-bold text-foreground">Mon bail</h1><p className="text-muted-foreground mt-4">Aucun bail actif.</p></div>;

  const charges = (bail.chargesLocatives as { type: string; montant: number }[]) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Mon bail</h1>
      <Card>
        <CardContent className="pt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div><span className="text-muted-foreground text-sm">Appartement</span><p className="font-medium">{bail.appartement.numero} — {ETAGE_LABELS[bail.appartement.etage]}</p></div>
          <div><span className="text-muted-foreground text-sm">Type</span><p className="font-medium">{bail.appartement.type}</p></div>
          <div><span className="text-muted-foreground text-sm">Statut</span><p><Badge variant="outline" className="text-green-600">{STATUT_BAIL_LABELS[bail.statut]}</Badge></p></div>
          <div><span className="text-muted-foreground text-sm">Début</span><p className="font-medium">{formatDate(bail.dateDebut)}</p></div>
          <div><span className="text-muted-foreground text-sm">Fin</span><p className="font-medium">{formatDate(bail.dateFin)}</p></div>
          <div><span className="text-muted-foreground text-sm">Durée</span><p className="font-medium">{bail.dureeMois} mois</p></div>
          <div><span className="text-muted-foreground text-sm">Loyer</span><p className="font-medium text-lg">{formatFCFA(bail.montantLoyer)}</p></div>
          <div><span className="text-muted-foreground text-sm">Charges</span><p className="font-medium">{formatFCFA(bail.totalCharges)}</p></div>
          <div><span className="text-muted-foreground text-sm">Total mensuel</span><p className="font-medium text-lg">{formatFCFA(bail.totalMensuel)}</p></div>
          <div><span className="text-muted-foreground text-sm">Caution</span><p className="font-medium">{formatFCFA(bail.montantCaution)}</p></div>
          <div><span className="text-muted-foreground text-sm">Périodicité</span><p className="font-medium">{PERIODICITE_LABELS[bail.periodicite] || bail.periodicite}</p></div>
        </CardContent>
      </Card>

      {charges.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Détail des charges</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {charges.map((c, i) => (
                <div key={i} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                  <span>{c.type}</span><span className="font-medium">{formatFCFA(c.montant)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Signature électronique</CardTitle></CardHeader>
        <CardContent>
          {bail.signatureLocataire ? (
            <div>
              <p className="text-green-600 text-sm mb-2">✅ Bail signé le {bail.dateSignature ? formatDate(bail.dateSignature) : ""}</p>
              <img src={bail.signatureLocataire} alt="Ma signature" className="border rounded h-20" />
            </div>
          ) : (
            <SignerMonBailForm />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
