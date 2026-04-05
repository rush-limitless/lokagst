"use client";

import { enregistrerPaiement } from "@/actions/paiements";
import { getBaux } from "@/actions/baux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function NouveauPaiement() {
  const router = useRouter();
  const [baux, setBaux] = useState<any[]>([]);
  const [selectedBail, setSelectedBail] = useState<any>(null);

  useEffect(() => {
    getBaux({ statut: "ACTIF" }).then(setBaux);
  }, []);

  async function handleSubmit(formData: FormData) {
    const result = await enregistrerPaiement(formData);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Paiement enregistré");
    router.push("/paiements");
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-blue-950 mb-6">Enregistrer un paiement</h1>
      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Bail (Locataire — Appartement)</Label>
              <select
                name="bailId"
                className="w-full border rounded-md p-2"
                required
                onChange={(e) => setSelectedBail(baux.find((b) => b.id === e.target.value))}
              >
                <option value="">Sélectionner...</option>
                {baux.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.locataire.prenom} {b.locataire.nom} — {b.appartement.numero} ({b.montantLoyer.toLocaleString()} FCFA/mois)
                  </option>
                ))}
              </select>
            </div>
            {selectedBail && (
              <div className="bg-blue-50 p-3 rounded text-sm">
                Loyer attendu : <strong>{selectedBail.montantLoyer.toLocaleString()} FCFA</strong>
              </div>
            )}
            <div className="space-y-2"><Label>Montant payé (FCFA)</Label><Input name="montant" type="number" min="1" required /></div>
            <div className="space-y-2"><Label>Mois concerné</Label><Input name="moisConcerne" type="date" required /></div>
            <div className="space-y-2">
              <Label>Mode de paiement</Label>
              <select name="modePaiement" className="w-full border rounded-md p-2" required>
                <option value="ESPECES">Espèces</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="VIREMENT">Virement</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Notes (optionnel)</Label><Input name="notes" /></div>
            <Button type="submit" className="w-full">Enregistrer le paiement</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
