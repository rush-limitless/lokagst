"use client";

import { mettreAJourMaintenance } from "@/actions/maintenance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function UpdateMaintenanceForm({ id, currentStatut }: { id: string; currentStatut: string }) {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await mettreAJourMaintenance(id, formData);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success("Ticket mis à jour");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Statut</Label>
        <select name="statut" className="w-full border rounded-md p-2" defaultValue={currentStatut}>
          <option value="SIGNALE">Signalé</option>
          <option value="EN_COURS">En cours</option>
          <option value="RESOLU">Résolu</option>
        </select>
      </div>
      <div className="space-y-2"><Label>Technicien assigné</Label><Input name="technicien" placeholder="Nom du technicien" /></div>
      <div className="space-y-2"><Label>Commentaire</Label><textarea name="commentaire" className="w-full border rounded-md p-2 h-20" placeholder="Notes sur l'intervention..." /></div>
      <Button type="submit">Mettre à jour</Button>
    </form>
  );
}
