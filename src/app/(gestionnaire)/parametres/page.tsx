"use client";

import { changerMotDePasse } from "@/actions/password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import Link from "next/link";

function GestionnaireManager() {
  const [gestionnaires, setGestionnaires] = useState<any[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newMdp, setNewMdp] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editMdp, setEditMdp] = useState("");

  useEffect(() => {
    fetch("/api/gestionnaires").then((r) => {
      if (r.ok) { setIsSuperAdmin(true); r.json().then(setGestionnaires); }
    });
  }, []);

  if (!isSuperAdmin) return null;

  async function handleAdd() {
    if (!newEmail || !newMdp) { toast.error("Email et mot de passe requis"); return; }
    const res = await fetch("/api/gestionnaires", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: newEmail, motDePasse: newMdp }) });
    const data = await res.json();
    if (data.error) { toast.error(data.error); return; }
    toast.success("Gestionnaire ajouté");
    setNewEmail(""); setNewMdp("");
    fetch("/api/gestionnaires").then((r) => r.json()).then(setGestionnaires);
  }

  async function handleUpdate() {
    if (!editId) return;
    const res = await fetch("/api/gestionnaires", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editId, email: editEmail, motDePasse: editMdp || undefined }) });
    const data = await res.json();
    if (data.error) { toast.error(data.error); return; }
    toast.success("Gestionnaire modifié"); setEditId(null);
    fetch("/api/gestionnaires").then((r) => r.json()).then(setGestionnaires);
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Supprimer le gestionnaire ${email} ?`)) return;
    await fetch("/api/gestionnaires", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    toast.success("Gestionnaire supprimé");
    fetch("/api/gestionnaires").then((r) => r.json()).then(setGestionnaires);
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">👥 Gestion des gestionnaires (Super Admin)</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {gestionnaires.map((g) => (
          <div key={g.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            {editId === g.id ? (
              <>
                <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="flex-1 h-8 text-sm" />
                <Input type="password" value={editMdp} onChange={(e) => setEditMdp(e.target.value)} placeholder="Nouveau mdp (optionnel)" className="w-40 h-8 text-sm" />
                <Button size="sm" onClick={handleUpdate}>✓</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>✕</Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium">{g.email}</span>
                <Button size="sm" variant="outline" onClick={() => { setEditId(g.id); setEditEmail(g.email); setEditMdp(""); }}>✏️</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(g.id, g.email)}>🗑️</Button>
              </>
            )}
          </div>
        ))}
        {gestionnaires.length === 0 && <p className="text-sm text-muted-foreground">Aucun gestionnaire</p>}
        <div className="flex gap-2 pt-2 border-t">
          <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@immostar.cm" className="flex-1 h-8 text-sm" />
          <Input type="password" value={newMdp} onChange={(e) => setNewMdp(e.target.value)} placeholder="Mot de passe" className="w-36 h-8 text-sm" />
          <Button size="sm" onClick={handleAdd}>+ Ajouter</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ParametresPage() {
  const [ancien, setAncien] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmer, setConfirmer] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (nouveau !== confirmer) { toast.error("Les mots de passe ne correspondent pas"); return; }
    const result = await changerMotDePasse(ancien, nouveau);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success("Mot de passe changé !");
    setAncien(""); setNouveau(""); setConfirmer("");
  }

  return (
    <div className="space-y-6 animate-in">
      <h1 className="text-xl font-bold text-foreground">Paramètres</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/audit" className="block">
          <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 h-full">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">📝</div>
              <h3 className="font-medium text-foreground">Journal d&apos;audit</h3>
              <p className="text-xs text-muted-foreground mt-1">Historique des actions</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/emails" className="block">
          <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 h-full">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">📧</div>
              <h3 className="font-medium text-foreground">Emails envoyés</h3>
              <p className="text-xs text-muted-foreground mt-1">Historique des emails</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <GestionnaireManager />

      <Card className="max-w-lg">
        <CardHeader><CardTitle className="text-sm">Changer le mot de passe</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Ancien mot de passe</Label><Input type="password" value={ancien} onChange={(e) => setAncien(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Nouveau mot de passe</Label><Input type="password" value={nouveau} onChange={(e) => setNouveau(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Confirmer</Label><Input type="password" value={confirmer} onChange={(e) => setConfirmer(e.target.value)} required /></div>
            <Button type="submit">Changer le mot de passe</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
