"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

const TIMEOUT = 2 * 60 * 60 * 1000; // 2h inactivité

export function SessionTimeout() {
  const timer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    function reset() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        toast.error("Session expirée — reconnectez-vous");
        signOut({ callbackUrl: "/login" });
      }, TIMEOUT);
    }

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return null;
}
