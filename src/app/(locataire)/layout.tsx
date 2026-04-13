import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LangToggle } from "@/components/lang-toggle";
import { Home, FileText, Wallet, Wrench, MessageCircle, Settings } from "lucide-react";

export default async function LocataireLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "LOCATAIRE") redirect("/login");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="" className="w-8 h-8 rounded" />
            <div>
              <h1 className="text-sm font-bold text-foreground">ImmoGest</h1>
              <p className="text-muted-foreground text-[10px]">Mon espace locataire</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
        <nav className="flex gap-1 px-4 pb-3 overflow-x-auto">
          <Link href="/mon-espace" className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-secondary/80 font-medium flex items-center gap-1.5"><Home className="w-3.5 h-3.5" /> Accueil</Link>
          <Link href="/mon-espace/bail" className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-secondary/80 font-medium flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Bail</Link>
          <Link href="/mon-espace/paiements" className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-secondary/80 font-medium flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> Paiements</Link>
          <Link href="/mon-espace/maintenance" className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-secondary/80 font-medium flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> Maintenance</Link>
          <Link href="/mon-espace/messagerie" className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-secondary/80 font-medium flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> Messages</Link>
          <Link href="/mon-espace/parametres" className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-secondary/80 font-medium flex items-center gap-1.5"><Settings className="w-3.5 h-3.5" /> Paramètres</Link>
        </nav>
      </header>
      <main className="p-4 max-w-3xl mx-auto">{children}</main>
    </div>
  );
}
