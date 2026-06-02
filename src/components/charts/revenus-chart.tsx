"use client";

import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

type DataPoint = { mois: string; revenus: number; attendus: number };

export function RevenusChart({ data }: { data: DataPoint[] }) {
  const [period, setPeriod] = useState<"all" | "30" | "7">("all");
  const { t } = useI18n();

  const filtered = period === "7" ? data.slice(-2) : period === "30" ? data.slice(-3) : data;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-foreground">{t.chart_evolutionRevenus}</p>
          <p className="text-xs text-muted-foreground">{t.chart_totalPeriode}</p>
        </div>
        <div className="flex border rounded-lg overflow-hidden text-xs">
          <button onClick={() => setPeriod("all")} className={`px-3 py-1.5 transition-colors ${period === "all" ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:bg-muted"}`}>{t.chart_6mois}</button>
          <button onClick={() => setPeriod("30")} className={`px-3 py-1.5 transition-colors border-x ${period === "30" ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:bg-muted"}`}>{t.chart_3mois}</button>
          <button onClick={() => setPeriod("7")} className={`px-3 py-1.5 transition-colors ${period === "7" ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:bg-muted"}`}>{t.chart_1mois}</button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={filtered} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradAttendus" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#29ABE2" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#29ABE2" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradRevenus" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} dy={10} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", fontSize: 12 }}
            formatter={(value) => `${Number(value).toLocaleString("fr-FR")} FCFA`}
          />
          <Area type="monotone" dataKey="attendus" name="Attendus" stroke="#29ABE2" strokeWidth={1.5} fill="url(#gradAttendus)" fillOpacity={1} />
          <Area type="monotone" dataKey="revenus" name="Encaissés" stroke="#10b981" strokeWidth={2} fill="url(#gradRevenus)" fillOpacity={1} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
