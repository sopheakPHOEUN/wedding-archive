// app/contribute/page.js - Add a new entry to the archive.
// Only signed-in users see the form; everyone else gets a login link.
"use client";

import React from "react";
import collection from "../../collection.config.js";
import { createBrowserSupabaseClient } from "../../lib/supabase-browser.js";
import ContributeForm from "../../components/ContributeForm.js";
import "../../components/contribute.css";

export default function ContributePage() {
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

  return (
    <main className="contribute-wrap">
      <p className="contribute-kicker">KHMER LIVING ARCHIVE</p>
      <h1 className="contribute-title">Contribute an Entry</h1>
      <p className="contribute-subtitle">
        Add a ritual, tradition, or memory you know to {collection.name}.
      </p>

      {loading ? (
        <p className="contribute-status">Checking your session…</p>
      ) : user ? (
        <div className="contribute-card">
          <ContributeForm />
        </div>
      ) : (
        <div className="contribute-card">
          <p className="contribute-gate-text">
            Contributions come from logged-in users so the archive always knows
            who shared what. Log in or create an account, then come back here
            to add an entry.
          </p>
          <div className="contribute-gate-links">
            <a className="contribute-gate-link" href="/login">
              Log In
            </a>
            <a className="contribute-gate-link" href="/signup">
              Sign Up
            </a>
          </div>
        </div>
      )}

      <a className="contribute-home-link" href="/">
        ← Back to the archive
      </a>
    </main>
  );
}