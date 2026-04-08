"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type DataPoint = { mois: string; loyers: number; charges: number; cautions: number; attendu: number };

export function FinancesBarChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value) => `${Number(value).toLocaleString("fr-FR")} FCFA`} />
        <Legend />
        <Bar dataKey="loyers" name="Loyers" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="charges" name="Charges" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        <Bar dataKey="cautions" name="Cautions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ImpayesChart({ data }: { data: { mois: string; attendu: number; total: number; impaye: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="mois" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(value) => `${Number(value).toLocaleString("fr-FR")} FCFA`} />
        <Legend />
        <Bar dataKey="total" name="Encaissé" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="impaye" name="Impayé" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
