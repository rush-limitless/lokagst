"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { signOut } from "next-auth/react";

const INACTIVITY = 30 * 60 * 1000; // 30 min avant avertissement
const COUNTDOWN = 60; // 60 secondes de compte à rebours

export function SessionTimeout() {
  const timer = useRef<NodeJS.Timeout>();
  const interval = useRef<NodeJS.Timeout>();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  const startCountdown = useCallback(() => {
    setSecondsLeft(COUNTDOWN);
    interval.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval.current);
          signOut({ callbackUrl: "/login" });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (interval.current) clearInterval(interval.current);
    setSecondsLeft(null);
    timer.current = setTimeout(startCountdown, INACTIVITY);
  }, [startCountdown]);

  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timer.current) clearTimeout(timer.current);
      if (interval.current) clearInterval(interval.current);
    };
  }, [reset]);

  if (secondsLeft === null) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl p-6 shadow-2xl max-w-sm mx-4 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
          <span className="text-2xl font-bold text-orange-600">{secondsLeft}</span>
        </div>
        <h2 className="text-lg font-semibold">Session inactive</h2>
        <p className="text-sm text-muted-foreground">
          Vous serez déconnecté dans <strong>{secondsLeft} seconde{secondsLeft > 1 ? "s" : ""}</strong> pour des raisons de sécurité.
        </p>
        <button
          onClick={reset}
          className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Rester connecté
        </button>
      </div>
    </div>
  );
}
