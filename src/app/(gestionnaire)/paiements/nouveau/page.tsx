"use client";

import { enregistrerPaiement } from "@/actions/paiements";
import { getBaux } from "@/actions/baux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FileUpload } from "@/components/file-upload";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function NouveauPaiement() {
  const router = useRouter();
  const [baux, setBaux] = useState<any[]>([]);
  const [selectedBail, setSelectedBail] = useState<any>(null);
  const [preuveUrl, setPreuveUrl] = useState("");
  const [montantLoyer, setMontantLoyer] = useState(0);
  const [montantCharges, setMontantCharges] = useState(0);
  const [montantCaution, setMontantCaution] = useState(0);
  const [montantAutres, setMontantAutres] = useState(0);
  const [nbMois, setNbMois] = useState(1);

  useEffect(() => { getBaux({ statut: "ACTIF" }).then(setBaux); }, []);

  const isJournalier = selectedBail?.periodicite === "JOURNALIER";
  const periodeLabel = isJournalier ? "jour(s)" : "mois";

  useEffect(() => {
    if (selectedBail) {
      setMontantLoyer(selectedBail.montantLoyer * nbMois);
      setMontantCharges(selectedBail.totalCharges * nbMois);
    }
  }, [selectedBail, nbMois]);

  const totalCalcule = montantLoyer + montantCharges + montantCaution + montantAutres;

  async function handleSubmit(formData: FormData) {
    if (preuveUrl) formData.set("preuvePaiement", preuveUrl);
    formData.set("montant", totalCalcule.toString());
    formData.set("montantLoyer", montantLoyer.toString());
    formData.set("montantCharges", montantCharges.toString());
    formData.set("montantCaution", montantCaution.toString());
    formData.set("montantAutres", montantAutres.toString());
    formData.set("nbMois", nbMois.toString());
    const result = await enregistrerPaiement(formData);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Paiement enregistré");
    router.push("/paiements");
  }

  const periodiciteLabel: Record<string, string> = { MENSUEL: "1 mois", TRIMESTRIEL: "3 mois", SEMESTRIEL: "6 mois", ANNUEL: "12 mois" };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-foreground mb-6">Enregistrer un paiement</h1>
      <Card>
        <CardContent className="pt-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Bail (Locataire — Appartement)</Label>
              <select name="bailId" className="w-full border rounded-md p-2" required onChange={(e) => { setSelectedBail(baux.find((b) => b.id === e.target.value)); setNbMois(1); }}>
                <option value="">Sélectionner...</option>
                {baux.map((b) => (
                  <option key={b.id} value={b.id}>{b.locataire.nom} {b.locataire.prenom} — {b.appartement.numero} ({periodiciteLabel[b.periodicite] || "mensuel"})</option>
                ))}
              </select>
            </div>
            {selectedBail && (
              <div className="bg-primary/5 p-3 rounded text-sm space-y-1">
                <p>Loyer{isJournalier ? "/jour" : ""} : <strong>{selectedBail.montantLoyer.toLocaleString()} FCFA</strong></p>
                <p>Charges{isJournalier ? "/jour" : ""} : <strong>{selectedBail.totalCharges.toLocaleString()} FCFA</strong></p>
                <p>Total {isJournalier ? "journalier" : "mensuel"} : <strong>{selectedBail.totalMensuel.toLocaleString()} FCFA</strong></p>
                <p>Caution : <strong>{selectedBail.montantCaution.toLocaleString()} FCFA</strong> {selectedBail.cautionPayee ? "✅ Payée" : "❌ Non payée"}</p>
                <p>Périodicité : <strong>{selectedBail.periodicite}</strong></p>
              </div>
            )}
            <div className="space-y-2">
              <Label>Nombre de {periodeLabel} couverts</Label>
              <Input type="number" min="1" max={isJournalier ? 365 : 12} value={nbMois} onChange={(e) => setNbMois(parseInt(e.target.value) || 1)} />
              {nbMois > 1 && !isJournalier && <p className="text-xs text-muted-foreground">Le paiement sera ventilé sur {nbMois} mois à partir de la date indiquée</p>}
              {isJournalier && <p className="text-xs text-muted-foreground">Paiement pour {nbMois} jour(s) — Total : {(selectedBail.totalMensuel * nbMois).toLocaleString()} FCFA</p>}
            </div>
            <div className="space-y-2"><Label>{isJournalier ? "Date concernée (jour)" : "Période concernée (mois)"}</Label><Input name="moisConcerne" type="date" required />{selectedBail && !isJournalier && <p className="text-xs text-muted-foreground">Le jour sera automatiquement ajusté au jour d&apos;entrée du locataire ({new Date(selectedBail.dateDebut).getDate()} du mois)</p>}</div>

            <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
              <p className="text-sm font-medium">Ventilation du paiement</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Loyer (FCFA)</Label><Input type="number" min="0" value={montantLoyer} onChange={(e) => setMontantLoyer(parseInt(e.target.value) || 0)} /></div>
                <div className="space-y-1"><Label className="text-xs">Charges (FCFA)</Label><Input type="number" min="0" value={montantCharges} onChange={(e) => setMontantCharges(parseInt(e.target.value) || 0)} /></div>
                <div className="space-y-1"><Label className="text-xs">Caution (FCFA)</Label><Input type="number" min="0" value={montantCaution} onChange={(e) => setMontantCaution(parseInt(e.target.value) || 0)} /></div>
                <div className="space-y-1"><Label className="text-xs">Autres (FCFA)</Label><Input type="number" min="0" value={montantAutres} onChange={(e) => setMontantAutres(parseInt(e.target.value) || 0)} /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Détail autres (optionnel)</Label><Input name="notesAutres" placeholder="Préciser..." /></div>
              <div className="text-right text-sm font-bold text-primary">Total : {totalCalcule.toLocaleString()} FCFA</div>
            </div>

            <div className="space-y-2">
              <Label>Mode de paiement</Label>
              <select name="modePaiement" className="w-full border rounded-md p-2" required>
                <option value="VIREMENT_BANCAIRE">Virement bancaire</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="ESPECES">Espèces</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Preuve de paiement</Label>
              <FileUpload onUploaded={setPreuveUrl} label="Joindre la preuve de paiement" />
            </div>
            <div className="space-y-2"><Label>Notes (optionnel)</Label><Input name="notes" /></div>
            <label className="flex items-center gap-2 p-3 border rounded-lg bg-orange-50 dark:bg-orange-950/10">
              <input type="checkbox" name="appliquerPenalite" className="rounded" />
              <span className="text-sm">Appliquer la pénalité de retard ({selectedBail ? `${selectedBail.penaliteMontant}${selectedBail.penaliteType === "POURCENTAGE" ? "%" : " FCFA"}` : "—"})</span>
            </label>
            <input type="hidden" name="preuvePaiement" value={preuveUrl} />
            <Button type="submit" className="w-full">Enregistrer le paiement — {totalCalcule.toLocaleString()} FCFA</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
