"use client";

import { ExportCSVButton } from "@/components/export-csv-button";

export function ExportSituationButton({ data }: { data: { locataire: string; appartement: string; totalMensuel: number; totalDu: number; aJour: boolean }[] }) {
  return (
    <ExportCSVButton
      data={data}
      filename={`situation_${new Date().toISOString().slice(0, 10)}`}
      columns={[
        { key: "locataire", label: "Locataire" },
        { key: "appartement", label: "Appartement" },
        { key: "totalMensuel", label: "Mensuel" },
        { key: "totalDu", label: "Total dû" },
        { key: "aJour", label: "À jour" },
      ]}
    />
  );
}
