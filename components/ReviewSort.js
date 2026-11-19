// components/ReviewSort.js - The sort toggle for the review queue.
// Switches the queue between oldest-first (ascending) and newest-first
// (descending) submission date order. Purely presentational: it only reports
// the chosen order to ReviewQueue.js, which re-sorts the already-fetched
// pending entries in the browser. It never refetches data and never touches
// any other feature.
"use client";

export default function ReviewSort({ order, onChange }) {
  return (
    <div
      className="review-sort"
      role="group"
      aria-label="Sort the review queue by submission date"
    >
      <span className="review-sort-label">
        Sort by date — តម្រៀបតាមកាលបរិច្ឆេទ
      </span>
      <button
        type="button"
        className={`review-sort-button ${
          order === "asc" ? "review-sort-active" : ""
        }`}
        aria-pressed={order === "asc"}
        onClick={() => onChange("asc")}
      >
        Oldest first — ចាស់ជាងគេមុន
      </button>
      <button
        type="button"
        className={`review-sort-button ${
          order === "desc" ? "review-sort-active" : ""
        }`}
        aria-pressed={order === "desc"}
        onClick={() => onChange("desc")}
      >
        Newest first — ថ្មីបំផុតមុន
      </button>
    </div>
  );
}
