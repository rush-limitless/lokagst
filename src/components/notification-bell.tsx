"use client";

import { getNotifications } from "@/actions/notifications";
import { useEffect, useState } from "react";

const ICONS: Record<string, string> = { impaye: "🔴", expiration: "🟠", suspension: "⛔", maintenance: "🔧" };

export function NotificationBell() {
  const [notifs, setNotifs] = useState<{ notifications: { type: string; message: string }[]; count: number }>({ notifications: [], count: 0 });
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
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{notifs.count}</span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-80 bg-card border rounded-xl shadow-xl max-h-96 overflow-y-auto">
            <div className="p-3 border-b font-medium text-sm text-foreground">Notifications ({notifs.count})</div>
            {notifs.notifications.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">Aucune notification</p>
            ) : (
              notifs.notifications.map((n, i) => (
                <div key={i} className="p-3 border-b last:border-0 text-sm hover:bg-muted/50 flex gap-2 text-foreground">
                  <span>{ICONS[n.type]}</span>
                  <span>{n.message}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
