"use client";

import { renouvelerBail } from "@/actions/baux";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function RenouvelerBailButton({ bailId, dureeMois, locataire }: { bailId: string; dureeMois: number; locataire: string }) {
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (!confirm) { setConfirm(true); return; }
    setLoading(true);
    const fd = new FormData();
    fd.set("dureeMois", dureeMois.toString());
    const result = await renouvelerBail(bailId, fd);
    setLoading(false);
    setConfirm(false);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success(`Bail de ${locataire} renouvelé (${dureeMois} mois)`);
    router.refresh();
  }

  if (confirm) return (
    <div className="flex items-center gap-1">
      <button onClick={handleClick} disabled={loading} className="text-[10px] px-2 py-1 bg-emerald-500 text-white rounded font-medium hover:bg-emerald-600 disabled:opacity-50">
        {loading ? "..." : "Confirmer"}
      </button>
      <button onClick={() => setConfirm(false)} className="text-[10px] px-2 py-1 border rounded text-muted-foreground hover:bg-muted">✕</button>
    </div>
  );

  return (
    <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 px-2" onClick={handleClick}>
      <RefreshCw className="size-3" /> Renouveler
    </Button>
  );
}
