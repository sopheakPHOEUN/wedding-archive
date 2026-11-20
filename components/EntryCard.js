// EntryCard.js - One archive entry on the home page.
// Two presentations share one card: the standard card (photo above text) and
// the wide "featured" card that opens the ritual gallery. Both keep the gold
// hairline frame, the letter-spaced entry number like a museum plate, the
// Khmer title, the romanized English title, the description, and the
// contributor/place footer. The whole card is one link to the entry's page.
// Matched search terms arrive already highlighted by page.js, so titles and
// description are rendered through dangerouslySetInnerHTML.
// Styles live in components/archive.css.
"use client";

import Link from "next/link";
import Ornament from "./Ornament.js";
import { useLanguage } from "./LanguageProvider.js";
import "./archive.css";

export default function EntryCard({
  id,
  title,
  titleEnglish,
  description,
  contributor,
  place,
  image,
  imageAlt,
  num,
  featured = false,
  matchLabel = "",
}) {
  const { t, lang } = useLanguage();
  // An entry with no description yet still renders; we just skip that paragraph.
  const hasDescription =
    typeof description === "string" && description.trim().length > 0;
  const hasImage = typeof image === "string" && image.trim().length > 0;
  const number = num ? String(num).padStart(2, "0") : "01";

  // Each entry carries its Khmer (`title`) and romanized English (`titleEnglish`)
  // names. The big line follows the site's language toggle — English mode leads
  // with the English name, Khmer mode with the Khmer name — and the other name
  // stays beneath it, so both versions are always present.
  const isKhmer = lang === "km";
  const primaryTitle = isKhmer ? title : titleEnglish;
  const secondaryTitle = isKhmer ? titleEnglish : title;
  const primaryLang = isKhmer ? "km" : "en";
  const secondaryLang = isKhmer ? "en" : "km";

  if (featured) {
    return (
      <Link href={`/entries/${id}`} className="entry-card-featured-link">
        <article className="entry-card-featured">
          <div className="entry-card-featured-media">
            {hasImage ? (
              <img
                className="entry-card-featured-image"
                src={image}
                alt={imageAlt}
                loading="lazy"
              />
            ) : (
              <div
                className="entry-card-featured-placeholder"
                aria-hidden="true"
              >
                ◆
              </div>
            )}
          </div>
          <div className="entry-card-featured-body">
            <p className="entry-card-kicker">
              {t("card.featuredEntry")} <span>№ {number}</span>
            </p>
            {matchLabel ? (
              <p className="entry-card-match">{matchLabel}</p>
            ) : null}
            {primaryTitle ? (
              <h3
                className="entry-card-title-khmer"
                lang={primaryLang}
                dangerouslySetInnerHTML={{ __html: primaryTitle }}
              />
            ) : null}
            {secondaryTitle ? (
              <p
                className="entry-card-title-english"
                lang={secondaryLang}
                dangerouslySetInnerHTML={{ __html: secondaryTitle }}
              />
            ) : null}
            {hasDescription ? (
              <p
                className="entry-card-description"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : null}
            <Ornament />
            <p className="entry-card-meta">
              <span className="entry-card-meta-label">{t("card.contributedBy")}</span>
              <span className="entry-card-meta-name">{contributor}</span>
              {place ? (
                <span className="entry-card-meta-place">
                  <span className="entry-card-meta-dot" aria-hidden="true">
                    •
                  </span>
                  {place}
                </span>
              ) : null}
            </p>
            <p className="entry-card-more">{t("card.viewEntry")}</p>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/entries/${id}`} className="entry-card-link">
      <article className="entry-card">
        {hasImage ? (
          <img
            className="entry-card-image"
            src={image}
            alt={imageAlt}
            loading="lazy"
          />
        ) : (
          <div className="entry-card-placeholder" aria-hidden="true">
            ◆
          </div>
        )}

        <div className="entry-card-body">
          <p className="entry-card-kicker">
            {t("card.archiveEntry")} <span>№ {number}</span>
          </p>
          {matchLabel ? (
            <p className="entry-card-match">{matchLabel}</p>
          ) : null}
          {primaryTitle ? (
            <h3
              className="entry-card-title-khmer"
              lang={primaryLang}
              dangerouslySetInnerHTML={{ __html: primaryTitle }}
            />
          ) : null}
          {secondaryTitle ? (
            <p
              className="entry-card-title-english"
              lang={secondaryLang}
              dangerouslySetInnerHTML={{ __html: secondaryTitle }}
            />
          ) : null}
          {hasDescription ? (
            <p
              className="entry-card-description"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : null}
          <p className="entry-card-meta">
            <span className="entry-card-meta-label">{t("card.contributedBy")}</span>
            <span className="entry-card-meta-name">{contributor}</span>
            {place ? (
              <span className="entry-card-meta-place">
                <span className="entry-card-meta-dot" aria-hidden="true">
                  •
                </span>
                {place}
              </span>
            ) : null}
          </p>
          <p className="entry-card-more">{t("card.viewEntry")}</p>
        </div>
      </article>
    </Link>
  );
}