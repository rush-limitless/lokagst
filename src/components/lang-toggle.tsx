"use client";

import { useI18n } from "@/lib/i18n";

export function LangToggle() {
  const { lang, setLang } = useI18n();

  return (
    <button
      onClick={() => setLang(lang === "fr" ? "en" : "fr")}
      className="text-xs font-medium px-2.5 py-1.5 border rounded-lg hover:bg-muted transition-colors text-foreground border-border"
      title={lang === "fr" ? "Switch to English" : "Passer en français"}
    >
      {lang === "fr" ? "FR 🇫🇷" : "EN 🇬🇧"}
    </button>
  );
}
