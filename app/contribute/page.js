// app/contribute/page.js - Add a new entry to the archive.
// Only signed-in users see the form; everyone else gets a login link.
"use client";

import React from "react";
import collection from "../../collection.config.js";
import Header from "../../components/Header.js";
import Footer from "../../components/Footer.js";
import { createBrowserSupabaseClient } from "../../lib/supabase-browser.js";
import ContributeForm from "../../components/ContributeForm.js";
import { useLanguage } from "../../components/LanguageProvider.js";
import "../../components/contribute.css";

export default function ContributePage() {
  const { t } = useLanguage();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function getCurrentUser() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase.auth.getUser();
        setUser(data?.user || null);
      } catch (error) {
        console.error("Error reading your session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    getCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <Header loading={loading} user={user} onLogout={handleLogout} />
      <main id="main" className="contribute-wrap">
        <p className="contribute-kicker">{t("common.kicker")}</p>
        <h1 className="contribute-title">{t("contribute.title")}</h1>
        <p className="contribute-subtitle">
          {t("contribute.subtitle", { name: collection.name })}
        </p>
        <div className="contribute-head-rule" aria-hidden="true" />
      {loading ? (
        <p className="contribute-status">{t("contribute.checkingSession")}</p>
      ) : user ? (
        <div className="contribute-card">
          <ContributeForm />
        </div>
      ) : (
        <div className="contribute-card">
          <p className="contribute-gate-text">
            {t("contribute.gateText")}
          </p>
          <div className="contribute-gate-links">
            <a className="contribute-gate-link" href="/login">
              {t("nav.login")}
            </a>
            <a className="contribute-gate-link" href="/signup">
              {t("nav.signup")}
            </a>
          </div>
        </div>
      )}

        <a className="contribute-home-link" href="/">
          {t("common.backToArchive")}
        </a>
      </main>
      <Footer />
    </>
  );
}