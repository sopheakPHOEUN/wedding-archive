// components/ReviewSort.js - The sort toggle for the review queue.
// Switches the queue between oldest-first (ascending) and newest-first
// (descending) submission date order. Purely presentational: it only reports
// the chosen order to ReviewQueue.js, which re-sorts the already-fetched
// pending entries in the browser. It never refetches data and never touches
// any other feature.
"use client";

import { useLanguage } from "./LanguageProvider.js";

export default function ReviewSort({ order, onChange }) {
  const { t } = useLanguage();
  return (
    <div
      className="review-sort"
      role="group"
      aria-label={t("sort.aria")}
    >
      <span className="review-sort-label">
        {t("sort.label")}
      </span>
      <button
        type="button"
        className={`review-sort-button ${
          order === "asc" ? "review-sort-active" : ""
        }`}
        aria-pressed={order === "asc"}
        onClick={() => onChange("asc")}
      >
        {t("sort.oldest")}
      </button>
      <button
        type="button"
        className={`review-sort-button ${
          order === "desc" ? "review-sort-active" : ""
        }`}
        aria-pressed={order === "desc"}
        onClick={() => onChange("desc")}
      >
        {t("sort.newest")}
      </button>
    </div>
  );
}
