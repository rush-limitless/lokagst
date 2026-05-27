"use client";

import dynamic from "next/dynamic";

export const FinancesBarChart = dynamic(
  () => import("@/components/charts/finances-charts").then(m => m.FinancesBarChart),
  { ssr: false, loading: () => <div className="h-64 bg-muted animate-pulse rounded" /> }
);

export const ImpayesChart = dynamic(
  () => import("@/components/charts/finances-charts").then(m => m.ImpayesChart),
  { ssr: false, loading: () => <div className="h-64 bg-muted animate-pulse rounded" /> }
);
