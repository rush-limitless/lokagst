"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function UploadReglementForm({ locataireId }: { locataireId: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) {
      await fetch("/api/upload-reglement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locataireId, url: data.url }),
      });
      toast.success("Règlement intérieur uploadé");
      router.refresh();
    } else {
      toast.error("Erreur upload");
    }
    setUploading(false);
  }

  return (
    <>
      <input ref={fileRef} type="file" accept=".pdf,image/*" onChange={handleUpload} className="hidden" />
      <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
        {uploading ? "Upload..." : "📎 Uploader PDF"}
      </Button>
    </>
  );
}
