// components/ReviewQueue.js - The reviewer's queue of pending entries.
// The server page (app/review/page.js) vets the session, runs the is_reviewer
// RPC, and passes the pending entries in as props. This component only owns the
// two decisions: Publish calls review_entry with decision 'published', Return
// calls it with 'returned'. An entry leaves the list only when the RPC returns
// no error AND exactly true; on any failure an error banner appears and the
// entry stays put. The reviewer never sees who contributed an entry.
//
// Above the list, ReviewSort.js lets the reviewer flip between oldest-first
// (ascending) and newest-first (descending) submission date order. That sort
// is applied in the browser to the entries the server already fetched, so no
// data is refetched and the Publish / Return flow is untouched.
"use client";

import React from "react";
import { createBrowserSupabaseClient } from "../lib/supabase-browser.js";
import ReviewSort from "./ReviewSort.js";
import { useLanguage } from "./LanguageProvider.js";
import "./contribute.css";
import "./review.css";

const displayTitle = (entry, fallback) =>
  entry.title_khmer || entry.title_english || fallback;

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
  const { t, lang } = useLanguage();
  const [items, setItems] = React.useState(entries);
  const [reviewing, setReviewing] = React.useState(null); // { entryId, decision }
  const [lastResult, setLastResult] = React.useState(null); // { type, text }
  // "asc" = submitted oldest first (matches how the server page orders the
  // queue); "desc" = newest first. Only used to reorder the fetched rows.
  const [sortOrder, setSortOrder] = React.useState("asc");

  // Re-sort the already-fetched queue by submission date. Entries without a
  // usable date sort as the oldest. The copy keeps items untouched, so the
  // Publish / Return flow below continues to work on the same list.
  const sortedItems = React.useMemo(() => {
    const timeOf = (value) => {
      if (!value) return 0;
      const time = new Date(value).getTime();
      return Number.isNaN(time) ? 0 : time;
    };
    const direction = sortOrder === "desc" ? -1 : 1;
    return [...items].sort(
      (a, b) => (timeOf(a.created_at) - timeOf(b.created_at)) * direction
    );
  }, [items, sortOrder]);

  const handleReview = async (entry, decision) => {
    if (reviewing) return;
    setReviewing({ entryId: entry.id, decision });
    setLastResult(null);
    const verb =
      lang === "km"
        ? decision === "published"
          ? "បានផ្សព្វផ្សាយ"
          : "បានបញ្ជូនត្រឡប់វិញ"
        : decision === "published"
          ? "published"
          : "returned";
    const title = displayTitle(entry, t("common.untitled"));
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
          text: t("review.saveError", { title }),
        });
        return;
      }
      // The RPC returns a boolean. Anything but true means the database did not
      // apply the decision, so it is never reported as a success.
      if (data !== true) {
        console.error("review_entry returned", data, "for", entry.id, decision);
        setLastResult({
          type: "error",
          text: t("review.notAuthorized", { title, verb }),
        });
        return;
      }
      // Success: drop the entry from the queue. The failure paths above keep it.
      setItems((current) => current.filter((item) => item.id !== entry.id));
      setLastResult({
        type: "success",
        text: t("review.success", { title, verb }),
      });
    } catch (error) {
      console.error("Review error:", error);
      setLastResult({
        type: "error",
        text: t("review.saveError", { title }),
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
            {t("review.empty")}
          </p>
        </div>
      ) : (
        <>
          <ReviewSort order={sortOrder} onChange={setSortOrder} />
          <ul className="review-list">
            {sortedItems.map((entry) => (
            <li key={entry.id} className="review-item">
              <div className="review-item-titles">
                <p className="review-item-title">
                  {entry.title_khmer || t("common.untitled")}
                </p>
                {entry.title_english ? (
                  <p className="review-item-title-english">
                    {entry.title_english}
                  </p>
                ) : null}
                <span className="review-pending-chip">
                  {t("status.pending")}
                </span>
              </div>

              {entry.image ? (
                <img
                  className="review-item-photo"
                  src={entry.image}
                  alt={
                    entry.title_english ||
                    entry.title_khmer ||
                    t("common.entryPhoto")
                  }
                />
              ) : null}

              {entry.description ? (
                <p className="review-item-description">{entry.description}</p>
              ) : null}

              {entry.description_khmer ? (
                <p className="review-item-description review-item-description-khmer">
                  {entry.description_khmer}
                </p>
              ) : null}

              <p className="review-item-meta">
                {t("review.location", { place: entry.place || t("entry.notProvided") })}
              </p>
              {entry.created_at ? (
                <p className="review-item-meta">
                  {t("review.submitted", { date: formatSubmitted(entry.created_at) })}
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
                    ? t("review.publishing")
                    : t("review.publish")}
                </button>
                <button
                  type="button"
                  className="review-button review-button-return"
                  disabled={processingFor(entry.id)}
                  onClick={() => handleReview(entry, "returned")}
                >
                  {processingDecision(entry.id, "returned")
                    ? t("review.returning")
                    : t("review.return")}
                </button>
              </div>
            </li>
          ))}
          </ul>
        </>
      )}
    </>
  );
}