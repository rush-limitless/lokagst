"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Wallet, Wrench, MessageCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export function LocataireNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const links = [
    { href: "/mon-espace", label: t.nav_accueil, icon: Home, exact: true },
    { href: "/mon-espace/bail", label: t.nav_bail, icon: FileText },
    { href: "/mon-espace/paiements", label: t.nav_paiements, icon: Wallet },
    { href: "/mon-espace/maintenance", label: t.nav_maintenance, icon: Wrench },
    { href: "/mon-espace/messagerie", label: t.nav_messages, icon: MessageCircle },
    { href: "/mon-espace/parametres", label: t.nav_parametres, icon: Settings },
  ];

  return (
    <nav aria-label="Navigation locataire" className="flex gap-1 px-4 pb-3 overflow-x-auto">
      {links.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={cn(
            "text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium flex items-center gap-1.5 transition-colors",
            active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
