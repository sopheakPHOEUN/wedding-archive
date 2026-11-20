// components/LanguageSwitch.js - The English/Khmer toggle button.
// Shows the language you will switch TO ("ភាសាខ្មែរ" while in English,
// "English" while in Khmer). ChangeLang persists the choice and reloads, so
// every page (including the server-rendered /review page) re-renders in the
// new language. Styles live in components/archive.css.
"use client";

import React from "react";
import { useLanguage } from "./LanguageProvider.js";

export default function LanguageSwitch() {
  const { lang, changeLang } = useLanguage();
  const toKhmer = lang !== "km";
  const label = toKhmer ? "ភាសាខ្មែរ" : "English";
  const aria = toKhmer ? "ប្តូរទៅភាសាខ្មែរ" : "Switch to English";

  return (
    <button
      type="button"
      className={`royal-lang${toKhmer ? " is-khmer" : ""}`}
      onClick={() => changeLang(toKhmer ? "km" : "en")}
      aria-label={aria}
      title={aria}
      lang={toKhmer ? "km" : "en"}
    >
      {label}
    </button>
  );
}