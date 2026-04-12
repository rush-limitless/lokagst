"use client";

import { creerDepense } from "@/actions/depenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/file-upload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function NouvelleDepenseForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [justificatif, setJustificatif] = useState("");
  const [immeubles, setImmeubles] = useState<{ id: string; nom: string }[]>([]);

  useEffect(() => {
    if (open) fetch("/api/immeubles").then(r => r.ok ? r.json() : []).then(setImmeubles).catch(() => {});
  }, [open]);

  if (!open) return <Button onClick={() => setOpen(true)}>+ Nouvelle dépense</Button>;

  async function handleSubmit(formData: FormData) {
    if (justificatif) formData.set("justificatif", justificatif);
    const result = await creerDepense(formData);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success("Dépense enregistrée");
    setOpen(false);
    setJustificatif("");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Nouvelle dépense</CardTitle></CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <select name="categorie" className="w-full border rounded-md p-2" required>
              <option value="TRAVAUX">🔨 Travaux</option>
              <option value="ENTRETIEN">🧹 Entretien</option>
              <option value="ASSURANCE">🛡️ Assurance</option>
              <option value="TAXE_FONCIERE">🏛️ Taxe foncière</option>
              <option value="EAU_ELECTRICITE">💡 Eau/Électricité</option>
              <option value="FRAIS_GESTION">📋 Frais de gestion</option>
              <option value="AUTRE">📦 Autre</option>
            </select>
          </div>
          <div className="space-y-2"><Label>Montant (FCFA)</Label><Input name="montant" type="number" min="1" required /></div>
          <div className="space-y-2 md:col-span-2"><Label>Description</Label><Input name="description" required placeholder="Ex: Réparation toiture bâtiment A" /></div>
          <div className="space-y-2"><Label>Date</Label><Input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} /></div>
          <div className="space-y-2">
            <Label>Immeuble (optionnel)</Label>
            <select name="immeubleId" className="w-full border rounded-md p-2">
              <option value="">Général (tous immeubles)</option>
              {immeubles.map((i) => <option key={i.id} value={i.id}>{i.nom}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label>Fournisseur</Label><Input name="fournisseur" placeholder="Nom du prestataire" /></div>
          <div className="space-y-2"><Label>Référence facture</Label><Input name="reference" placeholder="N° facture" /></div>
          <div className="space-y-2 md:col-span-2">
            <Label>Justificatif</Label>
            <FileUpload onUploaded={setJustificatif} label="Joindre le justificatif (facture, devis)" />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit">Enregistrer</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
