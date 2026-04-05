"use client";

import { uploaderContrat } from "@/actions/baux";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function UploadContratForm({ bailId }: { bailId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) {
      await uploaderContrat(bailId, data.url);
      toast.success("Contrat uploadé");
      router.refresh();
    } else {
      toast.error("Erreur upload");
    }
    setUploading(false);
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-3">Uploadez le scan ou PDF du contrat enregistré :</p>
      <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleUpload} className="hidden" />
      <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
        {uploading ? "Upload en cours..." : "📎 Choisir un fichier"}
      </Button>
    </div>
  );
}
