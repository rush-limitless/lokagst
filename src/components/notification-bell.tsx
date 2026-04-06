"use client";

import { getNotifications } from "@/actions/notifications";
import { useEffect, useState } from "react";
import Link from "next/link";

const URGENCE_COLORS = { haute: "border-l-red-500", moyenne: "border-l-orange-400", basse: "border-l-sky-400" };

export function NotificationBell() {
  const [notifs, setNotifs] = useState<{ notifications: { type: string; icon: string; message: string; link: string; urgence: string }[]; count: number }>({ notifications: [], count: 0 });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getNotifications().then(setNotifs);
    const interval = setInterval(() => getNotifications().then(setNotifs), 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-foreground">
        🔔
        {notifs.count > 0 && (
          <span className={`absolute -top-0.5 -right-0.5 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold ${notifs.notifications.some(n => n.urgence === "haute") ? "bg-red-500 animate-pulse" : "bg-orange-500"}`}>{notifs.count}</span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-96 bg-card border rounded-xl shadow-xl max-h-[500px] overflow-hidden flex flex-col">
            <div className="p-3 border-b font-medium text-sm text-foreground flex justify-between items-center">
              <span>Notifications ({notifs.count})</span>
              {notifs.count > 0 && <span className="text-[10px] text-red-500 font-normal">{notifs.notifications.filter(n => n.urgence === "haute").length} urgente(s)</span>}
            </div>
            <div className="overflow-y-auto flex-1">
              {notifs.notifications.length === 0 ? (
                <div className="p-6 text-center"><div className="text-3xl mb-2">✅</div><p className="text-sm text-muted-foreground">Aucune notification</p></div>
              ) : (
                notifs.notifications.map((n, i) => (
                  <Link key={i} href={n.link} onClick={() => setOpen(false)} className={`flex gap-3 p-3 border-b last:border-0 hover:bg-muted/50 transition-colors border-l-4 ${URGENCE_COLORS[n.urgence as keyof typeof URGENCE_COLORS] || ""}`}>
                    <span className="text-lg">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-tight">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{n.urgence}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
