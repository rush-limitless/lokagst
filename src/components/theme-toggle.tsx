"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

type ThemeMode = "light" | "dark" | "auto";

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("auto");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as ThemeMode | null;
    const m = saved || "auto";
    setMode(m);
    applyTheme(m);
  }, []);

  // Auto-update every minute when in auto mode
  useEffect(() => {
    if (mode !== "auto") return;
    const interval = setInterval(() => applyTheme("auto"), 60_000);
    return () => clearInterval(interval);
  }, [mode]);

  function applyTheme(m: ThemeMode) {
    const isDark = m === "dark" || (m === "auto" && isNightTime());
    document.documentElement.classList.toggle("dark", isDark);
  }

  function cycle() {
    const next: ThemeMode = mode === "auto" ? "light" : mode === "light" ? "dark" : "auto";
    setMode(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  }

  const icon = mode === "auto" ? <Monitor className="size-4" /> : mode === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />;
  const title = mode === "auto" ? "Mode auto (jour/nuit)" : mode === "dark" ? "Mode clair" : "Mode sombre";

  return (
    <button onClick={cycle} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title={title}>
      {icon}
    </button>
  );
}

function isNightTime(): boolean {
  const h = new Date().getHours();
  return h < 6 || h >= 18;
}
