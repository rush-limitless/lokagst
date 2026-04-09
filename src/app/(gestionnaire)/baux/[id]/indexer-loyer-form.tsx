"use client";

import { indexerLoyer } from "@/actions/baux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function IndexerLoyerForm({ bailId, loyerActuel }: { bailId: string; loyerActuel: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"taux" | "fixe">("taux");
  const [taux, setTaux] = useState(5);

  if (!open) return <Button variant="outline" size="sm" onClick={() => setOpen(true)}>📈 Indexer le loyer</Button>;

  const nouveauLoyer = mode === "taux" ? Math.round(loyerActuel * (1 + taux / 100)) : taux;

  async function handleSubmit(formData: FormData) {
    const result = await indexerLoyer(bailId, formData);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success(`Loyer indexé : ${loyerActuel.toLocaleString()} → ${(result as any).nouveauLoyer?.toLocaleString()} FCFA`);
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
      <p className="text-sm font-medium">Indexation du loyer</p>
      <p className="text-xs text-muted-foreground">Loyer actuel : {loyerActuel.toLocaleString()} FCFA</p>
      <div className="flex gap-2">
        <Button type="button" variant={mode === "taux" ? "default" : "outline"} size="sm" onClick={() => setMode("taux")}>Par taux (%)</Button>
        <Button type="button" variant={mode === "fixe" ? "default" : "outline"} size="sm" onClick={() => setMode("fixe")}>Montant fixe</Button>
      </div>
      <form action={handleSubmit} className="space-y-3">
        {mode === "taux" ? (
          <div className="space-y-1">
            <Label className="text-xs">Taux d'augmentation (%)</Label>
            <Input name="taux" type="number" step="0.1" value={taux} onChange={(e) => setTaux(parseFloat(e.target.value) || 0)} />
            <p className="text-xs text-muted-foreground">Nouveau loyer : {nouveauLoyer.toLocaleString()} FCFA</p>
          </div>
        ) : (
          <div className="space-y-1">
            <Label className="text-xs">Nouveau loyer (FCFA)</Label>
            <Input name="montantFixe" type="number" min="1" defaultValue={loyerActuel} />
          </div>
        )}
        <div className="space-y-1"><Label className="text-xs">Motif</Label><Input name="motif" defaultValue="Indexation annuelle" /></div>
        <div className="flex gap-2">
          <Button type="submit" size="sm">Appliquer</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
        </div>
      </form>
    </div>
  );
}
