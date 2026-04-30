"use client";

import { modifierBail } from "@/actions/baux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ModifierBailForm({ bail }: { bail: any }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const charges = (bail.chargesLocatives as { type: string; montant: number }[]) || [];
  const [chargesList, setChargesList] = useState(charges);
  const isMeuble = bail.appartement && ["APPARTEMENT_MEUBLE", "CHAMBRE_MEUBLE", "STUDIO_MEUBLE"].includes(bail.appartement.type);

  function addCharge() { setChargesList([...chargesList, { type: "", montant: 0 }]); }
  function removeCharge(i: number) { setChargesList(chargesList.filter((_, idx) => idx !== i)); }
  function updateCharge(i: number, field: "type" | "montant", value: string) {
    const c = [...chargesList];
    if (field === "montant") c[i].montant = parseInt(value) || 0;
    else c[i].type = value;
    setChargesList(c);
  }

  async function handleSubmit(formData: FormData) {
    formData.set("chargesLocatives", JSON.stringify(chargesList));
    const result = await modifierBail(bail.id, formData);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success("Contrat modifié");
    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return <Button variant="outline" size="sm" onClick={() => setEditing(true)}>✏️ Modifier le contrat</Button>;
  }

  return (
    <form action={handleSubmit} className="space-y-4 border rounded-xl p-4 bg-muted/30">
      <p className="text-sm font-medium">Modifier les termes du contrat</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-1"><Label className="text-xs">Début</Label><Input name="dateDebut" type="date" defaultValue={new Date(bail.dateDebut).toISOString().slice(0, 10)} /></div>
        <div className="space-y-1"><Label className="text-xs">Fin</Label><Input name="dateFin" type="date" defaultValue={new Date(bail.dateFin).toISOString().slice(0, 10)} /></div>
        <div className="space-y-1"><Label className="text-xs">{isMeuble ? "Loyer journalier (FCFA)" : "Loyer (FCFA)"}</Label><Input name="montantLoyer" type="number" defaultValue={bail.montantLoyer} /></div>
        <div className="space-y-1"><Label className="text-xs">Caution (FCFA)</Label><Input name="montantCaution" type="number" defaultValue={bail.montantCaution} /></div>
        {!isMeuble && (
        <div className="space-y-1">
          <Label className="text-xs">Renouvellement auto</Label>
          <select name="renouvellementAuto" defaultValue={bail.renouvellementAuto ? "true" : "false"} className="w-full border rounded-md p-2 text-sm bg-card">
            <option value="true">Oui</option><option value="false">Non</option>
          </select>
        </div>
        )}
        {!isMeuble ? (
        <div className="space-y-1">
          <Label className="text-xs">Périodicité</Label>
          <select name="periodicite" defaultValue={bail.periodicite} className="w-full border rounded-md p-2 text-sm bg-card">
            <option value="JOURNALIER">Journalier</option>
            <option value="MENSUEL">Mensuel</option>
            <option value="TRIMESTRIEL">Trimestriel (3 mois)</option>
            <option value="SEMESTRIEL">Semestriel (6 mois)</option>
            <option value="ANNUEL">Annuel (12 mois)</option>
          </select>
        </div>
        ) : (
          <input type="hidden" name="periodicite" value="JOURNALIER" />
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Charges locatives</Label>
          <Button type="button" variant="outline" size="sm" onClick={addCharge}>+ Charge</Button>
        </div>
        {chargesList.map((c, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input value={c.type} onChange={(e) => updateCharge(i, "type", e.target.value)} placeholder="Type" className="flex-1" />
            <Input value={c.montant} onChange={(e) => updateCharge(i, "montant", e.target.value)} type="number" placeholder="Montant" className="w-32" />
            <Button type="button" variant="ghost" size="sm" onClick={() => removeCharge(i)}>✕</Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">Enregistrer</Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>Annuler</Button>
      </div>
    </form>
  );
}
