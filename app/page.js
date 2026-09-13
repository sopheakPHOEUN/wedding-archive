"use client";

import React from "react";
import collection from "../collection.config.js";
import EntryCard from "../components/EntryCard.js";

import entries from "../data/entries.js";
// entries are now imported from data/entries.js

const highlightMatch = (text, term) => {
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
    border: "1px solid #2E3644",
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
    borderTop: "1px solid #2E3644",
    fontSize: 13,
    color: "#5A6373",
  },
};

export default function Home() {
  const [searchTerm, setSearchTerm] = React.useState("");

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

    const matchesTitle = matchesField(entry.titleEnglish) || matchesField(entry.titleKhmer);
    const matchesDescription = matchesField(entry.description);
    const matchesContributor = matchesField(entry.contributor);
    const matchesPlace = matchesField(entry.place);

    return matchesTitle || matchesDescription || matchesContributor || matchesPlace;
  });

  return (
    <main style={styles.wrap}>
      <p style={styles.kicker}>KHMER LIVING ARCHIVE</p>
      <h1 style={styles.title}>{collection.name}</h1>
      <p style={styles.description}>{collection.description}</p>

      <input
        style={{
          padding: 12,
          fontSize: 16,
          border: "1px solid #2E3644",
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
        {filteredEntries.length} entries
      </p>

      <div style={styles.entryRow}>
        {filteredEntries.length ? (
          filteredEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              title={highlightMatch(entry.titleKhmer, searchTerm)}
              titleEnglish={highlightMatch(entry.titleEnglish, searchTerm)}
              description={highlightMatch(entry.description, searchTerm)}
              contributor={entry.contributor}
              place={entry.place}
            />
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#97A1B3", marginTop: 48 }}>
            No results
          </p>
        )}
      </div>

      <p style={styles.count}>
        entries in the archive: {entries.length} (sample entries for now)
      </p>

      <footer style={styles.footer}>
        Built in ICT 340 — Vibe Coding, American University of Phnom Penh, Fall
        2026. This archive is under construction all semester. Come back in
        December.
      </footer>
    </main>
  );
}
