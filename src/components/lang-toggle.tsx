"use client";

import { useI18n } from "@/lib/i18n";

export function LangToggle() {
  const { lang, setLang } = useI18n();

  return (
    <button
      onClick={() => setLang(lang === "fr" ? "en" : "fr")}
      className="text-sm font-medium px-2 py-1 border rounded hover:bg-gray-100"
      title={lang === "fr" ? "Switch to English" : "Passer en français"}
    >
      {lang === "fr" ? "🇬🇧 EN" : "🇫🇷 FR"}
    </button>
  );
}
