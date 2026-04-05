import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export default async function LocataireLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "LOCATAIRE") redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-950 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">ImmoGest</h1>
            <p className="text-blue-300 text-xs">Mon espace locataire</p>
          </div>
          <LogoutButton className="text-white border-blue-700 hover:bg-blue-900 text-xs" />
        </div>
        <nav className="flex gap-1 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
          <Link href="/mon-espace" className="text-xs bg-blue-900 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-blue-800">🏠 Accueil</Link>
          <Link href="/mon-espace/bail" className="text-xs bg-blue-900 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-blue-800">📄 Bail</Link>
          <Link href="/mon-espace/paiements" className="text-xs bg-blue-900 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-blue-800">💰 Paiements</Link>
          <Link href="/mon-espace/maintenance" className="text-xs bg-blue-900 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-blue-800">🔧 Maintenance</Link>
          <Link href="/mon-espace/messagerie" className="text-xs bg-blue-900 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-blue-800">💬 Messages</Link>
        </nav>
      </header>
      <main className="p-4 max-w-3xl mx-auto">{children}</main>
    </div>
  );
}
