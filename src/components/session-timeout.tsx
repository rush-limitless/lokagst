"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

const TIMEOUT = 30 * 60 * 1000; // 30 min

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
