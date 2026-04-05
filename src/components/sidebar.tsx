"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";

type NavItem = { href: string; label: string; icon: string; badge?: number };
type NavSection = { title: string; items: NavItem[] };

export function Sidebar({ email, badges }: { email: string; badges?: { messages?: number; tickets?: number } }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);

  const sections: NavSection[] = [
    { title: "Gestion", items: [
      { href: "/dashboard", label: t.dashboard, icon: "📊" },
      { href: "/appartements", label: t.appartements, icon: "🏠" },
      { href: "/locataires", label: t.locataires, icon: "👤" },
      { href: "/baux", label: t.contrats, icon: "📄" },
      { href: "/immeubles", label: t.immeubles, icon: "🏢" },
    ]},
    { title: "Finance", items: [
      { href: "/paiements", label: t.paiements, icon: "💰" },
      { href: "/exports", label: t.exports, icon: "📥" },
    ]},
    { title: "Communication", items: [
      { href: "/maintenance", label: t.maintenance, icon: "🔧", badge: badges?.tickets },
      { href: "/messagerie", label: t.messagerie, icon: "💬", badge: badges?.messages },
      { href: "/emails", label: t.emails, icon: "📧" },
    ]},
    { title: "Admin", items: [
      { href: "/audit", label: t.audit, icon: "📝" },
    ]},
  ];

  return (
    <aside className={cn("bg-gradient-to-b from-[#1e3a5f] to-[#152d4a] text-white flex-shrink-0 hidden md:flex flex-col transition-all duration-300", collapsed ? "w-16" : "w-64")}>
      <div className={cn("p-4 border-b border-white/10 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && <div><h1 className="text-lg font-bold tracking-tight">ImmoGest</h1><p className="text-blue-300 text-xs">IMMOSTAR SCI</p></div>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-blue-300 hover:text-white text-sm">{collapsed ? "→" : "←"}</button>
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="mb-2">
            {!collapsed && <p className="px-4 py-1 text-[10px] uppercase tracking-wider text-blue-400/60 font-semibold">{section.title}</p>}
            {section.items.map((item) => (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 mx-2 px-3 py-2 rounded-lg transition-all text-sm relative", collapsed && "justify-center px-2", pathname.startsWith(item.href) ? "bg-white/15 text-white font-medium shadow-sm" : "hover:bg-white/10 text-blue-100/80")}>
                <span className="text-base">{item.icon}</span>
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && item.badge && item.badge > 0 ? <span className="bg-amber-500 text-[10px] text-white rounded-full w-5 h-5 flex items-center justify-center font-bold">{item.badge}</span> : null}
                {collapsed && item.badge && item.badge > 0 ? <span className="absolute -top-1 -right-1 bg-amber-500 text-[8px] text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">{item.badge}</span> : null}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className={cn("p-3 border-t border-white/10", collapsed && "text-center")}>
        {!collapsed && <p className="text-xs text-blue-300/70 truncate">{email}</p>}
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const items = [
    { href: "/dashboard", icon: "📊" },
    { href: "/appartements", icon: "🏠" },
    { href: "/locataires", icon: "👤" },
    { href: "/baux", icon: "📄" },
    { href: "/paiements", icon: "💰" },
    { href: "/maintenance", icon: "🔧" },
    { href: "/messagerie", icon: "💬" },
  ];

  return (
    <header className="bg-[#1e3a5f] text-white px-4 py-3 md:hidden">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-bold">ImmoGest</h1>
      </div>
      <nav className="flex gap-1 overflow-x-auto pb-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={cn("text-lg px-2 py-1 rounded", pathname.startsWith(item.href) ? "bg-white/20" : "opacity-50")}>
            {item.icon}
          </Link>
        ))}
      </nav>
    </header>
  );
}
