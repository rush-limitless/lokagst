"use client";

import { creerLocataire } from "@/actions/locataires";
import { getAppartements } from "@/actions/appartements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function NouveauLocataire() {
  const router = useRouter();
  const [apparts, setApparts] = useState<any[]>([]);

  useEffect(() => {
    getAppartements({ statut: "LIBRE" }).then(setApparts);
  }, []);

  async function handleSubmit(formData: FormData) {
    const result = await creerLocataire(formData);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Locataire ajouté");
    router.push("/locataires");
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-blue-950 mb-6">Nouveau locataire</h1>
      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nom</Label><Input name="nom" required /></div>
              <div className="space-y-2"><Label>Prénom</Label><Input name="prenom" required /></div>
            </div>
            <div className="space-y-2"><Label>Téléphone</Label><Input name="telephone" placeholder="6XXXXXXXX" required /></div>
            <div className="space-y-2"><Label>Email (optionnel)</Label><Input name="email" type="email" /></div>
            <div className="space-y-2"><Label>N° CNI (optionnel)</Label><Input name="numeroCNI" /></div>
            <div className="space-y-2">
              <Label>Appartement</Label>
              <select name="appartementId" className="w-full border rounded-md p-2" required>
                <option value="">Sélectionner...</option>
                {apparts.map((a) => (
                  <option key={a.id} value={a.id}>{a.numero} — {a.type} — {a.loyerBase.toLocaleString()} FCFA</option>
                ))}
              </select>
            </div>
            <div className="space-y-2"><Label>Date d&apos;entrée</Label><Input name="dateEntree" type="date" required /></div>
            <Button type="submit" className="w-full">Ajouter le locataire</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
