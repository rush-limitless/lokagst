"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type DataPoint = { mois: string; revenus: number; impayes: number };

export function RevenusImpayesChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="mois" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value) => `${Number(value).toLocaleString("fr-FR")} FCFA`} />
        <Legend />
        <Bar dataKey="revenus" name="Revenus" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
        <Bar dataKey="impayes" name="Impayés" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
