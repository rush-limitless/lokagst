import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LangToggle } from "@/components/lang-toggle";

export default async function LocataireLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "LOCATAIRE") redirect("/login");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">ImmoGest</h1>
            <p className="text-muted-foreground text-xs">Mon espace locataire</p>
          </div>
          <div className="flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
        <nav className="flex gap-1 px-4 pb-3 overflow-x-auto">
          <Link href="/mon-espace" className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-primary/20 font-medium">🏠 Accueil</Link>
          <Link href="/mon-espace/bail" className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-primary/20 font-medium">📄 Bail</Link>
          <Link href="/mon-espace/paiements" className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-primary/20 font-medium">💰 Paiements</Link>
          <Link href="/mon-espace/maintenance" className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-primary/20 font-medium">🔧 Maintenance</Link>
          <Link href="/mon-espace/messagerie" className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-primary/20 font-medium">💬 Messages</Link>
        </nav>
      </header>
      <main className="p-4 max-w-3xl mx-auto">{children}</main>
    </div>
  );
}
