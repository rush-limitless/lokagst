"use client";

import { supprimerBail } from "@/actions/baux";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SupprimerBailButton({ bailId, locataire }: { bailId: string; locataire: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    const result = await supprimerBail(bailId);
    setLoading(false);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success("Bail supprimé");
    router.push("/baux");
  }

  if (!open) return <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>🗑️ Supprimer</Button>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
      <div className="bg-card rounded-xl p-6 max-w-sm w-full shadow-xl border space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-foreground">⚠️ Supprimer le bail</h3>
        <p className="text-sm text-muted-foreground">
          Supprimer le bail de <strong>{locataire}</strong> ? Cela supprimera aussi tous les paiements et pénalités associés. L&apos;appartement sera libéré.
        </p>
        <p className="text-sm text-red-600 font-medium">Cette action est irréversible.</p>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleDelete} disabled={loading} className="flex-1">
            {loading ? "Suppression..." : "Confirmer"}
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
        </div>
      </div>
    </div>
  );
}
