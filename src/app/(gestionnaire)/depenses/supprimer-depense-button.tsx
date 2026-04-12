"use client";

import { supprimerDepense } from "@/actions/depenses";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SupprimerDepenseButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <ConfirmDialog
      trigger={<button className="text-red-600 text-xs hover:underline">Suppr.</button>}
      title="Supprimer cette dépense ?"
      description="Cette action est irréversible."
      onConfirm={async () => {
        const result = await supprimerDepense(id);
        if ("error" in result) { toast.error(result.error as string); return; }
        toast.success("Dépense supprimée");
        router.refresh();
      }}
    />
  );
}
