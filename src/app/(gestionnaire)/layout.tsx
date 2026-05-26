import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar, MobileNav } from "@/components/sidebar";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { LangToggle } from "@/components/lang-toggle";
import { CommandPalette } from "@/components/command-palette";
import { Breadcrumb } from "@/components/breadcrumb";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { TopLoader } from "@/components/top-loader";
import { prisma } from "@/lib/prisma";

export default async function GestionnaireLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || !["GESTIONNAIRE", "SUPER_ADMIN"].includes(session.user.role as string)) redirect("/login");

  const [messagesNonLus, ticketsOuverts, impayesCount] = await Promise.all([
    prisma.message.count({ where: { expediteur: "LOCATAIRE", lu: false } }).catch(() => 0),
    prisma.maintenance.count({ where: { statut: { in: ["SIGNALE", "EN_COURS"] } } }).catch(() => 0),
    prisma.paiement.count({ where: { valide: false } }).catch(() => 0),
  ]);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <TopLoader />
      <Sidebar email={session.user.email || ""} badges={{ messages: messagesNonLus || undefined, tickets: ticketsOuverts || undefined, impayes: impayesCount || undefined }} />
      <main className="flex-1 min-w-0">
        <MobileNav />
        <div className="border-b bg-card px-4 py-3 md:px-6 flex items-center justify-between gap-3">
          <CommandPalette />
          <div className="flex items-center gap-3">
          <LangToggle />
          <NotificationBell />
          <ThemeToggle />
          <LogoutButton />
          </div>
        </div>
        <div className="p-4 md:p-6 pb-20 md:pb-6">
          <Breadcrumb />
          {children}
        </div>
        <KeyboardShortcuts />
      </main>
    </div>
  );
}
