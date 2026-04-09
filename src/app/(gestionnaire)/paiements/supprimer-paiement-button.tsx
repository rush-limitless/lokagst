"use client";

import { supprimerPaiement } from "@/actions/paiements";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SupprimerPaiementButton({ id }: { id: string }) {
  const router = useRouter();

  return (
    <ConfirmDialog
      trigger={<button className="text-red-600 text-xs hover:underline">Suppr.</button>}
      title="Supprimer ce paiement ?"
      description="Cette action est irréversible. Le paiement sera définitivement supprimé et ne sera plus comptabilisé."
      onConfirm={async () => {
        const result = await supprimerPaiement(id);
        if ("error" in result) { toast.error(result.error as string); return; }
        toast.success("Paiement supprimé");
        router.refresh();
      }}
    />
  );
}
