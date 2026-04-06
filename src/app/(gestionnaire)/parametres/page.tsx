"use client";

import { changerMotDePasse } from "@/actions/password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";

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

      {/* Raccourcis admin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/immeubles" className="block">
          <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 h-full">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl mb-2">🏢</div>
              <h3 className="font-medium text-foreground">Immeubles</h3>
              <p className="text-xs text-muted-foreground mt-1">Gérer les immeubles et voir les appartements</p>
            </CardContent>
          </Card>
        </Link>
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

      {/* Changer mot de passe */}
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
