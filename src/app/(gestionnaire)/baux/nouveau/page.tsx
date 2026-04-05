"use client";

import { creerBail } from "@/actions/baux";
import { getLocataires } from "@/actions/locataires";
import { getAppartements } from "@/actions/appartements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function NouveauBail() {
  const router = useRouter();
  const [locataires, setLocataires] = useState<any[]>([]);
  const [apparts, setApparts] = useState<any[]>([]);

  useEffect(() => {
    getLocataires({ statut: "ACTIF" }).then(setLocataires);
    getAppartements().then(setApparts);
  }, []);

  async function handleSubmit(formData: FormData) {
    const result = await creerBail(formData);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Bail créé");
    router.push("/baux");
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-blue-950 mb-6">Nouveau bail</h1>
      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Locataire</Label>
              <select name="locataireId" className="w-full border rounded-md p-2" required>
                <option value="">Sélectionner...</option>
                {locataires.map((l) => (
                  <option key={l.id} value={l.id}>{l.prenom} {l.nom}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Appartement</Label>
              <select name="appartementId" className="w-full border rounded-md p-2" required>
                <option value="">Sélectionner...</option>
                {apparts.map((a) => (
                  <option key={a.id} value={a.id}>{a.numero} — {a.type} ({a.statut === "LIBRE" ? "Libre" : "Occupé"})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2"><Label>Date de début</Label><Input name="dateDebut" type="date" required /></div>
            <div className="space-y-2"><Label>Durée (mois)</Label><Input name="dureeMois" type="number" min="1" defaultValue="12" required /></div>
            <div className="space-y-2"><Label>Loyer mensuel (FCFA)</Label><Input name="montantLoyer" type="number" min="1" required /></div>
            <div className="space-y-2"><Label>Caution (FCFA)</Label><Input name="montantCaution" type="number" min="0" defaultValue="0" required /></div>
            <Button type="submit" className="w-full">Créer le bail</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
