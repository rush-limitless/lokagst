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
      { href: "/reporting", label: "Reporting", icon: "📊" },
    ]},
    { title: "Communication", items: [
      { href: "/maintenance", label: t.maintenance, icon: "🔧", badge: badges?.tickets },
      { href: "/messagerie", label: t.messagerie, icon: "💬", badge: badges?.messages },
      { href: "/emails", label: t.emails, icon: "📧" },
    ]},
    { title: "Admin", items: [
      { href: "/audit", label: t.audit, icon: "📝" },
      { href: "/parametres", label: "Paramètres", icon: "⚙️" },
    ]},
  ];

  return (
    <aside className={cn("bg-gradient-to-b from-[#0d3b5e] to-[#0a2d47] text-white flex-shrink-0 hidden md:flex flex-col transition-all duration-300", collapsed ? "w-16" : "w-64")}>
      <div className={cn("p-4 border-b border-white/10 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="IMMOSTAR SCI" className="w-9 h-9 rounded" />
            <div>
              <h1 className="text-sm font-bold tracking-tight">ImmoGest</h1>
              <p className="text-[10px] text-sky-300">IMMOSTAR SCI</p>
            </div>
          </div>
        )}
        {collapsed && <img src="/logo.jpg" alt="" className="w-8 h-8 rounded" />}
        {!collapsed && <button onClick={() => setCollapsed(true)} className="text-sky-300 hover:text-white text-xs">←</button>}
      </div>
      {collapsed && <button onClick={() => setCollapsed(false)} className="text-sky-300 hover:text-white text-xs py-2">→</button>}
      <nav className="flex-1 py-3 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="mb-2">
            {!collapsed && <p className="px-4 py-1 text-[10px] uppercase tracking-wider text-sky-400/50 font-semibold">{section.title}</p>}
            {section.items.map((item) => (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 mx-2 px-3 py-2 rounded-lg transition-all text-sm relative", collapsed && "justify-center px-2", pathname.startsWith(item.href) ? "bg-sky-500/20 text-white font-medium nav-active-indicator" : "hover:bg-white/5 text-sky-100/70")}>
                <span className="text-base">{item.icon}</span>
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && item.badge && item.badge > 0 ? <span className="bg-sky-400 text-[10px] text-white rounded-full w-5 h-5 flex items-center justify-center font-bold">{item.badge}</span> : null}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className={cn("p-3 border-t border-white/10", collapsed && "text-center")}>
        {!collapsed && <p className="text-[11px] text-sky-300/60 truncate">{email}</p>}
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const items = [
    { href: "/dashboard", icon: "📊" }, { href: "/appartements", icon: "🏠" }, { href: "/locataires", icon: "👤" },
    { href: "/baux", icon: "📄" }, { href: "/paiements", icon: "💰" }, { href: "/maintenance", icon: "🔧" }, { href: "/messagerie", icon: "💬" },
  ];

  return (
    <header className="bg-[#0d3b5e] text-white px-4 py-3 md:hidden">
      <div className="flex items-center gap-2 mb-2">
        <img src="/logo.jpg" alt="" className="w-8 h-8 rounded" />
        <h1 className="text-lg font-bold">ImmoGest</h1>
      </div>
      <nav className="flex gap-1 overflow-x-auto pb-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={cn("text-lg px-2 py-1 rounded", pathname.startsWith(item.href) ? "bg-sky-500/20" : "opacity-50")}>
            {item.icon}
          </Link>
        ))}
      </nav>
    </header>
  );
}
