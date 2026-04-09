"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function FileUpload({ onUploaded, accept = "image/*,.pdf", label = "Joindre un fichier", className }: {
  onUploaded: (url: string) => void; accept?: string; label?: string; className?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error("Fichier trop volumineux (max 5 Mo)"); return; }
    setUploading(true);
    setFileName(file.name);
    if (file.type.startsWith("image/")) setPreview(URL.createObjectURL(file));

    try {
      const fd = new FormData();
      fd.append("photo", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erreur upload"); }
      const data = await res.json();
      onUploaded(data.url);
      toast.success("Fichier uploadé");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'upload");
      setPreview(null);
      setFileName(null);
    } finally {
      setUploading(false);
    }
  }, [onUploaded]);

  return (
    <div className={className}>
      <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
      <div
        className={cn("border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors", dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50")}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) upload(f); }}
      >
        {uploading ? (
          <div className="py-2"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" /><p className="text-xs text-muted-foreground mt-2">Upload en cours...</p></div>
        ) : preview ? (
          <div className="space-y-2">
            <img src={preview} alt="" className="max-h-24 mx-auto rounded" />
            <p className="text-xs text-emerald-600">✅ {fileName}</p>
            <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={(e) => { e.stopPropagation(); setPreview(null); setFileName(null); fileRef.current!.value = ""; }}>Changer</Button>
          </div>
        ) : fileName ? (
          <div className="space-y-1">
            <p className="text-2xl">📄</p>
            <p className="text-xs text-emerald-600">✅ {fileName}</p>
            <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={(e) => { e.stopPropagation(); setFileName(null); fileRef.current!.value = ""; }}>Changer</Button>
          </div>
        ) : (
          <div className="space-y-1 py-2">
            <p className="text-2xl">📎</p>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-[10px] text-muted-foreground">Glisser-déposer ou cliquer · JPG, PNG, PDF · Max 5 Mo</p>
          </div>
        )}
      </div>
    </div>
  );
}
