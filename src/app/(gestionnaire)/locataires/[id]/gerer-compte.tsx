"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function GererCompteButton({ utilisateurId, email }: { utilisateurId: string; email: string }) {
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState(email);
  const [newMdp, setNewMdp] = useState("");
  const router = useRouter();

  async function handleUpdate() {
    const res = await fetch("/api/gerer-compte", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utilisateurId, email: newEmail, motDePasse: newMdp || undefined }),
    });
    const data = await res.json();
    if (data.error) { toast.error(data.error); return; }
    toast.success("Compte modifié");
    setOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Supprimer le compte de ce locataire ? Il ne pourra plus se connecter.")) return;
    const res = await fetch("/api/gerer-compte", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utilisateurId }),
    });
    const data = await res.json();
    if (data.error) { toast.error(data.error); return; }
    toast.success("Compte supprimé");
    setOpen(false);
    router.refresh();
  }

  if (!open) return <Button variant="outline" size="sm" onClick={() => setOpen(true)}>👤 Gérer le compte</Button>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
      <div className="bg-card rounded-xl p-6 max-w-sm w-full shadow-xl border space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-foreground">Gérer le compte</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Email</label>
            <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Nouveau mot de passe (laisser vide pour ne pas changer)</label>
            <Input type="password" value={newMdp} onChange={(e) => setNewMdp(e.target.value)} placeholder="••••••" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleUpdate} className="flex-1">Enregistrer</Button>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete} className="w-full">🗑️ Supprimer le compte</Button>
      </div>
    </div>
  );
}
