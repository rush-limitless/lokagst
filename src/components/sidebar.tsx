"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/appartements", label: "Appartements", icon: "🏠" },
  { href: "/locataires", label: "Locataires", icon: "👤" },
  { href: "/baux", label: "Contrats", icon: "📄" },
  { href: "/paiements", label: "Paiements", icon: "💰" },
  { href: "/maintenance", label: "Maintenance", icon: "🔧" },
  { href: "/messagerie", label: "Messagerie", icon: "💬" },
  { href: "/exports", label: "Exports", icon: "📥" },
  { href: "/immeubles", label: "Immeubles", icon: "🏢" },
  { href: "/audit", label: "Audit", icon: "📝" },
  { href: "/emails", label: "Emails", icon: "📧" },
];

export function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-blue-950 text-white flex-shrink-0 hidden md:flex flex-col">
      <div className="p-6 border-b border-blue-900">
        <h1 className="text-xl font-bold">LokaGest</h1>
        <p className="text-blue-300 text-sm">IMMOSTAR SCI</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
              pathname.startsWith(item.href) ? "bg-blue-800 text-white font-medium" : "hover:bg-blue-900 text-blue-100"
            )}
          >
            <span>{item.icon}</span>{item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-blue-900">
        <p className="text-sm text-blue-300 mb-2">{email}</p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b px-6 py-4 md:hidden flex items-center justify-between">
      <h1 className="text-lg font-bold text-blue-950">LokaGest</h1>
      <nav className="flex gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn("text-lg", pathname.startsWith(item.href) ? "opacity-100" : "opacity-50")}
            title={item.label}
          >
            {item.icon}
          </Link>
        ))}
      </nav>
    </header>
  );
}
