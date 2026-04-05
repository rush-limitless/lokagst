"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { fr } from "./fr";
import { en } from "./en";

type Translations = typeof fr;
type Lang = "fr" | "en";

const translations: Record<Lang, Translations> = { fr, en };

const I18nContext = createContext<{ t: Translations; lang: Lang; setLang: (l: Lang) => void }>({
  t: fr, lang: "fr", setLang: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang;
    if (saved && translations[saved]) setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("lang", l);
  }

  return (
    <I18nContext.Provider value={{ t: translations[lang], lang, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
