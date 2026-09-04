// EntryCard shows one archive entry: title, description, contributor, place.
// It is presentational only — the data arrives through props from page.js.
export default function EntryCard({ title, description, contributor, place, titleEnglish }) {
  // An entry with no description yet still renders; we just skip that paragraph.
  const hasDescription =
    typeof description === "string" && description.trim().length > 0;

  const styles = {
    card: {
      flex: 1,
      minWidth: 280,
      padding: 24,
      backgroundColor: "#1C222C",
      border: "1px solid #2E3644",
      borderRadius: 10,
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
    <article style={styles.card}>
      <p style={styles.kicker}>ARCHIVE ENTRY</p>
      <h3 style={styles.title}>
        {title}{titleEnglish ? ` ${titleEnglish}` : ""}
      </h3>
      {hasDescription && <p style={styles.description}>{description}</p>}
      <p style={styles.meta}>
        CONTRIBUTED BY {contributor} — {place}
      </p>
    </article>
  );
}