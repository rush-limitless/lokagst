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
import { formatFCFA } from "@/lib/utils";

const TYPES_PIECES = ["Entrée", "Salon", "Cuisine", "Chambre", "Salle de bain", "WC", "Balcon", "Terrasse", "Couloir", "Bureau", "Buanderie", "Garage", "Cave", "Jardin", "Autre"];
const ETATS = ["Bon état", "Usure normale", "Dégât mineur", "Dégât important"];

export function EdlForm({ bailId, montantCaution }: { bailId: string; montantCaution?: number }) {
  const router = useRouter();
  const [type, setType] = useState("ENTREE");
  const [pieces, setPieces] = useState<{ nom: string; etat: string; observation: string }[]>([]);
  const [observations, setObservations] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [sigLoc, setSigLoc] = useState("");
  const [sigGest, setSigGest] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cautionRembourse, setCautionRembourse] = useState(montantCaution || 0);
  const fileRef = useRef<HTMLInputElement>(null);

  function ajouterPiece(nom: string) {
    if (!nom) return;
    setPieces([...pieces, { nom, etat: "Bon état", observation: "" }]);
  }

  function retirerPiece(i: number) {
    setPieces(pieces.filter((_, idx) => idx !== i));
  }

  function updatePiece(i: number, field: string, value: string) {
    const updated = [...pieces];
    (updated[i] as any)[field] = value;
    setPieces(updated);
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
    formData.set("observations", observations + (type === "SORTIE" ? `\n\nCaution à rembourser : ${cautionRembourse} FCFA` : ""));
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
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded-md p-2 bg-background">
            <option value="ENTREE">État des lieux d&apos;entrée</option>
            <option value="SORTIE">État des lieux de sortie</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Pièces ({pieces.length})</CardTitle>
            <select onChange={(e) => { ajouterPiece(e.target.value); e.target.value = ""; }} className="border rounded-md p-2 text-sm bg-background" defaultValue="">
              <option value="" disabled>+ Ajouter une pièce</option>
              {TYPES_PIECES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {pieces.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Sélectionnez des pièces dans la liste déroulante ci-dessus</p>}
          {pieces.map((p, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 p-3 bg-muted/30 rounded items-end">
              <div>
                <Label className="text-xs">Pièce</Label>
                <Input value={p.nom} onChange={(e) => updatePiece(i, "nom", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">État</Label>
                <select value={p.etat} onChange={(e) => updatePiece(i, "etat", e.target.value)} className="w-full border rounded-md p-2 text-sm bg-background">
                  {ETATS.map((e) => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">Observation</Label>
                <Input value={p.observation} onChange={(e) => updatePiece(i, "observation", e.target.value)} placeholder="Détails..." />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => retirerPiece(i)} className="text-red-500 hover:text-red-700 h-9">✕</Button>
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
              {photos.map((p, i) => (
                <div key={i} className="relative">
                  <img src={p} alt="" className="w-20 h-20 rounded object-cover border" />
                  <button onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✕</button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Observations générales</CardTitle></CardHeader>
        <CardContent>
          <textarea value={observations} onChange={(e) => setObservations(e.target.value)} className="w-full border rounded-md p-2 h-20 bg-background" placeholder="Remarques générales..." />
        </CardContent>
      </Card>

      {/* Caution à rembourser — uniquement pour EDL de sortie */}
      {type === "SORTIE" && montantCaution && montantCaution > 0 && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader><CardTitle>💰 Caution à rembourser</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Caution versée : <strong>{formatFCFA(montantCaution)}</strong></p>
            <div className="space-y-2">
              <Label>Montant à rembourser (FCFA)</Label>
              <Input type="number" value={cautionRembourse} onChange={(e) => setCautionRembourse(parseInt(e.target.value) || 0)} />
            </div>
            {cautionRembourse < montantCaution && (
              <p className="text-xs text-orange-600">Retenue : {formatFCFA(montantCaution - cautionRembourse)}</p>
            )}
          </CardContent>
        </Card>
      )}

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
