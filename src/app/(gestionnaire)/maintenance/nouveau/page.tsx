"use client";

import { creerMaintenance } from "@/actions/maintenance";
import { getLocataires } from "@/actions/locataires";
import { getAppartements } from "@/actions/appartements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";

export default function NouveauTicket() {
  const router = useRouter();
  const [locataires, setLocataires] = useState<any[]>([]);
  const [apparts, setApparts] = useState<any[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getLocataires({ statut: "ACTIF" }).then(setLocataires);
    getAppartements().then(setApparts);
  }, []);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) { setPhotos([...photos, data.url]); toast.success("Photo ajoutée"); }
    setUploading(false);
  }

  async function handleSubmit(formData: FormData) {
    formData.set("photos", JSON.stringify(photos));
    const result = await creerMaintenance(formData);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Ticket créé");
    router.push("/maintenance");
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-blue-950 mb-6">Signaler un problème</h1>
      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Locataire</Label>
              <select name="locataireId" className="w-full border rounded-md p-2" required>
                <option value="">Sélectionner...</option>
                {locataires.map((l) => <option key={l.id} value={l.id}>{l.prenom} {l.nom}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Appartement</Label>
              <select name="appartementId" className="w-full border rounded-md p-2" required>
                <option value="">Sélectionner...</option>
                {apparts.map((a) => <option key={a.id} value={a.id}>{a.numero}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>Titre</Label><Input name="titre" placeholder="Ex: Fuite robinet cuisine" required /></div>
            <div className="space-y-2"><Label>Description</Label><textarea name="description" className="w-full border rounded-md p-2 h-24" placeholder="Décrivez le problème en détail..." required /></div>
            <div className="space-y-2">
              <Label>Priorité</Label>
              <select name="priorite" className="w-full border rounded-md p-2">
                <option value="BASSE">Basse</option>
                <option value="NORMALE" selected>Normale</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Photos</Label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? "Upload..." : "📷 Ajouter une photo"}
              </Button>
              {photos.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {photos.map((p, i) => <img key={i} src={p} alt="" className="w-16 h-16 rounded object-cover border" />)}
                </div>
              )}
            </div>
            <Button type="submit" className="w-full">Créer le ticket</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
