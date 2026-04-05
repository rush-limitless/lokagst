"use client";

import { creerCompteLocataire } from "@/actions/locataires";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreerCompteButton({ locataireId, email }: { locataireId: string; email?: string | null }) {
  const [open, setOpen] = useState(false);
  const [emailInput, setEmailInput] = useState(email || "");
  const router = useRouter();

  async function handleCreate() {
    if (!emailInput) { toast.error("Email requis"); return; }
    const result = await creerCompteLocataire(locataireId, emailInput);
    if ("error" in result) { toast.error(result.error as string); return; }
    toast.success(`Compte créé ! Mot de passe par défaut : ${result.mdpDefaut}`);
    setOpen(false);
    router.refresh();
  }

  if (!open) return <Button variant="outline" size="sm" onClick={() => setOpen(true)}>🔑 Créer un compte</Button>;

  return (
    <div className="flex gap-2 items-center">
      <Input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="email@..." className="w-48 h-8 text-sm" />
      <Button size="sm" onClick={handleCreate}>Créer</Button>
      <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>✕</Button>
    </div>
  );
}
