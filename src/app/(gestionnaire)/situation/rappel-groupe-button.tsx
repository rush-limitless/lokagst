"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export function RappelGroupeButton({ nbImpayes }: { nbImpayes: number }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm(`Envoyer un rappel par email à ${nbImpayes} locataire(s) en retard ?`)) return;
    setLoading(true);
    try {
      const { envoyerRappelsMassifs } = await import("@/actions/emails");
      const res = await envoyerRappelsMassifs();
      if (res.success) toast.success(`${res.envoyes} rappel(s) envoyé(s)`);
      else toast.error("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  }

  if (nbImpayes === 0) return null;

  return (
    <Button size="sm" variant="outline" className="gap-1.5 border-red-300 text-red-600 hover:bg-red-50" onClick={handleClick} disabled={loading}>
      <Mail className="size-3.5" />
      {loading ? "Envoi..." : `Rappel groupé (${nbImpayes})`}
    </Button>
  );
}
