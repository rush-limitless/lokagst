"use client";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">Erreur</h1>
        <p className="text-gray-500 mt-4">{error.message || "Une erreur inattendue est survenue"}</p>
        <Button onClick={reset} className="mt-6">Réessayer</Button>
      </div>
    </div>
  );
}
