"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { fr, frPages } from "./fr";
import { en, enPages } from "./en";

const frAll = { ...fr, ...frPages };
const enAll = { ...en, ...enPages };

type Translations = typeof frAll;
type Lang = "fr" | "en";

const translations: Record<Lang, Translations> = { fr: frAll, en: enAll };

const I18nContext = createContext<{ t: Translations; lang: Lang; setLang: (l: Lang) => void }>({
  t: frAll, lang: "fr", setLang: () => {},
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
