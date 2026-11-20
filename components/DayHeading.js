// components/DayHeading.js
// The elegant heading for one wedding day, shared by the overview gallery and
// the single-day view so both always look identical.
//
// The heading follows the site's language toggle: in English it reads
// "Day 1 — Setting Up & Blessing"; in Khmer it reads "ថ្ងៃទី ១ ចូលរោង និងសូត្រមន្ត".
// The other language is shown beneath as a smaller secondary line, so a
// Khmer-mode visitor still sees the English day name and vice versa.
"use client";

import { ceremonyDays } from "../lib/ceremony-order.js";
import { useLanguage } from "./LanguageProvider.js";
import "./archive.css";

// Khmer numerals for the day number used in the Khmer title.
const KHMER_NUMBER = { 1: "១", 2: "២" };

export default function DayHeading({ dayIndex }) {
  const { lang } = useLanguage();
  const day = ceremonyDays[dayIndex];
  if (!day) return null;

  // The two complete, bilingual day names.
  const englishTitle = day.title || ""; // e.g. "Day 1 — Setting Up & Blessing"
  const dayNumber = KHMER_NUMBER[day.day] || String(day.day);
  const khmerTitle = `ថ្ងៃទី ${dayNumber} ${day.titleKhmer}`; // e.g. "ថ្ងៃទី ១ ចូលរោង និងសូត្រមន្ត"

  const isKhmer = lang === "km";
  const primary = isKhmer ? khmerTitle : englishTitle;
  const secondary = isKhmer ? englishTitle : khmerTitle;

  return (
    <header className="collection-day-head">
      <p className="collection-day-eyebrow">
        <span className="collection-day-eyebrow-line" aria-hidden="true" />
        <span className="collection-day-eyebrow-gem" aria-hidden="true">
          ◆
        </span>
      </p>
      <h3 className="collection-day-title" lang={isKhmer ? "km" : "en"}>
        {primary}
      </h3>
      <p className="collection-day-sub" lang={isKhmer ? "en" : "km"}>
        {secondary}
      </p>
    </header>
  );
}