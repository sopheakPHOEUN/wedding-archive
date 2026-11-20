// components/SkipLink.js - The keyboard/screen-reader "skip to content" link.
// A tiny client component so the root layout (a server component) can stay
// server-side while the link text follows the active language.
"use client";

import React from "react";
import { useLanguage } from "./LanguageProvider.js";

export default function SkipLink() {
  const { t } = useLanguage();
  return (
    <a className="skip-link" href="#main">
      {t("common.skipToContent")}
    </a>
  );
}