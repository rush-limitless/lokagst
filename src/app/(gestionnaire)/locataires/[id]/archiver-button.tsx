"use client";

import { archiverLocataire } from "@/actions/locataires";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ArchiverButton({ locataireId }: { locataireId: string }) {
  const router = useRouter();

  return (
    <ConfirmDialog
      trigger={<Button variant="destructive" size="sm">Archiver</Button>}
      title="Archiver ce locataire ?"
      description="Son bail actif sera résilié et l'appartement libéré. Cette action est irréversible."
      onConfirm={async () => {
        await archiverLocataire(locataireId);
        toast.success("Locataire archivé");
        router.push("/locataires");
      }}
    />
  );
}
