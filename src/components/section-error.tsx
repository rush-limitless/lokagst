"use client";

import { Button } from "@/components/ui/button";

export function SectionError({ error, reset, section }: { error: Error; reset: () => void; section: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-lg font-bold text-foreground mb-2">Erreur — {section}</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">{error.message || "Une erreur inattendue est survenue lors du chargement de cette page."}</p>
      <div className="flex gap-3">
        <Button onClick={reset}>🔄 Réessayer</Button>
        <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>Retour au dashboard</Button>
      </div>
    </div>
  );
}
