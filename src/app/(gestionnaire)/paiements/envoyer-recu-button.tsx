"use client";

import { envoyerRecuPaiement } from "@/actions/emails";
import { toast } from "sonner";
import { useState } from "react";

export function EnvoyerRecuButton({ paiementId }: { paiementId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await envoyerRecuPaiement(paiementId);
    setLoading(false);
    if (result.success) toast.success("Reçu envoyé par email");
    else toast.error(result.error || "Erreur");
  }

  return (
    <button onClick={handleClick} disabled={loading} className="text-green-600 text-sm hover:underline disabled:opacity-50">
      {loading ? "..." : "📧"}
    </button>
  );
}
