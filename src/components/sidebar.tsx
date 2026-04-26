"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import {
  LayoutDashboard, Building2, Home, Users, FileText, ClipboardList,
  Wallet, TrendingUp, Calendar, Wrench, MessageSquare, Settings,
  ChevronDown, ChevronRight, Search, PanelLeftClose, PanelLeft,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: React.ReactNode; badge?: number };
type NavSection = { title: string; items: NavItem[]; defaultOpen?: boolean };

export function Sidebar({ email, badges }: { email: string; badges?: { messages?: number; tickets?: number } }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ Principal: true, Finance: true, Communication: true, Admin: true });

  const toggleSection = (title: string) => setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));

  const sections: NavSection[] = [
    { title: "Principal", defaultOpen: true, items: [
      { href: "/dashboard", label: t.dashboard, icon: <LayoutDashboard className="size-4" /> },
      { href: "/immeubles", label: "Immeubles", icon: <Building2 className="size-4" /> },
      { href: "/appartements", label: t.appartements, icon: <Home className="size-4" /> },
      { href: "/locataires", label: t.locataires, icon: <Users className="size-4" /> },
      { href: "/situation", label: "Situation", icon: <ClipboardList className="size-4" /> },
      { href: "/baux", label: t.contrats, icon: <FileText className="size-4" /> },
    ]},
    { title: "Finance", defaultOpen: true, items: [
      { href: "/finances", label: "Finances", icon: <TrendingUp className="size-4" /> },
      { href: "/paiements", label: t.paiements, icon: <Wallet className="size-4" /> },
      { href: "/calendrier", label: "Calendrier", icon: <Calendar className="size-4" /> },
    ]},
    { title: "Communication", defaultOpen: true, items: [
      { href: "/maintenance", label: t.maintenance, icon: <Wrench className="size-4" />, badge: badges?.tickets },
      { href: "/messagerie", label: t.messagerie, icon: <MessageSquare className="size-4" />, badge: badges?.messages },
    ]},
    { title: "Admin", defaultOpen: true, items: [
      { href: "/parametres", label: "Paramètres", icon: <Settings className="size-4" /> },
    ]},
  ];

  const isActive = (href: string) => {
    if (href === "/locataires") return pathname.startsWith("/locataires") || pathname.startsWith("/situation");
    if (href === "/paiements") return pathname.startsWith("/paiements") || pathname.startsWith("/calendrier");
    if (href === "/messagerie") return pathname.startsWith("/messagerie") || pathname.startsWith("/emails");
    if (href === "/parametres") return pathname.startsWith("/parametres") || pathname.startsWith("/immeubles") || pathname.startsWith("/audit");
    if (href === "/finances") return pathname.startsWith("/finances") || pathname.startsWith("/reporting");
    return pathname.startsWith(href);
  };

  const initials = email.split("@")[0].slice(0, 2).toUpperCase();

  return (
    <aside className={cn("bg-card border-r flex-shrink-0 hidden md:flex flex-col transition-all duration-300", collapsed ? "w-[60px]" : "w-[240px]")}>
      {/* Header */}
      <div className={cn("h-14 border-b flex items-center px-3", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="IMMOSTAR SCI" className="w-8 h-8 rounded-lg" />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">ImmoGest</p>
              <p className="text-[10px] text-muted-foreground">IMMOSTAR SCI</p>
            </div>
          </Link>
        )}
        {collapsed && <img src="/logo.jpg" alt="" className="w-8 h-8 rounded-lg" />}
        <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground transition-colors">
          {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 h-8 px-2.5 rounded-lg bg-muted/50 text-muted-foreground text-xs">
            <Search className="size-3.5 shrink-0" />
            <span>Rechercher...</span>
            <kbd className="ml-auto text-[10px] bg-background border rounded px-1 py-0.5">⌘K</kbd>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="mb-1">
            {!collapsed && (
              <button onClick={() => toggleSection(section.title)} className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold hover:text-muted-foreground transition-colors">
                <span>{section.title}</span>
                {openSections[section.title] ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
              </button>
            )}
            {(collapsed || openSections[section.title]) && (
              <div className="space-y-0.5 px-2">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} href={item.href} className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all relative",
                      collapsed && "justify-center px-0",
                      active
                        ? "bg-primary/10 text-primary dark:bg-primary/15"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}>
                      <span className={cn(active && "text-primary")}>{item.icon}</span>
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {!collapsed && item.badge && item.badge > 0 ? (
                        <span className="bg-primary text-primary-foreground text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold px-1">{item.badge}</span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className={cn("border-t p-3", collapsed && "flex justify-center")}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{email.split("@")[0]}</p>
              <p className="text-[10px] text-muted-foreground truncate">{email}</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{initials}</div>
        )}
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const items = [
    { href: "/dashboard", icon: <LayoutDashboard className="size-4" /> },
    { href: "/appartements", icon: <Home className="size-4" /> },
    { href: "/locataires", icon: <Users className="size-4" /> },
    { href: "/baux", icon: <FileText className="size-4" /> },
    { href: "/paiements", icon: <Wallet className="size-4" /> },
    { href: "/maintenance", icon: <Wrench className="size-4" /> },
    { href: "/messagerie", icon: <MessageSquare className="size-4" /> },
  ];

  return (
    <header className="bg-card border-b px-4 py-3 md:hidden">
      <div className="flex items-center gap-2 mb-2">
        <img src="/logo.jpg" alt="" className="w-7 h-7 rounded-lg" />
        <h1 className="text-base font-bold text-foreground">ImmoGest</h1>
      </div>
      <nav className="flex gap-1 overflow-x-auto pb-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className={cn("p-2 rounded-lg transition-colors", pathname.startsWith(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground")}>
            {item.icon}
          </Link>
        ))}
      </nav>
    </header>
  );
}
