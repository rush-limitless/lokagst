"use client";

import { envoyerRappelsMassifs } from "@/actions/emails";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export function EnvoyerRappelsButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const result = await envoyerRappelsMassifs();
    setLoading(false);
    if (result.success) {
      toast.success(`${result.envoyes} rappel(s) envoyé(s)`);
    } else {
      toast.error("Erreur lors de l'envoi");
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} variant="destructive">
      {loading ? "Envoi en cours..." : "📧 Envoyer les rappels"}
    </Button>
  );
}
