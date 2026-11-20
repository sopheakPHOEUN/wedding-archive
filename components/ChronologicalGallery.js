// components/ChronologicalGallery.js
// The published-ritual gallery, ordered by each entry's reviewer-verified
// wedding day and sequence position rather than by guessing from the title.
//
// It receives three prepared buckets of EntryCard props from the home page:
//   - day1 / day2  — published entries with an assigned day AND a sequence
//                    position (these are the only ones shown chronologically)
//   - more         — published entries without a verified day + sequence
//                    (other / not yet classified), kept in a separate section
//
// In the "All days" view it shows Day 1, then Day 2, then the separate "More
// rituals" section; a single-day tab shows only that day. Museum-plate numbers
// run continuously across the whole active view.
"use client";

import React from "react";
import EntryCard from "./EntryCard.js";
import Reveal from "./Reveal.js";
import DayHeading from "./DayHeading.js";
import { useLanguage } from "./LanguageProvider.js";
import "./archive.css";

// The separate heading for rituals not yet placed in the ceremony order.
const MoreHeading = () => {
  const { t } = useLanguage();
  return (
    <header className="collection-day-head">
      <p className="collection-day-eyebrow">
        <span className="collection-day-eyebrow-line" aria-hidden="true" />
        <span className="collection-day-eyebrow-gem" aria-hidden="true">
          ✦
        </span>
      </p>
      <h3 className="collection-day-title" lang="en">
        {t("home.moreRituals")}
      </h3>
      <p className="collection-day-sub" lang="en">
        {t("home.moreRitualsSubtitle")}
      </p>
    </header>
  );
};

export default function ChronologicalGallery({ day1, day2, more, activeDay }) {
  // Build the sections for the active view. A day tab shows only that day;
  // the "all" overview shows Day 1, Day 2, then the separate more section.
  const sections = [];
  if (activeDay === 0) {
    if (day1?.length) {
      sections.push({ key: "day1", heading: <DayHeading dayIndex={0} />, cards: day1 });
    }
  } else if (activeDay === 1) {
    if (day2?.length) {
      sections.push({ key: "day2", heading: <DayHeading dayIndex={1} />, cards: day2 });
    }
  } else {
    if (day1?.length) {
      sections.push({ key: "day1", heading: <DayHeading dayIndex={0} />, cards: day1 });
    }
    if (day2?.length) {
      sections.push({ key: "day2", heading: <DayHeading dayIndex={1} />, cards: day2 });
    }
    if (more?.length) {
      sections.push({ key: "more", heading: <MoreHeading />, cards: more });
    }
  }
  if (sections.length === 0) return null;

  // Continuous museum-plate numbering across the whole active view.
  const numberByCard = {};
  let number = 1;
  sections.forEach((section) => {
    (section.cards || []).forEach((card) => {
      numberByCard[card.id] = number++;
    });
  });

  return (
    <>
      {sections.map((section) => (
        <section key={section.key} className="collection-day">
          {section.heading}
          <div className="gallery-grid">
            {(section.cards || []).map((card) => (
              <Reveal key={card.id} delay={(numberByCard[card.id] % 3) * 90}>
                <EntryCard {...card} num={numberByCard[card.id]} />
              </Reveal>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}