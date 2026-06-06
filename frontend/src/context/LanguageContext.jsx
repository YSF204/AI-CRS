import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

const translations = { en, ar };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("lang") || "en";
      return savedLang;
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", lang);
      document.documentElement.setAttribute("dir", "ltr");
    }
  }, [lang]);

  const toggleLanguage = useCallback(() => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  }, []);

  const changeLanguage = useCallback((newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
    }
  }, []);
  const t = useCallback((key, replaceObj = {}, defaultValue) => {
    const keys = key.split(".");
    let value = translations[lang];
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        // Fallback to English
        let fallback = translations["en"];
        let foundFallback = true;
        for (const fk of keys) {
          if (fallback && fallback[fk] !== undefined) {
            fallback = fallback[fk];
          } else {
            foundFallback = false;
            break;
          }
        }
        value = foundFallback ? fallback : (defaultValue !== undefined ? defaultValue : key);
        break;
      }
    }
    if (typeof value === "string") {
      Object.entries(replaceObj).forEach(([k, v]) => {
        value = value.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, "g"), v);
      });
    }
    return value;
  }, [lang]);

  const value = useMemo(() => ({
    lang,
    toggleLanguage,
    changeLanguage,
    t,
    isRTL: lang === "ar"
  }), [lang, toggleLanguage, changeLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useTranslation must be used within LanguageProvider");
  return context;
}
