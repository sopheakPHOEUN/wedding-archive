// components/ReviewQueue.js - The reviewer's queue of pending entries.
// The server page (app/review/page.js) vets the session, runs the is_reviewer
// RPC, and passes the pending entries in as props. This component only owns the
// two decisions: Publish calls review_entry with decision 'published', Return
// calls it with 'returned'. An entry leaves the list only when the RPC returns
// no error AND exactly true; on any failure an error banner appears and the
// entry stays put. The reviewer never sees who contributed an entry.
"use client";

import React from "react";
import { createBrowserSupabaseClient } from "../lib/supabase-browser.js";
import "./contribute.css";
import "./review.css";

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

export default function ReviewQueue({ entries, loadError }) {
  const [items, setItems] = React.useState(entries);
  const [reviewing, setReviewing] = React.useState(null); // { entryId, decision }
  const [lastResult, setLastResult] = React.useState(null); // { type, text }

  const handleReview = async (entry, decision) => {
    if (reviewing) return;
    setReviewing({ entryId: entry.id, decision });
    setLastResult(null);
    const verb = decision === "published" ? "published" : "returned";
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
      // The RPC returns a boolean. Anything but true means the database did not
      // apply the decision, so it is never reported as a success.
      if (data !== true) {
        console.error("review_entry returned", data, "for", entry.id, decision);
        setLastResult({
          type: "error",
          text: `"${displayTitle(entry)}" wasn't ${verb}; only an authorized reviewer can change an entry's status.`,
        });
        return;
      }
      // Success: drop the entry from the queue. The failure paths above keep it.
      setItems((current) => current.filter((item) => item.id !== entry.id));
      setLastResult({
        type: "success",
        text: `"${displayTitle(entry)}" was ${verb}.`,
      });
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
      ) : items.length === 0 ? (
        <div className="contribute-card">
          <p className="contribute-gate-text">
            No entries are waiting for review right now. — មិនមានធាតុកំពុងរង់ចាំការពិនិត្យនៅពេលនេះទេ។
          </p>
        </div>
      ) : (
        <ul className="review-list">
          {items.map((entry) => (
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
                <p className="review-item-description">{entry.description}</p>
              ) : null}

              <p className="review-item-meta">
                LOCATION — {entry.place || "Not provided"}
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
                    : "Publish — ផ្សព្វផ្សាយ"}
                </button>
                <button
                  type="button"
                  className="review-button review-button-return"
                  disabled={processingFor(entry.id)}
                  onClick={() => handleReview(entry, "returned")}
                >
                  {processingDecision(entry.id, "returned")
                    ? "Returning…"
                    : "Return for change — បញ្ជូនត្រឡប់ដើម្បីកែប្រែ"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}