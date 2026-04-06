"use client";

import { getNotifications } from "@/actions/notifications";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const URGENCE_COLORS = { haute: "border-l-red-500", moyenne: "border-l-orange-400", basse: "border-l-sky-400" };

export function NotificationBell() {
  const [notifs, setNotifs] = useState<{ notifications: { type: string; icon: string; message: string; link: string; urgence: string }[]; count: number }>({ notifications: [], count: 0 });
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    getNotifications().then(setNotifs);
    const interval = setInterval(() => getNotifications().then(setNotifs), 60000);
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
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-foreground">
        🔔
        {count > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold ${visible.some(n => n.urgence === "haute") ? "bg-red-500 animate-pulse" : "bg-orange-500"}`}>{count}</span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-96 bg-card border rounded-xl shadow-xl max-h-[500px] overflow-hidden flex flex-col">
            <div className="p-3 border-b font-medium text-sm text-foreground flex justify-between items-center">
              <span>Notifications ({count})</span>
              {count > 0 && <button onClick={dismissAll} className="text-[10px] text-primary hover:underline">Tout marquer comme vu</button>}
            </div>
            <div className="overflow-y-auto flex-1">
              {visible.length === 0 ? (
                <div className="p-6 text-center"><div className="text-3xl mb-2">✅</div><p className="text-sm text-muted-foreground">Aucune notification</p></div>
              ) : (
                visible.map((n, i) => (
                  <button key={i} onClick={() => handleClick(n)} className={`w-full flex gap-3 p-3 border-b last:border-0 hover:bg-muted/50 transition-colors border-l-4 text-left ${URGENCE_COLORS[n.urgence as keyof typeof URGENCE_COLORS] || ""}`}>
                    <span className="text-lg">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-tight">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{n.urgence}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
