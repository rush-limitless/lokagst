"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type AuditLog = {
  id: string; utilisateur: string; action: string; entite: string;
  entiteId: string | null; details: string | null; creeLe: string;
  icon: string; color: string;
};

export function AuditDetailRow({ log }: { log: AuditLog }) {
  const [open, setOpen] = useState(false);
  const date = new Date(log.creeLe);
  const dateStr = date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const timeStr = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-card border rounded-lg overflow-hidden hover:shadow-sm transition-all">
      <button onClick={() => setOpen(!open)} className="w-full text-left p-3 flex items-center gap-3">
        <span className="text-lg">{log.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("font-medium text-sm", log.color)}>{log.action}</span>
            <span className="text-xs text-muted-foreground">sur</span>
            <span className="text-sm font-medium text-foreground">{log.entite}</span>
            {log.entiteId && <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">{log.entiteId.slice(0, 12)}</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">par {log.utilisateur} · {dateStr} à {timeStr}</p>
        </div>
        <span className={cn("text-muted-foreground text-xs transition-transform", open && "rotate-180")}>▼</span>
      </button>
      {open && (
        <div className="px-3 pb-3 pt-0 border-t bg-muted/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 text-sm">
            <div><span className="text-muted-foreground text-xs block">Utilisateur</span><span className="font-medium">{log.utilisateur}</span></div>
            <div><span className="text-muted-foreground text-xs block">Action</span><span className={cn("font-medium", log.color)}>{log.action}</span></div>
            <div><span className="text-muted-foreground text-xs block">Entité</span><span className="font-medium">{log.entite}</span></div>
            <div><span className="text-muted-foreground text-xs block">Date & Heure</span><span className="font-medium">{dateStr} à {timeStr}</span></div>
          </div>
          {log.entiteId && (
            <div className="py-2 text-sm"><span className="text-muted-foreground text-xs block">Identifiant</span><span className="font-mono text-xs bg-muted px-2 py-1 rounded">{log.entiteId}</span></div>
          )}
          <div className="py-2 text-sm">
            <span className="text-muted-foreground text-xs block">Détails</span>
            <p className="mt-1 text-foreground whitespace-pre-wrap">{log.details || "Aucun détail supplémentaire enregistré pour cette action."}</p>
          </div>
        </div>
      )}
    </div>
  );
}
