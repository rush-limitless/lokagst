"use client";

import { supprimerAppartement } from "@/actions/appartements";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SupprimerAppartButton({ id, hasActiveBail }: { id: string; hasActiveBail: boolean }) {
  const router = useRouter();

  if (hasActiveBail) return null;

  return (
    <ConfirmDialog
      trigger={<Button variant="destructive" size="sm">Supprimer</Button>}
      title="Supprimer cet appartement ?"
      description="Cette action est irréversible. L'appartement sera définitivement supprimé."
      onConfirm={async () => {
        const result = await supprimerAppartement(id);
        if ("error" in result) { toast.error(result.error as string); return; }
        toast.success("Appartement supprimé");
        router.push("/appartements");
      }}
    />
  );
}
