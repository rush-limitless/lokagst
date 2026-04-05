import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/appartements", label: "Appartements", icon: "🏠" },
  { href: "/locataires", label: "Locataires", icon: "👤" },
  { href: "/baux", label: "Contrats", icon: "📄" },
  { href: "/paiements", label: "Paiements", icon: "💰" },
  { href: "/emails", label: "Emails", icon: "📧" },
];

export default async function GestionnaireLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "GESTIONNAIRE") redirect("/login");

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-blue-950 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-blue-900">
          <h1 className="text-xl font-bold">LokaGest</h1>
          <p className="text-blue-300 text-sm">FINSTAR</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-900 transition-colors text-sm">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-900">
          <p className="text-sm text-blue-300 mb-2">{session.user.email}</p>
          <LogoutButton className="w-full text-white border-blue-700 hover:bg-blue-900" />
        </div>
      </aside>
      <main className="flex-1 bg-gray-50">
        <header className="bg-white border-b px-6 py-4 md:hidden flex items-center justify-between">
          <h1 className="text-lg font-bold text-blue-950">LokaGest</h1>
          <nav className="flex gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-lg" title={item.label}>{item.icon}</Link>
            ))}
          </nav>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
