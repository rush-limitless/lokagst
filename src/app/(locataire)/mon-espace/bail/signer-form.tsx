"use client";

import { signerMonBail } from "@/actions/portail-signature";
import { SignaturePad } from "@/components/signature-pad";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SignerMonBailForm() {
  const router = useRouter();

  async function handleSave(dataUrl: string) {
    const result = await signerMonBail(dataUrl);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success("Bail signé !");
    router.refresh();
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">Signez votre bail ci-dessous avec le doigt ou la souris :</p>
      <SignaturePad onSave={handleSave} />
    </div>
  );
}
