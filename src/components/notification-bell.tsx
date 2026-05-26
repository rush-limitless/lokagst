"use client";

import { getNotifications } from "@/actions/notifications";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const URGENCE_COLORS = { haute: "border-l-red-500 bg-red-50/50 dark:bg-red-950/10", moyenne: "border-l-orange-400 bg-orange-50/50 dark:bg-orange-950/10", basse: "border-l-sky-400" };

export function NotificationBell() {
  const [notifs, setNotifs] = useState<{ notifications: { type: string; icon: string; message: string; link: string; urgence: string }[]; count: number }>({ notifications: [], count: 0 });
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    const load = () => getNotifications().then((r) => r && setNotifs(r)).catch(() => {});
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const visible = notifs.notifications.filter((n) => !dismissed.has(n.message));
  const count = visible.length;

  function handleClick(n: { link: string; message: string }) {
    setDismissed((prev) => new Set(prev).add(n.message));
    setOpen(false);
    router.push(n.link);
  }

  function dismissAll() {
    setDismissed(new Set(notifs.notifications.map((n) => n.message)));
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-foreground">
        🔔
        {count > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold ${visible.some(n => n.urgence === "haute") ? "bg-red-500 animate-pulse" : "bg-orange-500"}`}>{count}</span>
        )}
      </button>

      {/* Overlay */}
      <div className={cn("fixed inset-0 bg-black/40 z-50 transition-opacity", open ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => setOpen(false)} />

      {/* Sheet panel */}
      <div className={cn("fixed top-0 right-0 h-full w-full sm:w-[400px] bg-card border-l shadow-2xl z-50 flex flex-col transition-transform duration-300", open ? "translate-x-0" : "translate-x-full")}>
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">Notifications</h2>
            <p className="text-xs text-muted-foreground">{count} notification(s) active(s)</p>
          </div>
          <div className="flex items-center gap-2">
            {count > 0 && <button onClick={dismissAll} className="text-[10px] text-primary hover:underline">Tout vu</button>}
            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"><X className="size-4" /></button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-sm font-medium text-foreground">Tout est en ordre</p>
              <p className="text-xs text-muted-foreground mt-1">Aucune notification en attente</p>
            </div>
          ) : (
            <div className="divide-y">
              {visible.map((n, i) => (
                <button key={i} onClick={() => handleClick(n)} className={cn("w-full flex gap-3 p-4 hover:bg-muted/50 transition-colors border-l-4 text-left", URGENCE_COLORS[n.urgence as keyof typeof URGENCE_COLORS] || "")}>
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-lg shrink-0">{n.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 capitalize flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${n.urgence === "haute" ? "bg-red-500" : n.urgence === "moyenne" ? "bg-orange-400" : "bg-sky-400"}`} />
                      {n.urgence}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
