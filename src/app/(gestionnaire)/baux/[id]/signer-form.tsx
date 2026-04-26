"use client";

import { signerBail } from "@/actions/baux";
import { SignaturePad } from "@/components/signature-pad";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SignerBailForm({ bailId }: { bailId: string }) {
  const router = useRouter();

  async function handleSave(dataUrl: string) {
    const result = await signerBail(bailId, dataUrl);
    if (result.success) {
      toast.success("Bail signé électroniquement");
      router.refresh();
    }
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">Le locataire peut signer ci-dessous avec le doigt ou la souris :</p>
      <SignaturePad onSave={handleSave} />
    </div>
  );
}
