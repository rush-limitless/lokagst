"use client";

import { creerImmeuble } from "@/actions/immeubles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreerImmeubleForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    const result = await creerImmeuble(formData);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success("Immeuble ajouté");
    setOpen(false);
    router.refresh();
  }

  if (!open) return <Button onClick={() => setOpen(true)}>+ Ajouter un immeuble</Button>;

  return (
    <Card>
      <CardHeader><CardTitle>Nouvel immeuble</CardTitle></CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Nom</Label><Input name="nom" placeholder="Résidence FINSTAR" required /></div>
            <div className="space-y-2"><Label>Ville</Label><Input name="ville" placeholder="Yaoundé" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Adresse</Label><Input name="adresse" placeholder="Rue..." required /></div>
            <div className="space-y-2"><Label>Quartier</Label><Input name="quartier" placeholder="Nkolfoulou" /></div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Créer</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
