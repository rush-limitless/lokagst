"use client";

import { validerPaiement } from "@/actions/paiements";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ValiderPaiementButton({ id }: { id: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const router = useRouter();

  async function handleClick() {
    setStatus("done"); // Optimistic: show as validated immediately
    try {
      await validerPaiement(id);
      toast.success("Paiement validé");
      router.refresh();
    } catch {
      setStatus("idle"); // Revert on error
      toast.error("Erreur lors de la validation");
    }
  }

  if (status === "done") return <span className="text-[10px] text-emerald-600 font-medium px-1">Validé</span>;

  return (
    <Button variant="ghost" size="icon-xs" title="Valider" onClick={handleClick} disabled={status === "loading"}>
      <CheckCircle className="size-3.5 text-emerald-600" />
    </Button>
  );
}
