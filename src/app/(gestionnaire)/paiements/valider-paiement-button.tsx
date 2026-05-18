"use client";

import { validerPaiement } from "@/actions/paiements";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ValiderPaiementButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    await validerPaiement(id);
    toast.success("Paiement validé");
    router.refresh();
    setLoading(false);
  }

  return (
    <Button variant="ghost" size="icon-xs" title="Valider" onClick={handleClick} disabled={loading}>
      <CheckCircle className="size-3.5 text-emerald-600" />
    </Button>
  );
}
