"use client";

import { modifierImmeuble } from "@/actions/immeubles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ModifierImmeubleForm({ immeuble }: { immeuble: { id: string; nom: string; adresse: string; ville: string; quartier: string | null } }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  async function handleSubmit(formData: FormData) {
    const result = await modifierImmeuble(immeuble.id, formData);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success("Immeuble modifié");
    setEditing(false);
    router.refresh();
  }

  if (!editing) return <button onClick={() => setEditing(true)} className="text-xs text-primary hover:underline">Modifier</button>;

  return (
    <form action={handleSubmit} className="grid grid-cols-2 gap-3 p-3 bg-white/10 rounded-lg mt-3">
      <div className="space-y-1"><Label className="text-white/70 text-xs">Nom</Label><Input name="nom" defaultValue={immeuble.nom} required className="h-8 text-xs" /></div>
      <div className="space-y-1"><Label className="text-white/70 text-xs">Ville</Label><Input name="ville" defaultValue={immeuble.ville} required className="h-8 text-xs" /></div>
      <div className="space-y-1"><Label className="text-white/70 text-xs">Adresse</Label><Input name="adresse" defaultValue={immeuble.adresse} required className="h-8 text-xs" /></div>
      <div className="space-y-1"><Label className="text-white/70 text-xs">Quartier</Label><Input name="quartier" defaultValue={immeuble.quartier || ""} className="h-8 text-xs" /></div>
      <div className="flex gap-2 col-span-2">
        <Button type="submit" size="sm" className="h-7 text-xs">Enregistrer</Button>
        <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditing(false)}>Annuler</Button>
      </div>
    </form>
  );
}
