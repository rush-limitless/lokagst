import { getBail } from "@/actions/baux";
import { formatFCFA, formatDate, STATUT_BAIL_LABELS, MODE_PAIEMENT_LABELS } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { SignerBailForm } from "./signer-form";
import { UploadContratForm } from "./upload-contrat-form";

export default async function BailDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bail = await getBail(id);
  if (!bail) notFound();

  const charges = (bail.chargesLocatives as { type: string; montant: number }[]) || [];
  const statusColor: Record<string, string> = { ACTIF: "text-green-600", SUSPENDU: "text-orange-600", RESILIE: "text-red-600", TERMINE: "text-gray-500", EXPIRE: "text-red-600" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {bail.locataire.photo && <img src={bail.locataire.photo} alt="" className="w-14 h-14 rounded-full object-cover" />}
        <div>
          <h1 className="text-2xl font-bold text-blue-950">{bail.locataire.prenom} {bail.locataire.nom}</h1>
          <p className="text-gray-500">Appartement {bail.appartement.numero}</p>
        </div>
        <Badge variant="outline" className={statusColor[bail.statut] || ""}>{STATUT_BAIL_LABELS[bail.statut]}</Badge>
      </div>

      <Card>
        <CardHeader><CardTitle>Termes du contrat</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-500">Début</span><p className="font-medium">{formatDate(bail.dateDebut)}</p></div>
          <div><span className="text-gray-500">Fin</span><p className="font-medium">{formatDate(bail.dateFin)}</p></div>
          <div><span className="text-gray-500">Durée</span><p className="font-medium">{bail.dureeMois} mois</p></div>
          <div><span className="text-gray-500">Loyer</span><p className="font-medium">{formatFCFA(bail.montantLoyer)}</p></div>
          <div><span className="text-gray-500">Charges</span><p className="font-medium">{formatFCFA(bail.totalCharges)}</p></div>
          <div><span className="text-gray-500">Total mensuel</span><p className="font-medium text-lg">{formatFCFA(bail.totalMensuel)}</p></div>
          <div><span className="text-gray-500">Caution</span><p className="font-medium">{formatFCFA(bail.montantCaution)}</p></div>
        </CardContent>
      </Card>

      {charges.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Charges locatives</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {charges.map((c, i) => (
                <div key={i} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                  <span>{c.type}</span><span className="font-medium">{formatFCFA(c.montant)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Modalités de paiement</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-500">Jour limite</span><p className="font-medium">Le {bail.jourLimitePaiement} du mois</p></div>
          <div><span className="text-gray-500">Délai de grâce</span><p className="font-medium">{bail.delaiGrace} jours</p></div>
          <div><span className="text-gray-500">Pénalité</span><p className="font-medium">{bail.penaliteMontant}{bail.penaliteType === "POURCENTAGE" ? "% du loyer" : " FCFA"}{bail.penaliteRecurrente ? " /semaine" : ""}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Renouvellement et résiliation</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><span className="text-gray-500">Renouvellement auto</span><p className="font-medium">{bail.renouvellementAuto ? "✅ Oui" : "❌ Non"}</p></div>
          {bail.renouvellementAuto && <>
            <div><span className="text-gray-500">Durée renouvellement</span><p className="font-medium">{bail.dureeRenouvellement || bail.dureeMois} mois</p></div>
            <div><span className="text-gray-500">Augmentation</span><p className="font-medium">{bail.augmentationLoyer || 0}%</p></div>
          </>}
          <div><span className="text-gray-500">Préavis résiliation</span><p className="font-medium">{bail.preavisResiliation} jours</p></div>
          <div><span className="text-gray-500">Seuil mise en demeure</span><p className="font-medium">{bail.seuilMiseEnDemeure} mois</p></div>
          <div><span className="text-gray-500">Seuil suspension</span><p className="font-medium">{bail.seuilSuspension} mois</p></div>
        </CardContent>
      </Card>

      {bail.clausesParticulieres && (
        <Card>
          <CardHeader><CardTitle>Clauses particulières</CardTitle></CardHeader>
          <CardContent><p className="text-sm whitespace-pre-wrap">{bail.clausesParticulieres}</p></CardContent>
        </Card>
      )}

      {/* SIGNATURE ÉLECTRONIQUE */}
      <Card>
        <CardHeader><CardTitle>Signature du locataire</CardTitle></CardHeader>
        <CardContent>
          {bail.signatureLocataire ? (
            <div>
              <p className="text-sm text-green-600 mb-2">✅ Signé le {bail.dateSignature ? formatDate(bail.dateSignature) : ""}</p>
              <img src={bail.signatureLocataire} alt="Signature" className="border rounded h-20" />
            </div>
          ) : (
            <SignerBailForm bailId={bail.id} />
          )}
        </CardContent>
      </Card>

      {/* UPLOAD CONTRAT ENREGISTRÉ */}
      <Card>
        <CardHeader><CardTitle>Contrat enregistré (scan/PDF)</CardTitle></CardHeader>
        <CardContent>
          {bail.contratUpload ? (
            <div>
              <p className="text-sm text-green-600 mb-2">✅ Contrat uploadé</p>
              <a href={bail.contratUpload} target="_blank" className="text-blue-600 hover:underline text-sm">📄 Voir le contrat</a>
            </div>
          ) : (
            <UploadContratForm bailId={bail.id} />
          )}
        </CardContent>
      </Card>

      {bail.penalites.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Pénalités</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {bail.penalites.map((p) => (
                <div key={p.id} className="flex justify-between text-sm p-2 bg-red-50 rounded">
                  <span>{p.motif}</span>
                  <span>{formatDate(p.appliqueLe)}</span>
                  <span className="font-medium">{formatFCFA(p.montant)}</span>
                  <Badge variant={p.payee ? "outline" : "destructive"}>{p.payee ? "Payée" : "Due"}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
