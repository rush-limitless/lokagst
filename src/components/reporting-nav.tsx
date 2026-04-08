"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/finances", label: "📊 Synthèse", exact: true },
  { href: "/reporting", label: "📥 Export", exact: true },
  { href: "/reporting/impayes", label: "🔴 Impayés" },
  { href: "/reporting/cautions", label: "🔒 Cautions" },
  { href: "/reporting/classement", label: "🏆 Classement" },
  { href: "/reporting/rentabilite", label: "💹 Rentabilité" },
  { href: "/reporting/comparaison", label: "🔄 Comparaison" },
];

export function ReportingNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {tabs.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={cn("text-xs px-3 py-1.5 rounded-full font-medium transition-colors", active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80")}>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
