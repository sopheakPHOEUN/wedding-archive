import collection from "../collection.config.js";
import EntryCard from "../components/EntryCard.js";

// Sample entries for the EntryCard component.
// TODO: replace both placeholder objects with your two real entries
// (title, description, contributor, place) from your own collection.
const entries = [
  {
    title: "Hai Goan Gomloh - ហែរកូនកំលោះ",
    description: "Cambodian weddings begin with the groom and his family traveling to meet the bride’s family, bearing gifts for dowry, such as: meats, fruits, pastries, drinks and desserts. Guests are handed matching gold trays of fruits and gifts as they arrive so they can join in the procession, symbolic of his journey to the bride’s home. The trays will be arranged on the table. Family members and friends are introduced, and wedding rings will be exchanged.",
    contributor: "Local elder",
    place: "Kompong Cham Province, Cambodia",
  },
  {
    // The empty description is on purpose: EntryCard handles blanks gracefully.
    title: "Sien Doan Taa - សែនដូនតា",
    description: "This step is called as Tea Ceremony, at which the bride and groom offer tea to honor the spirits of their ancestors. It is a way for them to honor those who have passed before them and to invite their spirit to celebrate their wedding. It is a time to remember those near and dear to their hearts and remember to include them in their important life events.",
    contributor: "Local elder",
    place: "Kompong Cham Province",
  },
];

const styles = {
  wrap: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "80px 24px",
  },
  kicker: {
    fontFamily: "'Courier New', monospace",
    color: "#2EE6A8",
    fontSize: 14,
    letterSpacing: 1,
  },
  title: {
    fontSize: 48,
    fontWeight: 700,
    margin: "16px 0 12px",
    lineHeight: 1.1,
  },
  description: {
    fontSize: 18,
    color: "#97A1B3",
    lineHeight: 1.6,
    margin: 0,
  },
  card: {
    marginTop: 48,
    padding: 24,
    backgroundColor: "#1C222C",
    border: "1px solid #2E3644",
    borderRadius: 10,
  },
  cardLabel: {
    fontFamily: "'Courier New', monospace",
    fontSize: 12,
    color: "#97A1B3",
    margin: 0,
  },
  cardValue: {
    fontSize: 16,
    margin: "6px 0 0",
  },
  entryRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 48,
  },
  count: {
    fontFamily: "'Courier New', monospace",
    fontSize: 14,
    color: "#2EE6A8",
    marginTop: 48,
  },
  footer: {
    marginTop: 64,
    paddingTop: 24,
    borderTop: "1px solid #2E3644",
    fontSize: 13,
    color: "#5A6373",
  },
};

export default function Home() {
  return (
    <main style={styles.wrap}>
      <p style={styles.kicker}>KHMER LIVING ARCHIVE</p>
      <h1 style={styles.title}>{collection.name}</h1>
      <p style={styles.description}>{collection.description}</p>

      <div style={styles.card}>
        <p style={styles.cardLabel}>CURATED BY</p>
        <p style={styles.cardValue}>{collection.curator}</p>
      </div>
      <div style={styles.card}>
        <p style={styles.cardLabel}>SOURCE</p>
        <p style={styles.cardValue}>{collection.source}</p>
      </div>

      <div style={styles.entryRow}>
        {entries.map((entry, index) => (
          <EntryCard key={index} {...entry} />
        ))}
      </div>

      <p style={styles.count}>
        entries in the archive: {entries.length} (sample entries for now)
      </p>

      <footer style={styles.footer}>
        Built in ICT 340 — Vibe Coding, American University of Phnom Penh, Fall
        2026. This archive is under construction all semester. Come back in
        December.
      </footer>
    </main>
  );
}
