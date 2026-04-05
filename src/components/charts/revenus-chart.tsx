"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type DataPoint = { mois: string; revenus: number; attendus: number };

export function RevenusChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorAttendus" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#93c5fd" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value) => `${Number(value).toLocaleString("fr-FR")} FCFA`} />
        <Area type="monotone" dataKey="attendus" name="Attendus" stroke="#93c5fd" fill="url(#colorAttendus)" strokeWidth={2} />
        <Area type="monotone" dataKey="revenus" name="Encaissés" stroke="#10b981" fill="url(#colorRevenus)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
