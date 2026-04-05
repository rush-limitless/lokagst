"use client";

import { signalerProbleme } from "@/actions/portail-maintenance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function SignalerForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setPhotos([...photos, data.url]);
    setUploading(false);
  }

  async function handleSubmit(formData: FormData) {
    formData.set("photos", JSON.stringify(photos));
    const result = await signalerProbleme(formData);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success("Problème signalé !");
    setOpen(false);
    setPhotos([]);
    router.refresh();
  }

  if (!open) return <Button onClick={() => setOpen(true)} className="w-full">🔧 Signaler un problème</Button>;

  return (
    <Card>
      <CardHeader><CardTitle>Signaler un problème</CardTitle></CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Titre</Label><Input name="titre" placeholder="Ex: Fuite robinet cuisine" required /></div>
          <div className="space-y-2"><Label>Description</Label><textarea name="description" className="w-full border rounded-md p-2 h-20" placeholder="Décrivez le problème..." required /></div>
          <div className="space-y-2">
            <Label>Priorité</Label>
            <select name="priorite" className="w-full border rounded-md p-2">
              <option value="BASSE">Basse</option>
              <option value="NORMALE">Normale</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? "Upload..." : "📷 Photo"}
            </Button>
            {photos.length > 0 && <div className="flex gap-2 mt-2">{photos.map((p, i) => <img key={i} src={p} alt="" className="w-14 h-14 rounded object-cover" />)}</div>}
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Envoyer</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
