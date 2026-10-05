// EntryCard shows one archive entry: title, description, contributor, place.
// The whole card links to the entry's own page, where the owner can edit or
// delete it. The data arrives through props from page.js.
import Link from "next/link";

export default function EntryCard({ id, title, description, contributor, place, titleEnglish }) {
  // An entry with no description yet still renders; we just skip that paragraph.
  const hasDescription =
    typeof description === "string" && description.trim().length > 0;

  const styles = {
    card: {
      padding: 24,
      backgroundColor: "#1C222C",
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: "#2E3644",
      borderRadius: 10,
    },
    link: {
      flex: 1,
      minWidth: 280,
      display: "block",
      textDecoration: "none",
      color: "inherit",
    },
    kicker: {
      fontFamily: "'Courier New', monospace",
      fontSize: 12,
      letterSpacing: 1,
      color: "#2EE6A8",
      margin: 0,
    },
    title: {
      // Khmer script needs generous line height and no letter-spacing or
      // uppercase transforms — both distort or clip Khmer glyphs.
      fontFamily:
        "'Noto Sans Khmer', 'Khmer OS Battambang', 'Khmer UI', Arial, sans-serif",
      fontSize: 20,
      lineHeight: 1.7,
      margin: "10px 0 8px",
    },
    description: {
      fontFamily:
        "'Noto Sans Khmer', 'Khmer OS Battambang', 'Khmer UI', Arial, sans-serif",
      fontSize: 15,
      lineHeight: 1.7,
      color: "#97A1B3",
      margin: 0,
    },
    meta: {
      fontFamily: "'Courier New', monospace",
      fontSize: 12,
      lineHeight: 1.6,
      color: "#97A1B3",
      margin: "16px 0 0",
    },
  };

  return (
    <Link href={`/entries/${id}`} style={styles.link}>
      <article style={styles.card}>
        <p style={styles.kicker}>ARCHIVE ENTRY</p>
        <h3 style={styles.title} dangerouslySetInnerHTML={{ __html: title + (titleEnglish ? ` ${titleEnglish}` : "") }} />
        {hasDescription && <p style={styles.description} dangerouslySetInnerHTML={{ __html: description }} />}
        <p style={styles.meta}>
          CONTRIBUTED BY {contributor} — {place}
        </p>
      </article>
    </Link>
  );
}