"use client";

import { enregistrerPaiement } from "@/actions/paiements";
import { getBaux } from "@/actions/baux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";

export default function NouveauPaiement() {
  const router = useRouter();
  const [baux, setBaux] = useState<any[]>([]);
  const [selectedBail, setSelectedBail] = useState<any>(null);
  const [preuveUrl, setPreuveUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { getBaux({ statut: "ACTIF" }).then(setBaux); }, []);

  async function handlePreuve(e: React.ChangeEvent<HTMLInputElement>) {
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
    const result = await enregistrerPaiement(formData);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Paiement enregistré");
    router.push("/paiements");
  }

  const periodiciteLabel: Record<string, string> = { MENSUEL: "1 mois", TRIMESTRIEL: "3 mois", SEMESTRIEL: "6 mois", ANNUEL: "12 mois" };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-blue-950 mb-6">Enregistrer un paiement</h1>
      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Bail (Locataire — Appartement)</Label>
              <select name="bailId" className="w-full border rounded-md p-2" required onChange={(e) => setSelectedBail(baux.find((b) => b.id === e.target.value))}>
                <option value="">Sélectionner...</option>
                {baux.map((b) => (
                  <option key={b.id} value={b.id}>{b.locataire.prenom} {b.locataire.nom} — {b.appartement.numero} ({periodiciteLabel[b.periodicite] || "mensuel"})</option>
                ))}
              </select>
            </div>
            {selectedBail && (
              <div className="bg-blue-50 p-3 rounded text-sm space-y-1">
                <p>Loyer : <strong>{selectedBail.montantLoyer.toLocaleString()} FCFA</strong></p>
                <p>Charges : <strong>{selectedBail.totalCharges.toLocaleString()} FCFA</strong></p>
                <p>Total mensuel : <strong>{selectedBail.totalMensuel.toLocaleString()} FCFA</strong></p>
                <p>Périodicité : <strong>{periodiciteLabel[selectedBail.periodicite] || "Mensuel"}</strong></p>
              </div>
            )}
            <div className="space-y-2"><Label>Montant payé (FCFA)</Label><Input name="montant" type="number" min="1" required /></div>
            <div className="space-y-2"><Label>Période concernée (1er jour)</Label><Input name="moisConcerne" type="date" required /></div>
            <div className="space-y-2">
              <Label>Mode de paiement</Label>
              <select name="modePaiement" className="w-full border rounded-md p-2" required>
                <option value="VIREMENT_BANCAIRE">Virement bancaire</option>
                <option value="ORANGE_MONEY">Orange Money</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Preuve de paiement</Label>
              <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={handlePreuve} className="hidden" />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? "Upload..." : "📎 Joindre la preuve (virement, reçu Orange Money)"}
              </Button>
              {preuveUrl && <p className="text-green-600 text-sm">✅ Preuve jointe</p>}
            </div>
            <div className="space-y-2"><Label>Notes (optionnel)</Label><Input name="notes" /></div>
            <input type="hidden" name="preuvePaiement" value={preuveUrl} />
            <Button type="submit" className="w-full">Enregistrer le paiement</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
