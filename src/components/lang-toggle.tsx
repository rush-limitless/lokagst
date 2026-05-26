"use client";

import { useI18n } from "@/lib/i18n";
import { Globe } from "lucide-react";

export function LangToggle() {
  const { lang, setLang } = useI18n();

  return (
    <button
      onClick={() => setLang(lang === "fr" ? "en" : "fr")}
      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
      title={lang === "fr" ? "Switch to English" : "Passer en français"}
    >
      <Globe className="size-4" />
    </button>
  );
}
