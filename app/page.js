"use client";

import React from "react";
import collection from "../collection.config.js";
import EntryCard from "../components/EntryCard.js";
import { createBrowserSupabaseClient } from "../lib/supabase-browser.js";

// entries will be fetched from Supabase instead of importing from data/entries.js

const highlightMatch = (text, term) => {
  if (!text) return "";
  if (!term) return text;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "ig");
  return text.replace(regex, '<span style="background-color: #2EE6A8; color: #1C222C;">$1</span>');
};

const styles = {
  wrap: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "80px 24px",
  },
  kicker: {
    fontFamily: "'Courier New', monospace",
    color: "#2EE6A8",
    fontSize: 14,
    letterSpacing: 1,
  },
  title: {
    fontSize: 48,
    fontWeight: 700,
    margin: "16px 0 12px",
    lineHeight: 1.1,
  },
  description: {
    fontSize: 18,
    color: "#97A1B3",
    lineHeight: 1.6,
    margin: 0,
  },
  card: {
    marginTop: 48,
    padding: 24,
    backgroundColor: "#1C222C",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#2E3644",
    borderRadius: 10,
  },
  cardLabel: {
    fontFamily: "'Courier New', monospace",
    fontSize: 12,
    color: "#97A1B3",
    margin: 0,
  },
  cardValue: {
    fontSize: 16,
    margin: "6px 0 0",
  },
  entryRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 24,
  },
  count: {
    fontFamily: "'Courier New', monospace",
    fontSize: 14,
    color: "#2EE6A8",
    marginTop: 48,
  },
  footer: {
    marginTop: 64,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: "#2E3644",
    fontSize: 13,
    color: "#5A6373",
  },
  authContainer: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginTop: 24,
    padding: 16,
    backgroundColor: "#1C222C",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#2E3644",
    borderRadius: 8,
  },
  authText: {
    fontSize: 14,
    color: "#E8EDF2",
    margin: 0,
  },
  authEmail: {
    fontWeight: 600,
    color: "#2EE6A8",
  },
  authLinks: {
    display: "flex",
    gap: 16,
    marginTop: 24,
  },
  authLink: {
    color: "#2EE6A8",
    textDecoration: "none",
    fontSize: 14,
    padding: "8px 16px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#2EE6A8",
    borderRadius: 6,
    transition: "all 0.2s",
  },
  authLinkHover: {
    backgroundColor: "#2EE6A8",
    color: "#1C222C",
  },
  logoutButton: {
    backgroundColor: "transparent",
    color: "#FF4B4B",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#FF4B4B",
    borderRadius: 6,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
    marginLeft: "auto",
  },
  logoutButtonHover: {
    backgroundColor: "#FF4B4B",
    color: "#1C222C",
  },
};

export default function Home() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [logoutHover, setLogoutHover] = React.useState(false);
  const [loginHover, setLoginHover] = React.useState(false);
  const [signupHover, setSignupHover] = React.useState(false);
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
    <main style={styles.wrap}>
      <p style={styles.kicker}>KHMER LIVING ARCHIVE</p>
      <h1 style={styles.title}>{collection.name}</h1>
      <p style={styles.description}>{collection.description}</p>

      {/* Authentication Section */}
      {!loading && (
        user ? (
          <div style={styles.authContainer}>
            <p style={styles.authText}>
              Welcome, <span style={styles.authEmail}>{user.email}</span>
            </p>
            <button
              style={{
                ...styles.logoutButton,
                ...(logoutHover ? styles.logoutButtonHover : {})
              }}
              onClick={handleLogout}
              onMouseEnter={() => setLogoutHover(true)}
              onMouseLeave={() => setLogoutHover(false)}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={styles.authLinks}>
            <a
              href="/login"
              style={{
                ...styles.authLink,
                ...(loginHover ? styles.authLinkHover : {})
              }}
              onMouseEnter={() => setLoginHover(true)}
              onMouseLeave={() => setLoginHover(false)}
            >
              Log In
            </a>
            <a
              href="/signup"
              style={{
                ...styles.authLink,
                ...(signupHover ? styles.authLinkHover : {})
              }}
              onMouseEnter={() => setSignupHover(true)}
              onMouseLeave={() => setSignupHover(false)}
            >
              Sign Up
            </a>
          </div>
        )
      )}

      <input
        style={{
          padding: 12,
          fontSize: 16,
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "#2E3644",
          borderRadius: 6,
          width: "100%",
          maxWidth: 550,
          marginBottom: 16,
          outline: "none",
        }}
        placeholder="Search entries..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <p style={{ fontFamily: "'Courier New', monospace", fontSize: 14, color: "#2EE6A8", marginTop: 12 }}>
        {loadingEntries ? "Loading..." : `${filteredEntries.length} entries`}
      </p>

      <div style={styles.entryRow}>
        {loadingEntries ? (
          <p style={{ textAlign: "center", color: "#97A1B3", marginTop: 48, width: "100%" }}>
            Loading entries...
          </p>
        ) : filteredEntries.length ? (
          filteredEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              id={entry.id}
              title={highlightMatch(entry.title_khmer || entry.titleKhmer || "", searchTerm)}
              titleEnglish={highlightMatch(entry.title_english || entry.titleEnglish || "", searchTerm)}
              description={highlightMatch(entry.description || "", searchTerm)}
              contributor={entry.contributor || ""}
              place={entry.place || ""}
            />
          ))
        ) : searchTerm ? (
          <p style={{ textAlign: "center", color: "#97A1B3", marginTop: 48, width: "100%" }}>
            No results found for "{searchTerm}"
          </p>
        ) : (
          <p style={{ textAlign: "center", color: "#97A1B3", marginTop: 48, width: "100%" }}>
            No entries in the archive yet
          </p>
        )}
      </div>

      <p style={styles.count}>
        {loadingEntries ? "Loading..." : `entries in the archive: ${entries.length}`}
      </p>

      <footer style={styles.footer}>
        Built in ICT 340 — Vibe Coding, American University of Phnom Penh, Fall
        2026. This archive is under construction all semester. Come back in
        December.
      </footer>
    </main>
  );
}
