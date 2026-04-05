"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type DataPoint = { mois: string; revenus: number; attendus: number };

export function RevenusChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value) => `${Number(value).toLocaleString("fr-FR")} FCFA`} />
        <Legend />
        <Bar dataKey="revenus" name="Encaissés" fill="#16a34a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="attendus" name="Attendus" fill="#dbeafe" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
