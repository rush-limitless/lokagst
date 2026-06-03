"use client";

import { AnimatedCounter } from "@/components/animated-counter";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Sparkline } from "@/components/sparkline";

export function AnimatedStatCard({ icon, iconBg, label, value, suffix = "", sub, trend, trendUp, sparkData, sparkColor }: {
  icon: React.ReactNode; iconBg: string; label: string; value: number; suffix?: string; sub?: string; trend?: string; trendUp?: boolean; sparkData?: number[]; sparkColor?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-all hover:-translate-y-0.5">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
          {trend && (
            <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-md ${trendUp ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"}`}>
              {trendUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {trend}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              <AnimatedCounter value={value} suffix={suffix} />
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
          </div>
          {sparkData && sparkData.length > 1 && <Sparkline data={sparkData} color={sparkColor || "#10b981"} />}
        </div>
        {sub && <p className="text-[10px] text-muted-foreground mt-1.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}
