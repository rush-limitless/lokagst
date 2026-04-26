"use client";

import { modifierLocataire } from "@/actions/locataires";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter, } from "next/navigation";
import { useState, useRef } from "react";

export function ModifierLocataireForm({ locataire }: { locataire: any }) {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState(locataire.photo || "");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setPhotoUrl(data.url);
  }

  async function handleSubmit(formData: FormData) {
    if (photoUrl) formData.set("photo", photoUrl);
    const result = await modifierLocataire(locataire.id, formData);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success("Locataire modifié");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border">
              {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl">👤</div>}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>📷 Changer la photo</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Nom</Label><Input name="nom" defaultValue={locataire.nom} /></div>
            <div className="space-y-2"><Label>Prénom</Label><Input name="prenom" defaultValue={locataire.prenom} /></div>
          </div>
          <div className="space-y-2"><Label>Téléphone</Label><Input name="telephone" defaultValue={locataire.telephone} /></div>
          <div className="space-y-2"><Label>Email</Label><Input name="email" defaultValue={locataire.email || ""} /></div>
          <div className="space-y-2"><Label>N° CNI</Label><Input name="numeroCNI" defaultValue={locataire.numeroCNI || ""} /></div>
          {/* Bail actif info */}
          {locataire.baux?.[0] && (
            <div className="bg-muted/30 rounded-lg p-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Logement actuel</p>
              <p className="text-sm font-medium text-foreground">{locataire.baux[0].appartement?.numero} — {locataire.baux[0].appartement?.immeuble?.nom || "—"}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Garant</Label><Input name="garant" defaultValue={locataire.garant || ""} placeholder="Nom du garant" /></div>
            <div className="space-y-2"><Label>Tél. garant</Label><Input name="telGarant" defaultValue={locataire.telGarant || ""} placeholder="6XXXXXXXX" /></div>
          </div>
          <div className="space-y-2"><Label>Notes</Label><textarea name="notes" defaultValue={locataire.notes || ""} className="w-full border rounded-md p-2 h-16 text-sm bg-card text-foreground" placeholder="Remarques sur le locataire..." /></div>
          <Button type="submit">Enregistrer les modifications</Button>
        </form>
      </CardContent>
    </Card>
  );
}
