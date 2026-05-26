"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Ignorer si on est dans un input/textarea/select
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case "n": e.preventDefault(); router.push("/paiements/nouveau"); break;
        case "s": e.preventDefault(); router.push("/situation"); break;
        case "l": e.preventDefault(); router.push("/locataires"); break;
        case "d": e.preventDefault(); router.push("/dashboard"); break;
        case "f": e.preventDefault(); router.push("/finances"); break;
        case "a": e.preventDefault(); router.push("/appartements"); break;
        case "?": e.preventDefault(); document.getElementById("shortcuts-help")?.classList.toggle("hidden"); break;
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [router]);

  return (
    <div id="shortcuts-help" className="hidden fixed bottom-4 right-4 z-40 bg-card border rounded-xl shadow-lg p-4 text-xs space-y-1.5 max-w-[200px]">
      <p className="font-semibold text-foreground mb-2">Raccourcis clavier</p>
      <div className="flex justify-between"><span className="text-muted-foreground">Nouveau paiement</span><kbd className="bg-muted px-1.5 py-0.5 rounded">N</kbd></div>
      <div className="flex justify-between"><span className="text-muted-foreground">Situation</span><kbd className="bg-muted px-1.5 py-0.5 rounded">S</kbd></div>
      <div className="flex justify-between"><span className="text-muted-foreground">Locataires</span><kbd className="bg-muted px-1.5 py-0.5 rounded">L</kbd></div>
      <div className="flex justify-between"><span className="text-muted-foreground">Dashboard</span><kbd className="bg-muted px-1.5 py-0.5 rounded">D</kbd></div>
      <div className="flex justify-between"><span className="text-muted-foreground">Finances</span><kbd className="bg-muted px-1.5 py-0.5 rounded">F</kbd></div>
      <div className="flex justify-between"><span className="text-muted-foreground">Appartements</span><kbd className="bg-muted px-1.5 py-0.5 rounded">A</kbd></div>
      <div className="flex justify-between"><span className="text-muted-foreground">Aide</span><kbd className="bg-muted px-1.5 py-0.5 rounded">?</kbd></div>
    </div>
  );
}
