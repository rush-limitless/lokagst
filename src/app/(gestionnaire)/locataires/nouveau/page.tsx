"use client";

import { creerLocataire } from "@/actions/locataires";
import { getAppartements } from "@/actions/appartements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";

export default function NouveauLocataire() {
  const router = useRouter();
  const [apparts, setApparts] = useState<any[]>([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAppartements({ statut: "LIBRE" }).then(setApparts);
  }, []);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("photo", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) { setPhotoUrl(data.url); toast.success("Photo uploadée"); }
    else toast.error("Erreur upload");
    setUploading(false);
  }

  async function handleSubmit(formData: FormData) {
    if (photoUrl) formData.set("photo", photoUrl);
    const result = await creerLocataire(formData);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Locataire ajouté");
    router.push("/locataires");
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-blue-950 mb-6">Nouveau locataire</h1>
      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                {photoUrl ? (
                  <img src={photoUrl} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-2xl">👤</span>
                )}
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? "Upload..." : "📷 Ajouter une photo"}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nom</Label><Input name="nom" required /></div>
              <div className="space-y-2"><Label>Prénom</Label><Input name="prenom" required /></div>
            </div>
            <div className="space-y-2"><Label>Téléphone</Label><Input name="telephone" placeholder="6XXXXXXXX" required /></div>
            <div className="space-y-2"><Label>Email (optionnel)</Label><Input name="email" type="email" /></div>
            <div className="space-y-2"><Label>N° CNI (optionnel)</Label><Input name="numeroCNI" /></div>
            <div className="space-y-2">
              <Label>Appartement</Label>
              <select name="appartementId" className="w-full border rounded-md p-2" required>
                <option value="">Sélectionner...</option>
                {apparts.map((a) => <option key={a.id} value={a.id}>{a.numero} — {a.type} — {a.loyerBase.toLocaleString()} FCFA</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>Date d&apos;entrée</Label><Input name="dateEntree" type="date" required /></div>
            <input type="hidden" name="photo" value={photoUrl} />
            <Button type="submit" className="w-full">Ajouter le locataire</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
