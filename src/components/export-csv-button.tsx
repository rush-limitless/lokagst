"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ExportCSVButton({ data, filename, columns }: { data: Record<string, any>[]; filename: string; columns: { key: string; label: string }[] }) {
  function exportCSV() {
    if (!data.length) return;
    const header = columns.map((c) => c.label).join(";");
    const rows = data.map((row) => columns.map((c) => {
      const val = c.key.split(".").reduce((o, k) => o?.[k], row as any);
      return typeof val === "number" ? val : `"${String(val || "").replace(/"/g, '""')}"`;
    }).join(";"));
    const csv = "\uFEFF" + [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
      <Download className="size-3.5" /> Exporter
    </Button>
  );
}
