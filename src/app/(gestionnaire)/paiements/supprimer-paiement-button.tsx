"use client";

import { supprimerPaiement } from "@/actions/paiements";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SupprimerPaiementButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Supprimer ce paiement ?")) return;
    const result = await supprimerPaiement(id);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success("Paiement supprimé");
    router.refresh();
  }

  return <button onClick={handleDelete} className="text-red-600 text-xs hover:underline">Suppr.</button>;
}
