import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar, MobileNav } from "@/components/sidebar";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { LangToggle } from "@/components/lang-toggle";
import { CommandPalette } from "@/components/command-palette";
import { Breadcrumb } from "@/components/breadcrumb";

export default async function GestionnaireLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || !["GESTIONNAIRE", "SUPER_ADMIN"].includes(session.user.role as string)) redirect("/login");

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      <Sidebar email={session.user.email || ""} />
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <MobileNav />
        <div className="border-b bg-card px-4 py-3 md:px-6 flex items-center justify-between gap-3 flex-shrink-0">
          <CommandPalette />
          <div className="flex items-center gap-3">
          <LangToggle />
          <NotificationBell />
          <ThemeToggle />
          <LogoutButton />
          </div>
        </div>
        <div className="p-4 md:p-6 flex-1 overflow-y-auto">
          <Breadcrumb />
          {children}
        </div>
      </main>
    </div>
  );
}
