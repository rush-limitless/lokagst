import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar, MobileNav } from "@/components/sidebar";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { LangToggle } from "@/components/lang-toggle";
import { Breadcrumb } from "@/components/breadcrumb";

export default async function GestionnaireLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "GESTIONNAIRE") redirect("/login");

  return (
    <div className="min-h-screen flex">
      <Sidebar email={session.user.email || ""} />
      <main className="flex-1 bg-gray-50 min-w-0">
        <MobileNav />
        <div className="p-3 md:p-6">
          <div className="flex justify-end mb-2 gap-2 items-center flex-wrap">
            <LangToggle />
            <NotificationBell />
            <ThemeToggle />
            <LogoutButton className="text-gray-500 border-gray-300 hover:bg-gray-100 text-xs md:text-sm" />
          </div>
          <Breadcrumb />
          {children}
        </div>
      </main>
    </div>
  );
}
