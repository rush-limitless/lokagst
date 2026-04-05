"use client";

import { creerEtatDesLieux } from "@/actions/etats-des-lieux";
import { SignaturePad } from "@/components/signature-pad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useRef } from "react";

const PIECES_DEFAUT = ["Entrée", "Salon", "Cuisine", "Chambre 1", "Chambre 2", "Salle de bain", "WC", "Balcon"];
const ETATS = ["Bon état", "Usure normale", "Dégât mineur", "Dégât important"];

export function EdlForm({ bailId }: { bailId: string }) {
  const router = useRouter();
  const [type, setType] = useState("ENTREE");
  const [pieces, setPieces] = useState(PIECES_DEFAUT.map((p) => ({ nom: p, etat: "Bon état", observation: "" })));
  const [observations, setObservations] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [sigLoc, setSigLoc] = useState("");
  const [sigGest, setSigGest] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function updatePiece(i: number, field: string, value: string) {
    const updated = [...pieces];
    (updated[i] as any)[field] = value;
    setPieces(updated);
  }

  function ajouterPiece() {
    setPieces([...pieces, { nom: "", etat: "Bon état", observation: "" }]);
  }

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

  async function handleSubmit() {
    const formData = new FormData();
    formData.set("bailId", bailId);
    formData.set("type", type);
    formData.set("observations", observations);
    formData.set("pieces", JSON.stringify(pieces));
    formData.set("photos", JSON.stringify(photos));
    formData.set("signatureLocataire", sigLoc);
    formData.set("signatureGestionnaire", sigGest);

    const result = await creerEtatDesLieux(formData);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success("État des lieux enregistré");
    router.back();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader><CardTitle>Type</CardTitle></CardHeader>
        <CardContent>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded-md p-2">
            <option value="ENTREE">État des lieux d&apos;entrée</option>
            <option value="SORTIE">État des lieux de sortie</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Pièces</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={ajouterPiece}>+ Ajouter une pièce</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {pieces.map((p, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded">
              <div>
                <Label className="text-xs">Pièce</Label>
                <Input value={p.nom} onChange={(e) => updatePiece(i, "nom", e.target.value)} placeholder="Nom" />
              </div>
              <div>
                <Label className="text-xs">État</Label>
                <select value={p.etat} onChange={(e) => updatePiece(i, "etat", e.target.value)} className="w-full border rounded-md p-2 text-sm">
                  {ETATS.map((e) => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">Observation</Label>
                <Input value={p.observation} onChange={(e) => updatePiece(i, "observation", e.target.value)} placeholder="Détails..." />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
        <CardContent>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "Upload..." : "📷 Ajouter une photo"}
          </Button>
          {photos.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {photos.map((p, i) => <img key={i} src={p} alt="" className="w-20 h-20 rounded object-cover border" />)}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Observations générales</CardTitle></CardHeader>
        <CardContent>
          <textarea value={observations} onChange={(e) => setObservations(e.target.value)} className="w-full border rounded-md p-2 h-20" placeholder="Remarques générales..." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Signature du locataire</CardTitle></CardHeader>
        <CardContent>
          {sigLoc ? <p className="text-green-600 text-sm">✅ Signé</p> : <SignaturePad onSave={setSigLoc} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Signature du gestionnaire</CardTitle></CardHeader>
        <CardContent>
          {sigGest ? <p className="text-green-600 text-sm">✅ Signé</p> : <SignaturePad onSave={setSigGest} />}
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} className="w-full" size="lg" disabled={!sigLoc || !sigGest}>
        Enregistrer l&apos;état des lieux
      </Button>
    </div>
  );
}
