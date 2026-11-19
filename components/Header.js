// components/Header.js - Sticky top navigation.
// A thin gold hairline sits above the burgundy band; the brand mark is a
// diamond-cut gold emblem, the Khmer name sits above the Playfair brand, and
// nav links draw a gold underline on hover. On phones the nav and auth collapse
// behind a hamburger that opens the HeaderMenu panel. All auth decisions are
// passed in from the page; this component only renders.
// Styles live in components/archive.css.
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import collection from "../collection.config.js";
import HeaderMenu from "./HeaderMenu.js";
import "./archive.css";

// Which nav item is the current page, so we can mark it active for clarity
// and orientation (aria-current for assistive tech, a gold underline on dark).
const activeKeyOf = (pathname) => {
  if (!pathname) return "none";
  if (pathname === "/") return "home";
  if (pathname.startsWith("/my-entries")) return "my-entries";
  if (pathname.startsWith("/review")) return "review";
  if (pathname.startsWith("/contribute")) return "contribute";
  // Sub-pages (an entry's detail page, the edit page) belong to none of the
  // top-level sections, so no nav item is marked as active there.
  return "none";
};

export default function Header({ loading, user, isReviewer, onLogout }) {
  const pathname = usePathname();
  const active = activeKeyOf(pathname);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const closeMenu = () => setMenuOpen(false);

  const isActive = (key) => (key === active ? "is-active" : "");

  return (
    <header className="royal-header">
      <span className="royal-header-hairline" aria-hidden="true" />
      <a className="royal-brand" href="/" onClick={closeMenu}>
        <span className="royal-brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path
              d="M12 2 L21 7 L12 12 L3 7 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M12 12 L21 17 L12 22 L3 17 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>
        </span>
        <span className="royal-brand-text">
          <span className="royal-brand-khmer" lang="km">
            អាពាហ៍ពិពាហ៍ប្រពៃណីខ្មែរ
          </span>
          <span className="royal-brand-name">{collection.name}</span>
        </span>
      </a>

      <nav className="royal-nav" aria-label="Main">
        <a
          className={`royal-nav-link ${isActive("home")}`}
          href="/"
          aria-current={active === "home" ? "page" : undefined}
        >
          Home
        </a>
        {!loading && user ? (
          <>
            <a
              className={`royal-nav-link ${isActive("my-entries")}`}
              href="/my-entries"
              aria-current={active === "my-entries" ? "page" : undefined}
            >
              My Entries
            </a>
            {isReviewer ? (
              <a
                className={`royal-nav-link ${isActive("review")}`}
                href="/review"
                aria-current={active === "review" ? "page" : undefined}
              >
                Review
              </a>
            ) : null}
            <a
              className={`royal-nav-link royal-nav-link-contribute ${isActive(
                "contribute"
              )}`}
              href="/contribute"
              aria-current={active === "contribute" ? "page" : undefined}
            >
              Contribute
            </a>
          </>
        ) : null}
      </nav>

      <div className="royal-auth">
        {!loading && user ? (
          <>
            <span className="royal-user" title={user.email}>
              {user.email}
            </span>
            <button type="button" className="royal-logout" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : !loading ? (
          <>
            <a className="royal-link" href="/login">
              Log In
            </a>
            <a className="royal-link royal-link-primary" href="/signup">
              Sign Up
            </a>
          </>
        ) : null}
      </div>

      <button
        type="button"
        className="royal-menu-toggle"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>

      {menuOpen ? (
        <HeaderMenu
          loading={loading}
          user={user}
          isReviewer={isReviewer}
          onLogout={onLogout}
          active={active}
          onNavigate={closeMenu}
        />
      ) : null}
    </header>
  );
}