// app/my-entries/page.js - The signed-in contributor's own entries.
// Only logged-in users can see the list; everyone else gets the same login
// gate the /contribute page uses. Rows are fetched with owner equal to the
// session user's ID, so no one can read another person's entries. Each entry
// shows a bilingual review-status chip. Entries that are waiting for review
// or were returned by the reviewer get an Edit action that opens
// /entries/[id]/edit; saving that edit goes through lib/entries.js
// updateEntry, which resets the status to 'pending' so the entry lands back
// in the review queue. Once signed in, an Add New Entry link stays visible no
// matter how many (or which statuses of) entries already exist, so a
// contributor can always add another. Layout reuses the .contribute-* classes
// from contribute.css; the list styles live in my-entries.css.
"use client";

import React from "react";
import { createBrowserSupabaseClient } from "../../lib/supabase-browser.js";
import "../../components/contribute.css";
import "../../components/my-entries.css";

// The bilingual status labels shown next to each entry. Khmer is first-class
// content here, so it is never stripped or transliterated.
const STATUS_LABELS = {
  pending: "Pending — កំពុងរង់ចាំការពិនិត្យ",
  published: "Published — បានផ្សព្វផ្សាយ",
  returned: "Returned — ត្រូវការកែសម្រួល",
};

export default function MyEntriesPage() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [entries, setEntries] = React.useState([]);
  const [loadingEntries, setLoadingEntries] = React.useState(false);
  const [error, setError] = React.useState("");

  // Read the session the same way the other client pages do.
  React.useEffect(() => {
    let cancelled = false;
    async function getCurrentUser() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data } = await supabase.auth.getUser();
        if (!cancelled) setUser(data?.user || null);
      } catch (err) {
        console.error("Error reading your session:", err);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    getCurrentUser();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch only this user's rows. owner comes from the session, never from the
  // URL, so another user's entries can never be requested. Ordering by id
  // always exists on the table, which avoids the created_at fallback dance
  // the home page needs.
  React.useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function loadEntries() {
      setError("");
      setLoadingEntries(true);
      try {
        const supabase = createBrowserSupabaseClient();
        const { data, error: loadError } = await supabase
          .from("entries")
          .select("id, title_khmer, title_english, status")
          .eq("owner", user.id)
          .order("id", { ascending: false });
        if (loadError) throw loadError;
        if (!cancelled) setEntries(data || []);
      } catch (err) {
        console.error("Error fetching your entries:", err);
        if (!cancelled) {
          setError("We couldn't load your entries. Please try again.");
        }
      } finally {
        if (!cancelled) setLoadingEntries(false);
      }
    }
    loadEntries();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <main className="contribute-wrap">
      <p className="contribute-kicker">KHMER LIVING ARCHIVE</p>
      <h1 className="contribute-title">My Entries</h1>
      <p className="contribute-subtitle">
        The entries you contributed, and where each one stands in the review
        process.
      </p>

      {loading ? (
        <p className="contribute-status">Checking your session…</p>
      ) : !user ? (
        <div className="contribute-card">
          <p className="contribute-gate-text">
            This page is for logged-in contributors. Log in or create an
            account, then come back here to track your entries.
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
      ) : (
        <>
          {/* Once signed in, always offer a way to add a new entry — whether
              the list is empty or already has pending/published rows. */}
          <div className="contribute-gate-links my-entries-add">
            <a className="contribute-gate-link" href="/contribute">
              + Add New Entry
            </a>
          </div>

          {loadingEntries ? (
            <p className="contribute-status">Loading your entries…</p>
          ) : error ? (
            <div className="contribute-card">
              <p className="contribute-gate-text">{error}</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="contribute-card">
              <p className="contribute-gate-text">
                You haven't contributed any entries yet. Once you do, they will
                appear here with their review status.
              </p>
            </div>
          ) : (
            <ul className="my-entries-list">
              {entries.map((entry) => {
                const status = entry.status || "pending";
                const label = STATUS_LABELS[status] || status;
                return (
                  <li key={entry.id} className="my-entries-item">
                    <div className="my-entries-titles">
                      <p className="my-entries-title">
                        {entry.title_khmer || "Untitled"}
                      </p>
                      {entry.title_english ? (
                        <p className="my-entries-title-english">
                          {entry.title_english}
                        </p>
                      ) : null}
                    </div>
                    <div className="my-entries-actions">
                      <span
                        className={`my-entries-status my-entries-status-${status}`}
                      >
                        {label}
                      </span>
                      {/* Pending and returned entries can be edited and
                          re-submitted. The edit page enforces ownership (and
                          blocks published entries), and saving always moves the
                          status back to pending for another review. */}
                      {status === "pending" || status === "returned" ? (
                        <a
                          className="my-entries-edit"
                          href={`/entries/${entry.id}/edit`}
                        >
                          Edit Entry
                        </a>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <a className="contribute-home-link" href="/">
        ← Back to the archive
      </a>
    </main>
  );
}
