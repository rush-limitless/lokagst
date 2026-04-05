"use client";

import { creerAppartement } from "@/actions/appartements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NouvelAppartement() {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await creerAppartement(formData);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Appartement créé");
    router.push("/appartements");
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-blue-950 mb-6">Nouvel appartement</h1>
      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Numéro</Label><Input name="numero" placeholder="A1" required /></div>
            <div className="space-y-2">
              <Label>Étage</Label>
              <select name="etage" className="w-full border rounded-md p-2" required>
                <option value="RDC">RDC</option><option value="PREMIER">1er</option><option value="DEUXIEME">2ème</option><option value="TROISIEME">3ème</option><option value="QUATRIEME">4ème</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <select name="type" className="w-full border rounded-md p-2" required>
                <option value="STUDIO">Studio</option><option value="T2">T2</option><option value="T3">T3</option><option value="T4">T4</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Loyer (FCFA)</Label><Input name="loyerBase" type="number" placeholder="50000" required /></div>
            <div className="space-y-2"><Label>Description</Label><Input name="description" placeholder="Optionnel" /></div>
            <Button type="submit" className="w-full">Créer</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
