// app/page.js - The archive home page.
//
// Structure: a sticky nav (components/Header.js) with the account actions on
// the right, a hero (kicker + archive title + subtitle), the search bar, and
// a responsive grid of entry cards. Entries are fetched from Supabase, search
// filters them client-side, and matching text is highlighted in the accent
// color. The fetching, filtering, and auth logic below is unchanged.
// Styles live in components/archive.css.
"use client";

import React from "react";
import collection from "../collection.config.js";
import Header from "../components/Header.js";
import EntryCard from "../components/EntryCard.js";
import { createBrowserSupabaseClient } from "../lib/supabase-browser.js";
import "../components/archive.css";

const highlightMatch = (text, term) => {
  if (!text) return "";
  if (!term) return text;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "ig");
  return text.replace(
    regex,
    '<span style="background-color: #2EE6A8; color: #1C222C;">$1</span>'
  );
};

export default function Home() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [entries, setEntries] = React.useState([]);
  const [loadingEntries, setLoadingEntries] = React.useState(true);

  React.useEffect(() => {
    async function getUser() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase.auth.getUser();
        setUser(data?.user || null);
      } catch (error) {
        console.error("Error getting user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

  // Fetch entries from Supabase
  React.useEffect(() => {
    async function fetchEntries() {
      try {
        const supabase = createBrowserSupabaseClient();
        // First try ordering by created_at (newest first)
        const { data, error } = await supabase
          .from("entries")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching entries with created_at order:", error);
          // Fall back to ordering by id if created_at doesn't exist
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("entries")
            .select("*")
            .order("id", { ascending: false });

          if (fallbackError) {
            console.error("Error fetching entries with id order:", fallbackError);
            setEntries([]);
          } else {
            setEntries(fallbackData || []);
          }
        } else {
          setEntries(data || []);
        }
      } catch (error) {
        console.error("Error fetching entries:", error);
        setEntries([]);
      } finally {
        setLoadingEntries(false);
      }
    }

    fetchEntries();
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      setUser(null);
      // Refresh the page to ensure clean state
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const filteredEntries = entries.filter((entry) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    // Split search term into words for flexible partial-word matching
    // e.g. "Goan Gomloh" → ["goan", "gomloh"]; single chars work too
    const searchTerms = term.split(/\s+/);

    // Check if any search term appears as a substring in the given text
    const matchesField = (text) => {
      if (!text) return false;
      const lowerText = text.toLowerCase();
      return searchTerms.some((t) => lowerText.includes(t));
    };

    // Handle both snake_case (from database) and camelCase (from data file) property names
    const titleEnglish = entry.title_english || entry.titleEnglish || "";
    const titleKhmer = entry.title_khmer || entry.titleKhmer || "";
    const description = entry.description || "";
    const contributor = entry.contributor || "";
    const place = entry.place || "";

    const matchesTitle = matchesField(titleEnglish) || matchesField(titleKhmer);
    const matchesDescription = matchesField(description);
    const matchesContributor = matchesField(contributor);
    const matchesPlace = matchesField(place);

    return matchesTitle || matchesDescription || matchesContributor || matchesPlace;
  });

  return (
    <>
      <Header loading={loading} user={user} onLogout={handleLogout} />

      <main className="archive-main">
        <section className="archive-hero">
          <h1 className="archive-title">{collection.name}</h1>
          <p className="archive-description">{collection.description}</p>
        </section>

        <div className="archive-search-wrap">
          <svg
            className="archive-search-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              cx="10.5"
              cy="9.8"
              r="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M10.5 15 L10.5 20.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <input
            className="archive-search"
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search entries"
          />
        </div>

        <p className="archive-count">
          {loadingEntries ? "Loading..." : `${filteredEntries.length} entries`}
        </p>

        <div className="archive-grid">
          {loadingEntries ? (
            <p className="archive-status">Loading entries…</p>
          ) : filteredEntries.length ? (
            filteredEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                id={entry.id}
                image={entry.image || ""}
                imageAlt={entry.title_english || entry.title_khmer || "Entry photo"}
                title={highlightMatch(entry.title_khmer || entry.titleKhmer || "", searchTerm)}
                titleEnglish={highlightMatch(entry.title_english || entry.titleEnglish || "", searchTerm)}
                description={highlightMatch(entry.description || "", searchTerm)}
                contributor={entry.contributor || ""}
                place={entry.place || ""}
              />
            ))
          ) : searchTerm ? (
            <p className="archive-status">
              No results found for "{searchTerm}"
            </p>
          ) : (
            <p className="archive-status">No entries in the archive yet</p>
          )}
        </div>

        <p className="archive-count">
          {loadingEntries ? "Loading..." : `entries in the archive: ${entries.length}`}
        </p>

        <footer className="archive-footer">
          Built in ICT 340 — Vibe Coding, American University of Phnom Penh, Fall
          2026. This archive is under construction all semester. Come back in
          December.
        </footer>
      </main>
    </>
  );
}