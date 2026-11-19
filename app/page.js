// app/page.js - The archive home page.
//
// Royal Khmer Heritage layout. The page reads like an exhibition: a layered
// hero (Khmer eyebrow, Playfair title, gold ornament, a framed media panel
// featuring the static hero image /hero.jpg or an engraved monogram), a stats
// band, an editorial "About the collection" section built only from
// collection.config.js, then the rituals gallery with its search bar.
//
// Search and highlighting run through lib/search.js (relevance tiers,
// title-weighted ranking, NFC-aware Khmer matching) while fetching and auth
// use Supabase as before. Styles live in components/archive.css and the
// shared tokens in components/theme.css.
"use client";

import React from "react";
import collection from "../collection.config.js";
import Header from "../components/Header.js";
import EntryCard from "../components/EntryCard.js";
import Footer from "../components/Footer.js";
import Ornament from "../components/Ornament.js";
import Reveal from "../components/Reveal.js";
import Lightbox from "../components/Lightbox.js";
import AboutSlider from "../components/AboutSlider.js";
import { createBrowserSupabaseClient } from "../lib/supabase-browser.js";
import { searchEntries, highlightText } from "../lib/search.js";
import "../components/archive.css";

// Render one search result into the shared card. The search engine reports
// which terms matched in which field (lib/search.js), so highlighting only
// marks words that genuinely occur in the title/description being shown, and
// the matchLabel tells the visitor why this result appeared.
const cardProps = (result) => {
  const entry = result.entry;
  const fieldTerms = result.fieldTerms || {};
  return {
    id: entry.id,
    image: entry.image || "",
    imageAlt: entry.title_english || entry.title_khmer || "Entry photo",
    title: highlightText(
      entry.title_khmer || entry.titleKhmer || "",
      fieldTerms.title_khmer
    ),
    titleEnglish: highlightText(
      entry.title_english || entry.titleEnglish || "",
      fieldTerms.title_english
    ),
    description: highlightText(entry.description || "", fieldTerms.description),
    contributor: entry.contributor || "",
    place: entry.place || "",
    matchLabel: result.label || "",
  };
};

export default function Home() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isReviewer, setIsReviewer] = React.useState(false);
  const [entries, setEntries] = React.useState([]);
  const [loadingEntries, setLoadingEntries] = React.useState(true);
  const [entriesError, setEntriesError] = React.useState("");
  const [heroView, setHeroView] = React.useState(false);
  // True when the static /hero.jpg fails to load, so the hero falls back to
  // the engraved monogram instead of showing a broken image.
  const [heroImageError, setHeroImageError] = React.useState(false);

  React.useEffect(() => {
    async function getUser() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase.auth.getUser();
        const sessionUser = data?.user || null;
        setUser(sessionUser);
        if (sessionUser) {
          // The header only links to the review queue for reviewers. If the
          // RPC errors we cannot prove reviewer status, so the link stays
          // hidden (same fail-closed rule lib/entries.js uses).
          const { data: reviewerData, error: reviewerError } =
            await supabase.rpc("is_reviewer");
          if (reviewerError) {
            console.error("is_reviewer RPC error:", reviewerError);
          } else if (reviewerData === true) {
            setIsReviewer(true);
          }
        }
      } catch (error) {
        console.error("Error getting user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

  // Fetch published entries from Supabase. If the request fails we record an
  // actionable error (with a Retry handler) instead of silently showing an
  // empty archive.
  const loadEntries = React.useCallback(async () => {
    setLoadingEntries(true);
    setEntriesError("");
    try {
      const supabase = createBrowserSupabaseClient();
      // Public pages only ever show published entries. The status filter is
      // client-side so it applies to logged-in reviewers too, who may be able
      // to read pending rows through RLS.
      // First try ordering by created_at (newest first)
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching entries with created_at order:", error);
        // Fall back to ordering by id if created_at doesn't exist
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("entries")
          .select("*")
          .eq("status", "published")
          .order("id", { ascending: false });
        if (fallbackError) {
          console.error("Error fetching entries with id order:", fallbackError);
          throw new Error(fallbackError.message);
        }
        setEntries(fallbackData || []);
      } else {
        setEntries(data || []);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
      setEntries([]);
      setEntriesError(
        "The archive couldn't be loaded right now. Please check your connection and try again."
      );
    } finally {
      setLoadingEntries(false);
    }
  }, []);

  React.useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Restore a search carried over from an entry page ("back to results") or a
  // shared ?q= link, and remember the latest term for that round-trip.
  React.useEffect(() => {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("q");
      const restored =
        fromUrl || window.sessionStorage.getItem("kla-search") || "";
      if (restored) setSearchTerm(restored);
    } catch (error) {
      console.error("Error restoring search:", error);
    }
  }, []);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    try {
      window.sessionStorage.setItem("kla-search", value);
    } catch (error) {
      /* sessionStorage is best-effort; ignore quota/availability errors */
    }
  };

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

  // Search runs through lib/search.js: relevance tiers (exact phrase, all
  // terms, partial), ranking that favors title matches, and per-field matched
  // terms that drive both the highlighting and the "why this result" label.
  const search = React.useMemo(
    () => searchEntries(entries, searchTerm),
    [entries, searchTerm]
  );
  const searchResults = search.results;

  // The framed hero panel shows the static hero image in /public/hero.jpg.
  // To change it, overwrite that file with a new photo (keep the name
  // hero.jpg). If the file is missing, it falls back to the styled monogram.

  const firstResult = searchResults.length ? searchResults[0] : null;
  const restResults =
    searchResults.length > 1 ? searchResults.slice(1) : [];

  // Photos for the About slider: every published entry that has an image.
  // entries are already ordered newest first, so the slide show follows the
  // same order as the gallery below. Entries without a photo are skipped so
  // no broken <img> can appear in the frame.
  const aboutImages = React.useMemo(
    () =>
      (entries || [])
        .map((entry) => ({
          src: typeof entry.image === "string" ? entry.image : "",
          alt: entry.title_khmer || entry.title_english || "Archive photo",
        }))
        .filter((img) => img.src.trim().length > 0),
    [entries]
  );

  return (
    <>
      <Header
        loading={loading}
        user={user}
        isReviewer={isReviewer}
        onLogout={handleLogout}
      />

      <main id="main">
        {/* ============ Hero ============ */}
        <section className="hero">
          <div className="hero-pattern" aria-hidden="true" />
          <div className="hero-shell">
            <div className="hero-copy">
              <Reveal>
                <p className="hero-eyebrow" lang="km">
                  អាពាហ៍ពិពាហ៍ប្រពៃណីខ្មែរ
                </p>
                <h1 className="hero-title">{collection.name}</h1>
                <p className="hero-sub">{collection.description}</p>
                <Ornament />
                <a className="hero-cta" href="#collection">
                  Explore the rituals
                </a>
              </Reveal>
            </div>

            <Reveal delay={140}>
              <div className="hero-media">
                <div className="hero-frame">
                  {!heroImageError ? (
                    <button
                      type="button"
                      className="hero-image-btn"
                      onClick={() => setHeroView(true)}
                      aria-label="View hero image full size"
                    >
                      <img
                        className="hero-media-img"
                        src="/hero.jpg"
                        alt={collection.name}
                        onError={() => setHeroImageError(true)}
                      />
                      <span className="hero-zoom">View full size</span>
                    </button>
                  ) : (
                    <div className="hero-monogram">
                      <span className="hero-monogram-glyph" lang="km">
                        អ
                      </span>
                      <p className="hero-monogram-text" lang="km">
                        អាពាហ៍ពិពាហ៍ប្រពៃណីខ្មែរ
                      </p>
                      <Ornament />
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
          <div className="hero-scroll">Scroll</div>
        </section>

        {/* ============ About the collection ============ */}
        <section className="about">
          <div className="about-shell">
            <Reveal>
              <AboutSlider images={aboutImages} />
            </Reveal>

            <Reveal delay={130}>
              <div className="about-copy">
                <p className="section-eyebrow">The Collection</p>
                <h2 className="section-title">
                  A record of living Khmer tradition
                </h2>
                <p className="section-lede">{collection.description}</p>

                <div className="about-note">
                  <p className="about-note-label">
                    Knowledge gathered from
                  </p>
                  <p className="about-note-text">{collection.source}</p>
                  <p className="about-credit">
                    Curated by{" "}
                    <strong style={{ color: "#4a2525" }}>
                      {collection.curator}
                    </strong>
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ Rituals gallery ============ */}
        <section id="collection" className="collection">
          <div className="collection-head">
            <Reveal>
              <p className="section-eyebrow">The Rituals</p>
              <h2 className="section-title">Explore the ceremony</h2>
              <div className="khmer-rule" aria-hidden="true">
                <span />
              </div>
            </Reveal>
          </div>

          <Reveal>
            <form className="search-wrap" role="search" onSubmit={(e) => e.preventDefault()}>
              <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
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
                className="search-input"
                type="search"
                placeholder="Search entries…"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                aria-label="Search the archival entries"
              />
              {searchTerm ? (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => handleSearchChange("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              ) : null}
            </form>
          </Reveal>

          <Reveal>
            <p className="collection-count">
              {loadingEntries
                ? "Loading the archive…"
                : `${searchResults.length} entries`}
            </p>
          </Reveal>

          {entriesError ? (
            <div className="collection-state" role="alert">
              <p className="collection-state-title">
                Couldn't load the archive
              </p>
              <p className="collection-state-text">{entriesError}</p>
              <button
                type="button"
                className="collection-state-btn"
                onClick={loadEntries}
              >
                Retry
              </button>
            </div>
          ) : loadingEntries ? (
            <>
              {/* Loading skeleton keeps the layout stable and clearly
                  communicates that content is on the way. */}
              <div className="gallery-featured" aria-hidden="true">
                <div className="skeleton skeleton-featured" />
              </div>
              <div className="gallery-grid" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="skeleton skeleton-card" />
                ))}
              </div>
            </>
          ) : firstResult ? (
            <>
              <Reveal className="gallery-featured">
                <EntryCard
                  {...cardProps(firstResult)}
                  num={1}
                  featured
                />
              </Reveal>

              {restResults.length ? (
                <div className="gallery-grid">
                  {restResults.map((result, index) => (
                    <Reveal key={result.entry.id} delay={(index % 3) * 90}>
                      <EntryCard
                        {...cardProps(result)}
                        num={index + 2}
                      />
                    </Reveal>
                  ))}
                </div>
              ) : null}
            </>
          ) : search.mode === "no-meaningful" ? (
            <div className="collection-state">
              <p className="collection-state-title">
                Try a more specific search
              </p>
              <p className="collection-state-text">
                That search used only common words such as &ldquo;the&rdquo;
                or &ldquo;with&rdquo;, which don&rsquo;t narrow the results.
                Try a ritual name, a place, or a special word like
                &ldquo;ceremony&rdquo;.
              </p>
              <button
                type="button"
                className="collection-state-btn"
                onClick={() => handleSearchChange("")}
              >
                Clear search
              </button>
            </div>
          ) : searchTerm ? (
            <div className="collection-state">
              <p className="collection-state-title">
                No results for "{searchTerm}"
              </p>
              <p className="collection-state-text">
                Try a different word, or clear the search to browse the whole
                archive.
              </p>
              <button
                type="button"
                className="collection-state-btn"
                onClick={() => handleSearchChange("")}
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="collection-state">
              <p className="collection-state-title">
                No entries in the archive yet
              </p>
              <p className="collection-state-text">
                As rituals are reviewed and published, they will appear here.
              </p>
            </div>
          )}
        </section>
      </main>

      {!heroImageError ? (
        <Lightbox
          open={heroView}
          image="/hero.jpg"
          alt={collection.name}
          onClose={() => setHeroView(false)}
        />
      ) : null}

      <Footer />
    </>
  );
}
