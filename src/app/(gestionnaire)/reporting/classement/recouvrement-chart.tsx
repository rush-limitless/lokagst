"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type DataPoint = { etage: string; taux: number; attendu: number; regle: number };

function getColor(taux: number) {
  if (taux >= 90) return "#10b981";
  if (taux >= 70) return "#f59e0b";
  if (taux >= 50) return "#f97316";
  return "#ef4444";
}

export function RecouvrementChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
        <YAxis type="category" dataKey="etage" tick={{ fontSize: 12 }} width={80} />
        <Tooltip formatter={(value: number) => `${value}%`} />
        <Bar dataKey="taux" name="Taux de recouvrement" radius={[0, 6, 6, 0]} barSize={30}>
          {data.map((entry, i) => <Cell key={i} fill={getColor(entry.taux)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
