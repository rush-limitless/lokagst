"use client";

import { supprimerLocataire } from "@/actions/locataires";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SupprimerLocataireButton({ locataireId, nom }: { locataireId: string; nom: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    const result = await supprimerLocataire(locataireId);
    setLoading(false);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success("Locataire supprimé");
    router.push("/locataires");
  }

  if (!open) return <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>🗑️ Supprimer</Button>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
      <div className="bg-card rounded-xl p-6 max-w-sm w-full shadow-xl border space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-foreground">⚠️ Supprimer le locataire</h3>
        <p className="text-sm text-muted-foreground">
          Êtes-vous sûr de vouloir supprimer <strong>{nom}</strong> ? Cette action supprimera définitivement :
        </p>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>Le locataire et ses informations</li>
          <li>Tous ses baux et contrats</li>
          <li>Tous ses paiements</li>
          <li>Ses messages et emails</li>
          <li>Son compte utilisateur (s&apos;il existe)</li>
        </ul>
        <p className="text-sm text-red-600 font-medium">Cette action est irréversible.</p>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={handleDelete} disabled={loading} className="flex-1">
            {loading ? "Suppression..." : "Confirmer la suppression"}
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
        </div>
      </div>
    </div>
  );
}
