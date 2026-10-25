// app/admin/review/page.js - The reviewer's queue of pending entries.
// Open to authorized reviewers only. Access is decided in three layers:
//  1. This page checks the session and the is_reviewer RPC before rendering
//     anything (non-reviewers get a plain "not authorized" card).
//  2. RLS only lets reviewers read pending rows, so a non-reviewer's query
//     returns nothing.
//  3. The review_entry RPC is the authority on the write: it checks reviewer
//     status inside the database, so ordinary contributors can never flip a
//     status even if they reach the buttons. We check both the RPC error and
//     its returned boolean, and only claim success when it came back true.
// Layout reuses the .contribute-* classes; queue styles live in review.css.
"use client";

import React from "react";
import { createBrowserSupabaseClient } from "../../../lib/supabase-browser.js";
import "../../../components/contribute.css";
import "../../../components/review.css";

const displayTitle = (entry) =>
  entry.title_khmer || entry.title_english || "Untitled";

const formatSubmitted = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function AdminReviewPage() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [checkingReviewer, setCheckingReviewer] = React.useState(true);
  const [isReviewer, setIsReviewer] = React.useState(false);
  const [entries, setEntries] = React.useState([]);
  const [loadingEntries, setLoadingEntries] = React.useState(false);
  const [loadError, setLoadError] = React.useState("");
  const [reviewing, setReviewing] = React.useState(null); // { entryId, decision }
  const [lastResult, setLastResult] = React.useState(null); // { type, text }

  // Load the entries waiting for review. Called once access is confirmed and
  // again after every successful review so the queue stays fresh.
  const refreshPending = React.useCallback(async () => {
    setLoadError("");
    setLoadingEntries(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("entries")
        .select(
          "id, title_khmer, title_english, description, contributor, place, image, created_at"
        )
        .eq("status", "pending")
        .order("id", { ascending: false });
      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching pending entries:", error);
      setLoadError("We couldn't load the review queue. Please try again.");
    } finally {
      setLoadingEntries(false);
    }
  }, []);

  // Read the session, then confirm reviewer status. If the is_reviewer RPC
  // errors we cannot prove reviewer status, so access defaults to denied.
  React.useEffect(() => {
    let cancelled = false;
    async function checkAccess() {
      try {
        const supabase = createBrowserSupabaseClient();
        const { data: sessionData } = await supabase.auth.getUser();
        const sessionUser = sessionData?.user || null;
        if (cancelled) return;
        setUser(sessionUser);
        if (sessionUser) {
          const { data, error } = await supabase.rpc("is_reviewer");
          if (error) {
            console.error("is_reviewer RPC error:", error);
          } else if (data === true) {
            if (!cancelled) setIsReviewer(true);
          }
        }
      } catch (error) {
        console.error("Error checking review access:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setCheckingReviewer(false);
        }
      }
    }
    checkAccess();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!checkingReviewer && isReviewer) {
      refreshPending();
    }
  }, [checkingReviewer, isReviewer, refreshPending]);

  const handleReview = async (entry, decision) => {
    if (reviewing) return;
    setReviewing({ entryId: entry.id, decision });
    setLastResult(null);
    const label = decision === "published" ? "published" : "returned";
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.rpc("review_entry", {
        entry_id: entry.id,
        decision,
      });
      if (error) {
        console.error("review_entry RPC error:", error);
        setLastResult({
          type: "error",
          text: `We couldn't save the review of "${displayTitle(entry)}". Please try again.`,
        });
        return;
      }
      // The RPC returns a boolean. Anything but true means the database did
      // not apply the decision, so it is never reported as a success.
      if (data !== true) {
        console.error("review_entry returned", data, "for", entry.id, decision);
        setLastResult({
          type: "error",
          text: `"${displayTitle(entry)}" wasn't ${label}; only an authorized reviewer can change an entry's status.`,
        });
        return;
      }
      setLastResult({
        type: "success",
        text: `"${displayTitle(entry)}" was ${label}.`,
      });
      await refreshPending();
    } catch (error) {
      console.error("Review error:", error);
      setLastResult({
        type: "error",
        text: `We couldn't save the review of "${displayTitle(entry)}". Please try again.`,
      });
    } finally {
      setReviewing(null);
    }
  };

  // True while this row's buttons are waiting on the RPC.
  const processingFor = (id) => reviewing !== null && reviewing.entryId === id;
  const processingDecision = (id, decision) =>
    reviewing !== null &&
    reviewing.entryId === id &&
    reviewing.decision === decision;

  return (
    <main className="contribute-wrap">
      <p className="contribute-kicker">KHMER LIVING ARCHIVE</p>
      <h1 className="contribute-title">Review Queue</h1>
      <p className="contribute-subtitle">
        Entries waiting for review. Publishing adds them to the public archive;
        returning sends them back to the contributor for changes.
      </p>

      {loading ? (
        <p className="contribute-status">Checking your session…</p>
      ) : !user ? (
        <div className="contribute-card">
          <p className="contribute-gate-text">
            This page is for authorized reviewers. Log in with a reviewer
            account, then come back here to review pending entries.
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
      ) : checkingReviewer ? (
        <p className="contribute-status">Checking your review access…</p>
      ) : !isReviewer ? (
        <div className="contribute-card">
          <p className="contribute-gate-text">
            This page is for authorized reviewers only. If you think you should
            be reviewing entries, ask the archive administrator to grant you
            reviewer access.
          </p>
          <div className="contribute-gate-links">
            <a className="contribute-gate-link" href="/">
              Back to the archive
            </a>
          </div>
        </div>
      ) : (
        <>
          {lastResult ? (
            <p
              className={`review-result-banner ${
                lastResult.type === "success"
                  ? "review-result-success"
                  : "review-result-error"
              }`}
              role={lastResult.type === "success" ? "status" : "alert"}
            >
              {lastResult.text}
            </p>
          ) : null}

          {loadError ? (
            <div className="contribute-card">
              <p className="contribute-gate-text">{loadError}</p>
            </div>
          ) : loadingEntries ? (
            <p className="contribute-status">Loading the review queue…</p>
          ) : entries.length === 0 ? (
            <div className="contribute-card">
              <p className="contribute-gate-text">
                No entries are waiting for review right now.
              </p>
            </div>
          ) : (
            <ul className="review-list">
              {entries.map((entry) => (
                <li key={entry.id} className="review-item">
                  <div className="review-item-titles">
                    <p className="review-item-title">
                      {entry.title_khmer || "Untitled"}
                    </p>
                    {entry.title_english ? (
                      <p className="review-item-title-english">
                        {entry.title_english}
                      </p>
                    ) : null}
                    <span className="review-pending-chip">
                      Pending — កំពុងរង់ចាំការពិនិត្យ
                    </span>
                  </div>

                  {entry.image ? (
                    <img
                      className="review-item-photo"
                      src={entry.image}
                      alt={entry.title_english || entry.title_khmer || "Entry photo"}
                    />
                  ) : null}

                  {entry.description ? (
                    <p className="review-item-description">
                      {entry.description}
                    </p>
                  ) : null}

                  <p className="review-item-meta">
                    CONTRIBUTED BY {entry.contributor || "Not provided"} —{" "}
                    {entry.place || "Place not provided"}
                  </p>
                  {entry.created_at ? (
                    <p className="review-item-meta">
                      SUBMITTED {formatSubmitted(entry.created_at)}
                    </p>
                  ) : null}

                  <div className="review-item-actions">
                    <button
                      type="button"
                      className="review-button review-button-publish"
                      disabled={processingFor(entry.id)}
                      onClick={() => handleReview(entry, "published")}
                    >
                      {processingDecision(entry.id, "published")
                        ? "Publishing…"
                        : "Publish"}
                    </button>
                    <button
                      type="button"
                      className="review-button review-button-return"
                      disabled={processingFor(entry.id)}
                      onClick={() => handleReview(entry, "returned")}
                    >
                      {processingDecision(entry.id, "returned")
                        ? "Returning…"
                        : "Return for Changes"}
                    </button>
                  </div>
                </li>
              ))}
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
