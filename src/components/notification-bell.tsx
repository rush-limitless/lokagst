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
      <button onClick={() => setOpen(!open)} className="relative text-lg">
        🔔
        {notifs.count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{notifs.count}</span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 w-80 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto">
            <div className="p-3 border-b font-medium text-sm">Notifications ({notifs.count})</div>
            {notifs.notifications.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">Aucune notification</p>
            ) : (
              notifs.notifications.map((n, i) => (
                <div key={i} className="p-3 border-b last:border-0 text-sm hover:bg-gray-50 flex gap-2">
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
