"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ConfirmDialog({ trigger, title, description, onConfirm, variant = "destructive" }: {
  trigger: React.ReactNode; title: string; description: string; onConfirm: () => void | Promise<void>; variant?: "destructive" | "default";
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      {open && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card text-foreground rounded-xl p-6 w-full max-w-md shadow-xl border">
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-6">{description}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Annuler</Button>
              <Button variant={variant} onClick={handleConfirm} disabled={loading}>{loading ? "..." : "Confirmer"}</Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
