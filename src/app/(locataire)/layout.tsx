import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LangToggle } from "@/components/lang-toggle";
import { LocataireNav } from "@/components/locataire-nav";

export default async function LocataireLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "LOCATAIRE") redirect("/login");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-card border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="" width={32} height={32} className="w-8 h-8 rounded" />
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
        <LocataireNav />
      </header>
      <main className="p-4 max-w-3xl mx-auto">{children}</main>
    </div>
  );
}
