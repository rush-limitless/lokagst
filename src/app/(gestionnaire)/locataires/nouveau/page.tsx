"use client";

import { creerLocataire } from "@/actions/locataires";
import { getAppartements } from "@/actions/appartements";
import { getImmeubles } from "@/actions/immeubles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";

export default function NouveauLocataire() {
  const router = useRouter();
  const [apparts, setApparts] = useState<any[]>([]);
  const [immeubles, setImmeubles] = useState<any[]>([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [charges, setCharges] = useState<{ type: string; montant: number }[]>([]);
  const [newChargeType, setNewChargeType] = useState("Eau");
  const [newChargeMontant, setNewChargeMontant] = useState("");
  const [selectedImm, setSelectedImm] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAppartements({ statut: "LIBRE" }).then(setApparts);
    getImmeubles().then(setImmeubles);
  }, []);

  const filteredApparts = selectedImm ? apparts.filter((a) => a.immeubleId === selectedImm) : apparts;

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) { setPhotoUrl(data.url); toast.success("Photo uploadée"); }
    else toast.error("Erreur upload");
    setUploading(false);
  }

  function ajouterCharge() {
    if (!newChargeMontant) return;
    setCharges([...charges, { type: newChargeType, montant: parseInt(newChargeMontant) }]);
    setNewChargeMontant("");
  }

  async function handleSubmit(formData: FormData) {
    if (photoUrl) formData.set("photo", photoUrl);
    formData.set("chargesLocatives", JSON.stringify(charges));
    const result = await creerLocataire(formData);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Locataire et bail créés");
    router.push("/locataires");
  }

  const totalCharges = charges.reduce((s, c) => s + c.montant, 0);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">Nouveau locataire</h1>
      <form action={handleSubmit} className="space-y-6">

        {/* Informations personnelles */}
        <Card>
          <CardHeader><CardTitle>Informations personnelles</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-gray-400 text-xl">👤</span>}
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? "Upload..." : "📷 Photo"}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nom *</Label><Input name="nom" required /></div>
              <div className="space-y-2"><Label>Prénom</Label><Input name="prenom" /></div>
            </div>
            <div className="space-y-2"><Label>Téléphone *</Label><Input name="telephone" placeholder="6XXXXXXXX" required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" /></div>
              <div className="space-y-2"><Label>N° CNI</Label><Input name="numeroCNI" /></div>
            </div>
            <div className="space-y-2"><Label>Date d&apos;entrée *</Label><Input name="dateEntree" type="date" required /></div>
            <input type="hidden" name="photo" value={photoUrl} />
          </CardContent>
        </Card>

        {/* Logement */}
        <Card>
          <CardHeader><CardTitle>Logement *</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Immeuble</Label>
              <select value={selectedImm} onChange={(e) => setSelectedImm(e.target.value)} className="w-full border rounded-md p-2 bg-background">
                <option value="">Tous les immeubles</option>
                {immeubles.map((i) => <option key={i.id} value={i.id}>{i.nom}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Appartement (libres uniquement) *</Label>
              <select name="appartementId" className="w-full border rounded-md p-2 bg-background" required>
                <option value="">Sélectionner...</option>
                {filteredApparts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.numero} — {a.immeuble?.nom || ""} — {a.loyerBase.toLocaleString()} FCFA
                  </option>
                ))}
              </select>
              {filteredApparts.length === 0 && <p className="text-xs text-orange-600">Aucun appartement libre{selectedImm ? " dans cet immeuble" : ""}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Bail (optionnel) */}
        <Card>
          <CardHeader><CardTitle>Contrat de bail <span className="text-xs text-muted-foreground font-normal">(optionnel — peut être créé plus tard)</span></CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Loyer mensuel (FCFA)</Label><Input name="montantLoyer" type="number" min="0" /></div>
              <div className="space-y-2"><Label>Caution (FCFA)</Label><Input name="montantCaution" type="number" min="0" defaultValue="0" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Durée (mois)</Label><Input name="dureeMois" type="number" min="1" defaultValue="12" /></div>
              <div className="space-y-2">
                <Label>Périodicité</Label>
                <select name="periodicite" className="w-full border rounded-md p-2 bg-background">
                  <option value="MENSUEL">Mensuel</option>
                  <option value="TRIMESTRIEL">Trimestriel</option>
                  <option value="SEMESTRIEL">Semestriel</option>
                  <option value="ANNUEL">Annuel</option>
                </select>
              </div>
            </div>

            {/* Charges */}
            <div className="space-y-2">
              <Label>Charges locatives</Label>
              <div className="flex gap-2">
                <select value={newChargeType} onChange={(e) => setNewChargeType(e.target.value)} className="border rounded-md p-2 text-sm bg-background">
                  <option>Eau</option><option>Électricité</option><option>Gardiennage</option><option>Entretien</option><option>Ordures</option><option>Autre</option>
                </select>
                <Input type="number" placeholder="Montant" value={newChargeMontant} onChange={(e) => setNewChargeMontant(e.target.value)} className="w-28" />
                <Button type="button" variant="outline" size="sm" onClick={ajouterCharge}>+</Button>
              </div>
              {charges.map((c, i) => (
                <div key={i} className="flex justify-between items-center bg-muted/30 p-2 rounded text-sm">
                  <span>{c.type}</span><span>{c.montant.toLocaleString()} FCFA</span>
                  <button type="button" onClick={() => setCharges(charges.filter((_, idx) => idx !== i))} className="text-red-500">✕</button>
                </div>
              ))}
              {totalCharges > 0 && <p className="text-right text-xs font-medium">Total charges : {totalCharges.toLocaleString()} FCFA</p>}
            </div>

            {/* Modalités */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Jour limite paiement</Label><Input name="jourLimitePaiement" type="number" min="1" max="28" defaultValue="5" /></div>
              <div className="space-y-2"><Label>Délai de grâce (jours)</Label><Input name="delaiGrace" type="number" min="0" defaultValue="5" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type pénalité</Label>
                <select name="penaliteType" className="w-full border rounded-md p-2 bg-background">
                  <option value="POURCENTAGE">% du loyer</option>
                  <option value="MONTANT_FIXE">Montant fixe</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Montant pénalité</Label><Input name="penaliteMontant" type="number" min="0" defaultValue="5" /></div>
            </div>
            <label className="flex items-center gap-2"><input type="checkbox" name="renouvellementAuto" className="rounded" defaultChecked /><span className="text-sm">Renouvellement automatique</span></label>
            <div className="space-y-2"><Label>Clauses particulières</Label><textarea name="clausesParticulieres" className="w-full border rounded-md p-2 h-16 text-sm bg-background" placeholder="Conditions spécifiques..." /></div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg">Créer le locataire</Button>
      </form>
    </div>
  );
}
