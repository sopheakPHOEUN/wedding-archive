// EntryCard.js - One archive entry on the home page.
// Photo on top (or a subtle placeholder when there is none), then the
// Khmer title, the romanized English title, the description, and a
// contributor/place footer. The whole card is one link to the entry's own
// page. Matched search terms arrive already highlighted by page.js, so
// titles and description are rendered through dangerouslySetInnerHTML.
// Styles live in components/archive.css.
import Link from "next/link";
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
}) {
  // An entry with no description yet still renders; we just skip that paragraph.
  const hasDescription =
    typeof description === "string" && description.trim().length > 0;
  const hasImage = typeof image === "string" && image.trim().length > 0;

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
          <p className="entry-card-kicker">ARCHIVE ENTRY</p>
          {title ? (
            <h3
              className="entry-card-title-khmer"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          ) : null}
          {titleEnglish ? (
            <p
              className="entry-card-title-english"
              dangerouslySetInnerHTML={{ __html: titleEnglish }}
            />
          ) : null}
          {hasDescription ? (
            <p
              className="entry-card-description"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : null}
          <p className="entry-card-meta">
            CONTRIBUTED BY {contributor} — {place}
          </p>
          <p className="entry-card-more">View entry →</p>
        </div>
      </article>
    </Link>
  );
}