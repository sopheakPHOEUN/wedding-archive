// components/HeaderMenu.js - The mobile drop-down panel for the header.
// Split out of Header.js so each component stays small. It shows the same
// links and account actions as the desktop nav, and closes itself whenever a
// link is tapped. All behaviour is visual; auth decisions live in app/page.js.
// Styles live in components/archive.css.
"use client";

import React from "react";
import LanguageSwitch from "./LanguageSwitch.js";
import { useLanguage } from "./LanguageProvider.js";
import "./archive.css";

export default function HeaderMenu({
  loading,
  user,
  isReviewer,
  onLogout,
  active = "none",
  onNavigate,
}) {
  const { t } = useLanguage();
  const isActive = (key) => (key === active ? "is-active" : "");

  return (
    <div className="royal-menu-panel">
      <a
        className={`royal-menu-link ${isActive("home")}`}
        href="/"
        onClick={onNavigate}
        aria-current={active === "home" ? "page" : undefined}
      >
        {t("nav.home")}
      </a>
      {!loading && user ? (
        <>
          <a
            className={`royal-menu-link ${isActive("my-entries")}`}
            href="/my-entries"
            onClick={onNavigate}
            aria-current={active === "my-entries" ? "page" : undefined}
          >
            {t("nav.myEntries")}
          </a>
          {isReviewer ? (
            <a
              className={`royal-menu-link ${isActive("review")}`}
              href="/review"
              onClick={onNavigate}
              aria-current={active === "review" ? "page" : undefined}
            >
              {t("nav.review")}
            </a>
          ) : null}
          <a
            className={`royal-menu-link ${isActive("contribute")} royal-menu-link-primary`}
            href="/contribute"
            onClick={onNavigate}
            aria-current={active === "contribute" ? "page" : undefined}
          >
            {t("nav.contribute")}
          </a>
          <span className="royal-menu-user" title={user.email}>
            {user.email}
          </span>
          <button
            type="button"
            className="royal-menu-logout"
            onClick={onLogout}
          >
            {t("nav.logout")}
          </button>
        </>
      ) : (
        <>
          <a className="royal-menu-link" href="/login" onClick={onNavigate}>
            {t("nav.login")}
          </a>
          <a
            className="royal-menu-link royal-menu-link-primary"
            href="/signup"
            onClick={onNavigate}
          >
            {t("nav.signup")}
          </a>
        </>
      )}
      <span className="royal-menu-lang">
        <LanguageSwitch />
      </span>
    </div>
  );
}