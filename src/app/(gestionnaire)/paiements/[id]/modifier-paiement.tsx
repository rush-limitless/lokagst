"use client";

import { modifierPaiement } from "@/actions/paiements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ModifierPaiementButton({ paiement: p }: { paiement: any }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await modifierPaiement(p.id, formData);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success("Paiement modifié");
    setOpen(false);
    router.refresh();
  }

  if (!open) return <Button variant="outline" size="sm" onClick={() => setOpen(true)}>✏️ Modifier</Button>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
      <div className="bg-card rounded-xl p-6 max-w-md w-full shadow-xl border space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-foreground">Modifier le paiement</h3>
        <form action={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Loyer</Label><Input name="montantLoyer" type="number" defaultValue={p.montantLoyer} /></div>
            <div className="space-y-1"><Label className="text-xs">Charges</Label><Input name="montantCharges" type="number" defaultValue={p.montantCharges} /></div>
            <div className="space-y-1"><Label className="text-xs">Caution</Label><Input name="montantCaution" type="number" defaultValue={p.montantCaution} /></div>
            <div className="space-y-1"><Label className="text-xs">Autres</Label><Input name="montantAutres" type="number" defaultValue={p.montantAutres} /></div>
          </div>
          <div className="space-y-1"><Label className="text-xs">Total</Label><Input name="montant" type="number" defaultValue={p.montant} required /></div>
          <div className="space-y-1"><Label className="text-xs">Notes</Label><Input name="notes" defaultValue={p.notes || ""} /></div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Enregistrer</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
