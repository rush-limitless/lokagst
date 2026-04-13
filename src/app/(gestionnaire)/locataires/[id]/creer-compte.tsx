"use client";

import { creerCompteLocataire } from "@/actions/locataires";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreerCompteButton({ locataireId, email }: { locataireId: string; email?: string | null }) {
  const [step, setStep] = useState<"idle" | "form" | "result">("idle");
  const [emailInput, setEmailInput] = useState(email || "");
  const [result, setResult] = useState<{ email: string; mdp: string } | null>(null);
  const [sending, setSending] = useState(false);
  const router = useRouter();

  async function handleCreate() {
    if (!emailInput) { toast.error("Email requis"); return; }
    const res = await creerCompteLocataire(locataireId, emailInput);
    if ("error" in res) { toast.error(res.error as string); return; }
    setResult({ email: emailInput, mdp: res.mdpDefaut || "locataire123" });
    setStep("result");
    router.refresh();
  }

  async function handleSendEmail() {
    if (!result) return;
    setSending(true);
    try {
      await fetch("/api/send-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: result.email, mdp: result.mdp }),
      });
      toast.success("Email envoyé au locataire !");
    } catch {
      toast.error("Erreur lors de l'envoi");
    }
    setSending(false);
  }

  if (step === "idle") return <Button variant="outline" size="sm" onClick={() => setStep("form")}>🔑 Créer un compte</Button>;

  if (step === "result" && result) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setStep("idle")}>
        <div className="bg-card rounded-xl p-6 max-w-sm w-full shadow-xl border space-y-4" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-bold text-foreground">✅ Compte créé</h3>
          <div className="space-y-3 bg-muted/50 rounded-lg p-4">
            <div>
              <p className="text-xs text-muted-foreground">Adresse email</p>
              <p className="font-mono text-sm font-medium text-foreground">{result.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mot de passe</p>
              <p className="font-mono text-sm font-medium text-foreground">{result.mdp}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Le locataire peut se connecter sur le portail avec ces identifiants.</p>
          <div className="flex gap-2">
            <Button onClick={handleSendEmail} disabled={sending} className="flex-1">
              {sending ? "Envoi..." : "📧 Envoyer par email"}
            </Button>
            <Button variant="outline" onClick={() => setStep("idle")}>Fermer</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <Input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="email@..." className="w-48 h-8 text-sm" />
      <Button size="sm" onClick={handleCreate}>Créer</Button>
      <Button size="sm" variant="ghost" onClick={() => setStep("idle")}>✕</Button>
    </div>
  );
}
