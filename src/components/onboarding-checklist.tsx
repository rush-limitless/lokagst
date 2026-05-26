"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

const STEPS = [
  { id: "immeuble", label: "Créer un immeuble", href: "/immeubles", check: "immeubles" },
  { id: "appartement", label: "Ajouter des appartements", href: "/appartements/nouveau", check: "appartements" },
  { id: "locataire", label: "Ajouter un locataire", href: "/locataires/nouveau", check: "locataires" },
  { id: "bail", label: "Créer un bail", href: "/baux/nouveau", check: "baux" },
  { id: "paiement", label: "Enregistrer un paiement", href: "/paiements/nouveau", check: "paiements" },
];

export function OnboardingChecklist({ counts }: { counts: { immeubles: number; appartements: number; locataires: number; baux: number; paiements: number } }) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("onboarding-dismissed")) setDismissed(true);
  }, []);

  const completed = STEPS.filter((s) => counts[s.check as keyof typeof counts] > 0).length;
  if (dismissed || completed === STEPS.length) return null;

  function dismiss() {
    localStorage.setItem("onboarding-dismissed", "1");
    setDismissed(true);
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">🚀 Démarrage rapide — {completed}/{STEPS.length}</CardTitle>
          <button onClick={dismiss} className="text-[10px] text-muted-foreground hover:text-foreground">Masquer</button>
        </div>
        <div className="bg-muted rounded-full h-1.5 overflow-hidden mt-2">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(completed / STEPS.length) * 100}%` }} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {STEPS.map((step) => {
            const done = counts[step.check as keyof typeof counts] > 0;
            return (
              <Link key={step.id} href={step.href} className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors ${done ? "opacity-60" : "hover:bg-primary/10"}`}>
                {done ? <CheckCircle2 className="size-4 text-emerald-500" /> : <Circle className="size-4 text-muted-foreground" />}
                <span className={`text-sm ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>{step.label}</span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
