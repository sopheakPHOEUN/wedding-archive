// components/ReviewClassification.js
// The reviewer's classification controls for one pending entry: a wedding-day
// select and an optional sequence-position number input. It is purely
// presentational — editing these fields never saves anything; the parent
// (ReviewQueue) reads the values back when Publish / Save day & position runs,
// or when the reviewer just changes a classification without publishing.
//
// Leaving the day blank keeps the entry "pending classification" (stored as
// NULL), so it stays out of the Day 1 / Day 2 galleries until a curator places
// it; sequence blank means "no verified position yet".
"use client";

import React from "react";
import { WEDDING_DAY_OPTIONS } from "../lib/ceremony-order.js";
import { useLanguage } from "./LanguageProvider.js";
import "./review.css";

export default function ReviewClassification({
  day,
  sequence,
  onChange,
  disabled = false,
}) {
  const { t } = useLanguage();

  const updateDay = (event) => onChange({ day: event.target.value, sequence });
  const updateSequence = (event) =>
    onChange({ day, sequence: event.target.value });

  return (
    <div className="review-classify">
      <div className="review-classify-field">
        <label className="review-classify-label" htmlFor="classify-day">
          {t("review.weddingDayLabel")}
        </label>
        <select
          id="classify-day"
          className="review-classify-select"
          value={day}
          onChange={updateDay}
          disabled={disabled}
        >
          <option value="">
            {t("review.pendingClassification")}
          </option>
          {WEDDING_DAY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="review-classify-field">
        <label className="review-classify-label" htmlFor="classify-sequence">
          {t("review.sequenceLabel")}
        </label>
        <input
          id="classify-sequence"
          className="review-classify-input"
          type="number"
          min="1"
          step="1"
          placeholder="1, 2, 3…"
          value={sequence}
          onChange={updateSequence}
          disabled={disabled}
        />
        <p className="review-classify-hint">{t("review.sequenceHint")}</p>
      </div>
    </div>
  );
}