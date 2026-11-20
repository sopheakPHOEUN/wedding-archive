// components/Footer.js - Reusable heritage footer for every page.
// Centered editorial footer: the Khmer archive name, the English brand, a
// gold hairline with a diamond, the curator credit, and the project note.
// All copy comes from collection.config.js or is the existing footer text, so
// no new content is introduced. Styles live in components/archive.css.
"use client";

import React from "react";
import collection from "../collection.config.js";
import Ornament from "./Ornament.js";
import { useLanguage } from "./LanguageProvider.js";
import "./archive.css";

export default function Footer() {
  const { t, lang } = useLanguage();
  // The creator's name follows the active language: Khmer when the site is in
  // Khmer, English fallback so the credit is never blank.
  const name =
    lang === "km" && (collection.curatorKhmer || "").trim()
      ? collection.curatorKhmer
      : collection.curator;
  return (
    <footer className="heritage-footer">
      <div className="heritage-footer-top" aria-hidden="true" />
      <div className="site-shell heritage-footer-inner">
        <Ornament />
        <p className="heritage-footer-brand" lang="km">
          អាពាហ៍ពិពាហ៍ប្រពៃណីខ្មែរ
        </p>
        <p className="heritage-footer-name">{collection.name}</p>
        <div className="khmer-rule" aria-hidden="true">
          <span />
        </div>
        <p className="heritage-footer-credit">
          {t("footer.curatedBy", { name })}
        </p>
        <p className="heritage-footer-note">{t("footer.note")}</p>
      </div>
    </footer>
  );
}