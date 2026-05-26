"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function Tabs({ tabs, defaultTab }: { tabs: { id: string; label: string; icon: string; content: React.ReactNode; badge?: number }[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  return (
    <div>
      <div className="flex gap-1 border-b overflow-x-auto pb-px">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActive(t.id)} className={cn("flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px", active === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {t.badge !== undefined && t.badge > 0 && (
              <span className="ml-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{t.badge}</span>
            )}
          </button>
        ))}
      </div>
      <div className="pt-6">
        {tabs.find((t) => t.id === active)?.content}
      </div>
    </div>
  );
}
