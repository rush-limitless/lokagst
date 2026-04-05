"use client";

import { soumettrePreuvePaiement } from "@/actions/portail-paiement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function SoumettrePreuveForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [preuveUrl, setPreuveUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) { setPreuveUrl(data.url); toast.success("Preuve uploadée"); }
    setUploading(false);
  }

  async function handleSubmit(formData: FormData) {
    if (preuveUrl) formData.set("preuvePaiement", preuveUrl);
    const result = await soumettrePreuvePaiement(formData);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success("Paiement soumis !");
    setOpen(false);
    setPreuveUrl("");
    router.refresh();
  }

  if (!open) return <Button onClick={() => setOpen(true)} className="w-full">💳 Soumettre un paiement</Button>;

  return (
    <Card>
      <CardHeader><CardTitle>Soumettre un paiement</CardTitle></CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2"><Label>Montant payé (FCFA)</Label><Input name="montant" type="number" min="1" required /></div>
          <div className="space-y-2"><Label>Période concernée</Label><Input name="moisConcerne" type="date" required /></div>
          <div className="space-y-2">
            <Label>Mode de paiement</Label>
            <select name="modePaiement" className="w-full border rounded-md p-2" required>
              <option value="VIREMENT_BANCAIRE">Virement bancaire</option>
              <option value="ORANGE_MONEY">Orange Money</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Preuve de paiement (obligatoire)</Label>
            <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handleUpload} className="hidden" />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? "Upload..." : "📎 Joindre la preuve"}
            </Button>
            {preuveUrl && <p className="text-green-600 text-sm">✅ Preuve jointe</p>}
          </div>
          <div className="space-y-2"><Label>Notes</Label><Input name="notes" placeholder="Référence virement, etc." /></div>
          <input type="hidden" name="preuvePaiement" value={preuveUrl} />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={!preuveUrl}>Soumettre</Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
