"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, Download, AlertCircle, Shield, Trophy, TrendingUp, ArrowLeftRight } from "lucide-react";

const tabs = [
  { href: "/finances", label: "Synthèse", icon: <BarChart3 className="w-3.5 h-3.5" />, exact: true },
  { href: "/reporting", label: "Export", icon: <Download className="w-3.5 h-3.5" />, exact: true },
  { href: "/reporting/impayes", label: "Impayés", icon: <AlertCircle className="w-3.5 h-3.5" /> },
  { href: "/reporting/cautions", label: "Cautions", icon: <Shield className="w-3.5 h-3.5" /> },
  { href: "/reporting/classement", label: "Classement", icon: <Trophy className="w-3.5 h-3.5" /> },
  { href: "/reporting/rentabilite", label: "Rentabilité", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { href: "/reporting/comparaison", label: "Comparaison", icon: <ArrowLeftRight className="w-3.5 h-3.5" /> },
];

export function ReportingNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {tabs.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-colors", active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80")}>
            {t.icon}{t.label}
          </Link>
        );
      })}
    </div>
  );
}
