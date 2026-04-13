"use client";

import { Button } from "@/components/ui/button";

export function ImprimerDettesButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => window.open("/situation/facture-dettes", "_blank")}>
      🖨️ Facture des dettes
    </Button>
  );
}
