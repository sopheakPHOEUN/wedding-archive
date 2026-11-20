// components/DayTabs.js
// The wedding-day filter for the ritual gallery. Three buttons let the visitor
// choose between the whole two-day overview ("All days") or a single day
// ("Day 1" / "Day 2"), so browsing can be separated by day while the hero and
// About sections stay unchanged.
//
// The tab labels follow the site's language toggle: English shows
// "Day 1 — Setting Up & Blessing", Khmer shows "ថ្ងៃទី ១ ចូលរោង និងសូត្រមន្ត".
// Purely presentational: it only reports the chosen day (`onChange`) — the home
// page decides what to show.
"use client";

import React from "react";
import { ceremonyDays } from "../lib/ceremony-order.js";
import { useLanguage } from "./LanguageProvider.js";
import "./archive.css";

// Khmer numerals for the day number written in the Khmer tab label.
const KHMER_NUMBER = { 1: "១", 2: "២" };

// The complete bilingual name for a ceremony day (index into ceremonyDays):
//   en: "Day 1 — Setting Up & Blessing"
//   km: "ថ្ងៃទី ១ ចូលរោង និងសូត្រមន្ត"
const dayName = (index) => {
  const day = ceremonyDays[index];
  if (!day) return { en: "", km: "" };
  const n = KHMER_NUMBER[day.day] || String(day.day);
  return {
    en: day.title || "",
    km: `ថ្ងៃទី ${n} ${day.titleKhmer}`,
  };
};

export default function DayTabs({ activeDay, onChange }) {
  const { lang } = useLanguage();
  const isKhmer = lang === "km";
  const allLabel = isKhmer ? "ទាំងអស់" : "All days";

  return (
    <nav className="day-tabs" aria-label="ថ្ងៃទាំងពីរនៃពិធីរៀបការ · Wedding days">
      <button
        type="button"
        className={`day-tab${activeDay === null ? " is-active" : ""}`}
        onClick={() => onChange(null)}
      >
        <span className="day-tab-badge" aria-hidden="true">
          ✦
        </span>
        <span className="day-tab-label" lang={lang}>
          {allLabel}
        </span>
      </button>

      {ceremonyDays.map((day, index) => {
        const { en, km } = dayName(index);
        return (
          <button
            key={day.day}
            type="button"
            className={`day-tab${activeDay === index ? " is-active" : ""}`}
            onClick={() => onChange(index)}
            aria-pressed={activeDay === index}
          >
            <span className="day-tab-badge" aria-hidden="true">
              {String(day.day).padStart(2, "0")}
            </span>
            <span className="day-tab-label" lang={lang}>
              {isKhmer ? km : en}
            </span>
          </button>
        );
      })}
    </nav>
  );
}