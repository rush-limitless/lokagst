"use client";

import { archiverLocataire } from "@/actions/locataires";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ArchiverButton({ locataireId }: { locataireId: string }) {
  const router = useRouter();

  async function handleArchiver() {
    if (!confirm("Archiver ce locataire ? Son bail sera résilié.")) return;
    await archiverLocataire(locataireId);
    toast.success("Locataire archivé");
    router.push("/locataires");
  }

  return <Button variant="destructive" size="sm" onClick={handleArchiver}>Archiver</Button>;
}
