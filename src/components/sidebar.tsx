"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, Building2, Home, Users, ClipboardList, FileText,
  TrendingUp, Receipt, Wallet, CalendarDays,
  Wrench, MessageCircle, Settings, ChevronLeft, ChevronRight,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: ReactNode; badge?: number };
type NavSection = { title: string; items: NavItem[] };

const iconClass = "w-[18px] h-[18px] stroke-[1.8]";

export function Sidebar({ email, badges }: { email: string; badges?: { messages?: number; tickets?: number } }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);

  const sections: NavSection[] = [
    { title: "Principal", items: [
      { href: "/dashboard", label: t.dashboard, icon: <LayoutDashboard className={iconClass} /> },
      { href: "/immeubles", label: t.immeubles, icon: <Building2 className={iconClass} /> },
      { href: "/appartements", label: t.appartements, icon: <Home className={iconClass} /> },
      { href: "/locataires", label: t.locataires, icon: <Users className={iconClass} /> },
      { href: "/situation", label: "Situation", icon: <ClipboardList className={iconClass} /> },
      { href: "/baux", label: t.contrats, icon: <FileText className={iconClass} /> },
    ]},
    { title: "Finance", items: [
      { href: "/finances", label: "Finances", icon: <TrendingUp className={iconClass} /> },
      { href: "/depenses", label: "Dépenses", icon: <Receipt className={iconClass} /> },
      { href: "/paiements", label: t.paiements, icon: <Wallet className={iconClass} /> },
      { href: "/calendrier", label: "Calendrier", icon: <CalendarDays className={iconClass} /> },
    ]},
    { title: "Communication", items: [
      { href: "/maintenance", label: t.maintenance, icon: <Wrench className={iconClass} />, badge: badges?.tickets },
      { href: "/messagerie", label: t.messagerie, icon: <MessageCircle className={iconClass} />, badge: badges?.messages },
    ]},
    { title: "Admin", items: [
      { href: "/parametres", label: "Paramètres", icon: <Settings className={iconClass} /> },
    ]},
  ];

  const isActive = (href: string) => {
    if (href === "/locataires") return pathname.startsWith("/locataires");
    if (href === "/paiements") return pathname.startsWith("/paiements");
    if (href === "/finances") return pathname.startsWith("/finances") || pathname.startsWith("/reporting");
    if (href === "/messagerie") return pathname.startsWith("/messagerie") || pathname.startsWith("/emails");
    if (href === "/parametres") return pathname.startsWith("/parametres") || pathname.startsWith("/audit");
    return pathname.startsWith(href);
  };

  return (
    <aside className={cn("bg-gradient-to-b from-[#0d3b5e] to-[#0a2d47] text-white flex-shrink-0 hidden md:flex flex-col transition-all duration-300 sticky top-0 h-screen", collapsed ? "w-16" : "w-60")}>
      <div className={cn("p-4 border-b border-white/10 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="IMMOSTAR SCI" className="w-8 h-8 rounded" />
            <div>
              <h1 className="text-sm font-bold tracking-tight">ImmoGest</h1>
              <p className="text-[10px] text-sky-300">IMMOSTAR SCI</p>
            </div>
          </div>
        )}
        {collapsed && <img src="/logo.jpg" alt="" className="w-8 h-8 rounded" />}
        <button onClick={() => setCollapsed(!collapsed)} className="text-sky-300 hover:text-white transition-colors">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      <nav className="flex-1 py-3 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="mb-1">
            {!collapsed && <p className="px-4 py-1 text-[9px] uppercase tracking-wider text-sky-400/40 font-semibold">{section.title}</p>}
            {section.items.map((item) => (
              <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 mx-2 px-3 py-2 rounded-lg transition-all text-sm relative", collapsed && "justify-center px-2", isActive(item.href) ? "bg-sky-500/20 text-white font-medium nav-active-indicator" : "hover:bg-white/5 text-sky-100/70")}>
                <span className="flex-shrink-0">{item.icon}</span>
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
    { href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/immeubles", icon: <Building2 className="w-5 h-5" /> },
    { href: "/appartements", icon: <Home className="w-5 h-5" /> },
    { href: "/locataires", icon: <Users className="w-5 h-5" /> },
    { href: "/baux", icon: <FileText className="w-5 h-5" /> },
    { href: "/finances", icon: <TrendingUp className="w-5 h-5" /> },
    { href: "/paiements", icon: <Wallet className="w-5 h-5" /> },
    { href: "/calendrier", icon: <CalendarDays className="w-5 h-5" /> },
    { href: "/maintenance", icon: <Wrench className="w-5 h-5" /> },
    { href: "/messagerie", icon: <MessageCircle className="w-5 h-5" /> },
  ];

  return (
    <header className="bg-[#0d3b5e] text-white px-4 py-3 md:hidden">
      <div className="flex items-center gap-2 mb-2">
        <img src="/logo.jpg" alt="" className="w-8 h-8 rounded" />
        <h1 className="text-lg font-bold">ImmoGest</h1>
      </div>
      <nav className="flex gap-1 overflow-x-auto pb-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={cn("px-2.5 py-1.5 rounded-lg transition-colors", pathname.startsWith(item.href) ? "bg-sky-500/20 text-white" : "text-sky-100/40")}>
            {item.icon}
          </Link>
        ))}
      </nav>
    </header>
  );
}
