"use client";

import { modifierAppartement } from "@/actions/appartements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ModifierAppartForm({ appart }: { appart: any }) {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await modifierAppartement(appart.id, formData);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success("Appartement modifié");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Informations</CardTitle></CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1"><Label className="text-xs">Numéro</Label><Input name="numero" defaultValue={appart.numero} /></div>
            <div className="space-y-1">
              <Label className="text-xs">Étage</Label>
              <select name="etage" defaultValue={appart.etage} className="w-full border rounded-md p-2 text-sm bg-card text-foreground">
                <option value="RDC">RDC</option><option value="PREMIER">1er</option><option value="DEUXIEME">2ème</option><option value="TROISIEME">3ème</option><option value="QUATRIEME">4ème</option><option value="CINQUIEME">5ème</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <select name="type" defaultValue={appart.type} className="w-full border rounded-md p-2 text-sm bg-card text-foreground">
                <option value="CHAMBRE">Chambre</option><option value="STUDIO">Studio</option><option value="APPARTEMENT">Appartement</option><option value="CHAMBRE_MEUBLE">Chambre meublée</option><option value="STUDIO_MEUBLE">Studio meublé</option><option value="APPARTEMENT_MEUBLE">Appartement meublé</option><option value="VILLA">Villa</option>
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Loyer (FCFA)</Label><Input name="loyerBase" type="number" defaultValue={appart.loyerBase} /></div>
          </div>
          <div className="space-y-1"><Label className="text-xs">Description</Label><Input name="description" defaultValue={appart.description || ""} /></div>
          <Button type="submit" size="sm">Enregistrer</Button>
        </form>
      </CardContent>
    </Card>
  );
}
