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
  const [loyer, setLoyer] = useState(p.montantLoyer || p.bail?.montantLoyer || 0);
  const [charges, setCharges] = useState(p.montantCharges || p.bail?.totalCharges || 0);
  const [caution, setCaution] = useState(p.montantCaution || 0);
  const [autres, setAutres] = useState(p.montantAutres || 0);
  const router = useRouter();

  const total = loyer + charges + caution + autres;

  async function handleSubmit(formData: FormData) {
    formData.set("montant", total.toString());
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
            <div className="space-y-1"><Label className="text-xs">Loyer</Label><Input name="montantLoyer" type="number" value={loyer} onChange={(e) => setLoyer(parseInt(e.target.value) || 0)} /></div>
            <div className="space-y-1"><Label className="text-xs">Charges</Label><Input name="montantCharges" type="number" value={charges} onChange={(e) => setCharges(parseInt(e.target.value) || 0)} /></div>
            <div className="space-y-1"><Label className="text-xs">Caution</Label><Input name="montantCaution" type="number" value={caution} onChange={(e) => setCaution(parseInt(e.target.value) || 0)} /></div>
            <div className="space-y-1"><Label className="text-xs">Autres</Label><Input name="montantAutres" type="number" value={autres} onChange={(e) => setAutres(parseInt(e.target.value) || 0)} /></div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <span className="text-xs text-muted-foreground">Total calculé : </span>
            <span className="text-lg font-bold text-foreground">{total.toLocaleString()} FCFA</span>
          </div>
          <input type="hidden" name="montant" value={total} />
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
