"use client";

import { creerBail } from "@/actions/baux";
import { getLocataires } from "@/actions/locataires";
import { getAppartements } from "@/actions/appartements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function NouveauBail() {
  const router = useRouter();
  const [locataires, setLocataires] = useState<any[]>([]);
  const [apparts, setApparts] = useState<any[]>([]);
  const [charges, setCharges] = useState<{ type: string; montant: number }[]>([]);
  const [newChargeType, setNewChargeType] = useState("Eau");
  const [newChargeMontant, setNewChargeMontant] = useState("");

  useEffect(() => {
    getLocataires({ statut: "ACTIF" }).then(setLocataires);
    getAppartements().then(setApparts);
  }, []);

  function ajouterCharge() {
    if (!newChargeMontant) return;
    setCharges([...charges, { type: newChargeType, montant: parseInt(newChargeMontant) }]);
    setNewChargeMontant("");
  }

  function supprimerCharge(i: number) {
    setCharges(charges.filter((_, idx) => idx !== i));
  }

  const totalCharges = charges.reduce((s, c) => s + c.montant, 0);

  async function handleSubmit(formData: FormData) {
    formData.set("chargesLocatives", JSON.stringify(charges));
    const result = await creerBail(formData);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Bail créé avec tous les termes");
    router.push("/baux");
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-blue-950 mb-6">Nouveau bail</h1>
      <form action={handleSubmit} className="space-y-6">

        <Card>
          <CardHeader><CardTitle>Parties et logement</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Locataire</Label>
                <select name="locataireId" className="w-full border rounded-md p-2" required>
                  <option value="">Sélectionner...</option>
                  {locataires.map((l) => <option key={l.id} value={l.id}>{l.prenom} {l.nom}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Appartement</Label>
                <select name="appartementId" className="w-full border rounded-md p-2" required>
                  <option value="">Sélectionner...</option>
                  {apparts.map((a) => <option key={a.id} value={a.id}>{a.numero} — {a.type} ({a.statut === "LIBRE" ? "Libre" : "Occupé"})</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Date de début</Label><Input name="dateDebut" type="date" required /></div>
              <div className="space-y-2"><Label>Durée (mois)</Label><Input name="dureeMois" type="number" min="1" defaultValue="12" required /></div>
              <div className="space-y-2"><Label>Caution (FCFA)</Label><Input name="montantCaution" type="number" min="0" defaultValue="0" required /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Conditions financières</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Loyer mensuel (FCFA)</Label><Input name="montantLoyer" type="number" min="1" required /></div>

            <div className="space-y-2">
              <Label>Charges locatives</Label>
              <div className="flex gap-2">
                <select value={newChargeType} onChange={(e) => setNewChargeType(e.target.value)} className="border rounded-md p-2">
                  <option>Eau</option><option>Électricité</option><option>Gardiennage</option><option>Entretien</option><option>Ordures</option><option>Autre</option>
                </select>
                <Input type="number" placeholder="Montant" value={newChargeMontant} onChange={(e) => setNewChargeMontant(e.target.value)} className="w-32" />
                <Button type="button" variant="outline" onClick={ajouterCharge}>+</Button>
              </div>
              {charges.length > 0 && (
                <div className="space-y-1 mt-2">
                  {charges.map((c, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                      <span>{c.type}</span>
                      <span>{c.montant.toLocaleString()} FCFA</span>
                      <button type="button" onClick={() => supprimerCharge(i)} className="text-red-500">✕</button>
                    </div>
                  ))}
                  <div className="text-right font-medium text-sm">Total charges : {totalCharges.toLocaleString()} FCFA</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Modalités de paiement</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Jour limite de paiement</Label><Input name="jourLimitePaiement" type="number" min="1" max="28" defaultValue="5" /></div>
              <div className="space-y-2"><Label>Délai de grâce (jours)</Label><Input name="delaiGrace" type="number" min="0" defaultValue="5" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Type de pénalité</Label>
                <select name="penaliteType" className="w-full border rounded-md p-2">
                  <option value="POURCENTAGE">Pourcentage du loyer</option>
                  <option value="MONTANT_FIXE">Montant fixe (FCFA)</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Montant pénalité</Label><Input name="penaliteMontant" type="number" min="0" defaultValue="5" /></div>
              <div className="space-y-2 flex items-end">
                <label className="flex items-center gap-2 pb-2">
                  <input type="checkbox" name="penaliteRecurrente" className="rounded" />
                  <span className="text-sm">Récurrente (chaque semaine)</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Renouvellement et résiliation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="renouvellementAuto" className="rounded" />
              <span className="text-sm font-medium">Renouvellement automatique si locataire à jour</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Durée renouvellement (mois)</Label><Input name="dureeRenouvellement" type="number" min="1" defaultValue="12" /></div>
              <div className="space-y-2"><Label>Augmentation loyer au renouvellement (%)</Label><Input name="augmentationLoyer" type="number" min="0" defaultValue="0" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Préavis non-renouvellement (jours)</Label><Input name="preavisNonRenouv" type="number" min="0" defaultValue="30" /></div>
              <div className="space-y-2"><Label>Préavis résiliation (jours)</Label><Input name="preavisResiliation" type="number" min="0" defaultValue="30" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Seuil mise en demeure (mois d&apos;impayés)</Label><Input name="seuilMiseEnDemeure" type="number" min="1" defaultValue="2" /></div>
              <div className="space-y-2"><Label>Seuil suspension (mois d&apos;impayés)</Label><Input name="seuilSuspension" type="number" min="1" defaultValue="3" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Clauses particulières</CardTitle></CardHeader>
          <CardContent>
            <textarea name="clausesParticulieres" className="w-full border rounded-md p-2 h-24" placeholder="Conditions spécifiques : animaux, sous-location, travaux, etc." />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg">Créer le bail</Button>
      </form>
    </div>
  );
}
