// components/LanguageProvider.js - Lightweight bilingual context.
//
// Holds the site's current language ("en" or "km") and exposes:
//   lang        - current language code
//   changeLang  - persist the choice (localStorage + cookie) and reload, so
//                 server-rendered pages (like /review) render in that language
//   t(key, vars) - translate a dictionary key with optional placeholders
//   tError(msg)  - translate an English validation message from lib/
//
// `initialLang` comes from the language cookie read by app/layout.js, so the
// server render and the first client render always match (no hydration
// mismatch). First-time visitors with a Khmer browser and no saved choice are
// auto-switched to the Khmer site once.
"use client";

import React from "react";
import {
  LANG_COOKIE,
  LANG_STORAGE,
  resolveLang,
  translate,
  translateRuleError,
} from "../lib/i18n.js";
import "./archive.css";

const LanguageContext = React.createContext(null);

export default function LanguageProvider({ initialLang = "en", children }) {
  const [lang, setLang] = React.useState(() => resolveLang(initialLang));

  const changeLang = React.useCallback(
    (next) => {
      const resolved = resolveLang(next);
      if (resolved === lang) return;
      try {
        window.localStorage.setItem(LANG_STORAGE, resolved);
      } catch (error) {
        /* localStorage is best-effort */
      }
      try {
        document.cookie = `${LANG_COOKIE}=${resolved}; path=/; samesite=lax`;
      } catch (error) {
        /* cookie is best-effort; the reload still applies the client state */
      }
      setLang(resolved);
      // Full reload so every page — including server pages — re-renders in
      // the chosen language with identical markup.
      window.location.reload();
    },
    [lang]
  );

  // First visit with no saved choice: a Khmer browser gets the Khmer site.
  React.useEffect(() => {
    let saved = null;
    try {
      saved = window.localStorage.getItem(LANG_STORAGE);
    } catch (error) {
      /* ignore */
    }
    if (!saved) {
      const browserLang = (navigator.language || "").toLowerCase();
      if (browserLang.startsWith("km")) changeLang("km");
    }
  }, [changeLang]);

  // Keep <html lang> in sync for assistive tech and typography.
  React.useEffect(() => {
    if (document.documentElement) document.documentElement.lang = lang;
  }, [lang]);

  const value = React.useMemo(() => {
    const t = (key, vars) => translate(lang, key, vars);
    const tError = (message) => translateRuleError(lang, message);
    return { lang, changeLang, t, tError };
  }, [lang, changeLang]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

// Convenience hook. Returns safe defaults so a component rendered outside the
// provider (should not happen on this site) still works.
export function useLanguage() {
  const context = React.useContext(LanguageContext);
  return (
    context || {
      lang: "en",
      changeLang: () => {},
      t: (key) => key,
      tError: (message) => message,
    }
  );
}