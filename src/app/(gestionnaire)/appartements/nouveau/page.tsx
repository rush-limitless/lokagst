"use client";

import { creerAppartement } from "@/actions/appartements";
import { getImmeubles } from "@/actions/immeubles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function NouvelAppartement() {
  const router = useRouter();
  const [immeubles, setImmeubles] = useState<any[]>([]);

  useEffect(() => { getImmeubles().then(setImmeubles); }, []);

  async function handleSubmit(formData: FormData) {
    const result = await creerAppartement(formData);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Appartement créé");
    router.push("/appartements");
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-foreground mb-6">Nouvel appartement</h1>
      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Immeuble</Label>
              <select name="immeubleId" className="w-full border rounded-md p-2 bg-background" required>
                <option value="">S&eacute;lectionner l&#39;immeuble...</option>
                {immeubles.map((i) => <option key={i.id} value={i.id}>{i.nom}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>Numéro</Label><Input name="numero" placeholder="APPART A11" required /></div>
            <div className="space-y-2">
              <Label>Étage</Label>
              <select name="etage" className="w-full border rounded-md p-2 bg-background" required>
                <option value="RDC">RDC</option><option value="PREMIER">1er étage</option><option value="DEUXIEME">2ème étage</option><option value="TROISIEME">3ème étage</option><option value="QUATRIEME">4ème étage</option><option value="CINQUIEME">5ème étage</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select name="type" className="w-full border rounded-md p-2 bg-background" required>
                <option value="CHAMBRE">Chambre</option><option value="STUDIO">Studio</option><option value="APPARTEMENT">Appartement</option><option value="CHAMBRE_MEUBLE">Chambre meublée</option><option value="STUDIO_MEUBLE">Studio meublé</option><option value="APPARTEMENT_MEUBLE">Appartement meublé</option><option value="VILLA">Villa</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Loyer (FCFA)</Label><Input name="loyerBase" type="number" placeholder="50000" required /></div>
            <div className="space-y-2"><Label>Description</Label><Input name="description" placeholder="Optionnel" /></div>
            <Button type="submit" className="w-full">Cr&eacute;er l&#39;appartement</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
