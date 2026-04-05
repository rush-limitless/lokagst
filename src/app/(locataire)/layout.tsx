import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export default async function LocataireLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "LOCATAIRE") redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-950 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">ImmoGest</h1>
          <p className="text-blue-300 text-xs">Mon espace locataire</p>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/mon-espace" className="text-sm hover:text-blue-300">Accueil</Link>
          <Link href="/mon-espace/bail" className="text-sm hover:text-blue-300">Mon bail</Link>
          <Link href="/mon-espace/paiements" className="text-sm hover:text-blue-300">Mes paiements</Link>
          <Link href="/mon-espace/maintenance" className="text-sm hover:text-blue-300">🔧 Maintenance</Link>
          <Link href="/mon-espace/messagerie" className="text-sm hover:text-blue-300">💬 Messages</Link>
          <LogoutButton className="text-white border-blue-700 hover:bg-blue-900" />
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
