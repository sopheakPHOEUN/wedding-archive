// AuthLayout.js - Layout wrapper for the login and sign-up pages.
// A split exhibition layout: a burgundy brand panel holds the engraved Khmer
// monogram and the archive name (from collection.config.js), while the form
// card with the Playfair title sits on the ivory side. Styles live in
// components/auth.css.
//
// The login page passes brandImage ("/hero.jpg") so the brand panel shows the
// hero photograph from /public instead of the monogram; the sign-up page omits
// it and keeps the engraved brand. No feature, function, or data changes.
"use client";

import React from "react";
import collection from "../collection.config.js";
import Ornament from "./Ornament.js";
import LanguageSwitch from "./LanguageSwitch.js";
import { useLanguage } from "./LanguageProvider.js";
import "./auth.css";

export default function AuthLayout({ title, children, brandImage }) {
  const { t } = useLanguage();
  return (
    <div className="auth-page">
      <div className="auth-lang">
        <LanguageSwitch />
      </div>
      <aside className="auth-brand">
        {brandImage ? (
          <img
            className="auth-brand-photo"
            src={brandImage}
            alt={collection.name}
          />
        ) : (
          <div>
            <span
              className="auth-brand-glyph"
              lang="km"
            >
              អ
            </span>
            <Ornament />
            <p className="auth-brand-khmer" lang="km">
              អាពាហ៍ពិពាហ៍ប្រពៃណីខ្មែរ
            </p>
            <p className="auth-brand-name">{collection.name}</p>
          </div>
        )}
      </aside>

      <main id="main" className="auth-main">
        <div className="auth-wrap">
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{collection.description}</p>

          <div className="auth-card">{children}</div>

          <footer className="auth-legend">
            <p style={{ margin: 0 }}>
              {t("auth.legend", { name: collection.curator })}
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}