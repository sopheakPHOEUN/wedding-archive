// lib/ceremony-order.js
// The traditional order of a Khmer wedding ceremony, as shared by the archive's
// contributors. This is the single place that decides two things on the home
// page:
//   1. the order the rituals are listed in (Day 1 before Day 2, each in step
//      sequence), no matter what order Supabase returns them in, and
//   2. the "Day 1 … / Day 2 …" headings that frame the browsing gallery.
//
// Each ceremony is matched to the archive entries that describe it. Matching
// keys are the exact English and Khmer titles used in the archive (plus a few
// common alternate names), compared after Unicode NFC normalisation so Khmer
// vowel signs and subscripts always match, with casing and spacing ignored.
// An entry we don't recognise — say a future contributor's brand‑new ritual —
// is never dropped: it is simply kept at the end of the list.

// NFC + invisible-character cleaning, lowercased and space-collapsed. Shared by
// every comparison so Khmer spelling variations and stray zero-width marks
// (often hidden in copied text) can't break a match.
const normalize = (value) =>
  typeof value === "string"
    ? value
        .normalize("NFC")
        .replace(
          /[\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060\uFEFF\u00AD]/g,
          ""
        )
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
    : "";

// The ritual split into its traditional two days. `title` and `titleKhmer` back
// the Day headings on the home page; each `step` lists the names the archive
// uses for that ritual (English + Khmer) so entries are matched by title.
export const ceremonyDays = [
  {
    day: 1,
    title: "Day 1 — Setting Up & Blessing",
    titleKhmer: "ចូលរោង និងសូត្រមន្ត",
    steps: [
      { names: ["Krong Pali Ceremony", "ពិធីសែនក្រុងពាលី"] },
      {
        names: [
          "Holding Umbrella over Parents",
          "បាំងឆ័ត្រម្តាយ",
          "Bang Chhat Mday",
        ],
      },
      {
        names: [
          "Bok Leak Ceremony",
          "ការធ្វើធ្មេញ (បុកល័ក្ក)",
          "ពិធីធ្វើធ្មេញ ឬ បុកល័ក្ដ",
          "បុកល័ក្ដ",
        ],
      },
    ],
  },
  {
    day: 2,
    title: "Day 2 — The Main Wedding Day",
    titleKhmer: "ថ្ងៃសំពះផ្ទឹម",
    steps: [
      { names: ["Hai Goan Gomloh", "ហែរកូនកំលោះ"] },
      { names: ["Sien Doan Taa", "សែនដូនតា"] },
      {
        names: [
          "Hair Cutting Ritual",
          "ពិធីកាត់សក់បង្កក់សិរី",
          "កាត់សក់",
        ],
      },
      {
        names: [
          "Knot Tying Ceremony",
          "ពិធីសំពះផ្ទឹម និងចងដៃ",
          "Sompeas Ptem",
          "ពិធីសំពះផ្ទឹម",
          "ចងដៃ",
        ],
      },
      {
        names: ["Bongvul Pbopul", "ពិធីបង្វិលពពិល", "បង្វិលពពិល"],
      },
      {
        names: ["Preah Thong Holding the Sbai", "ពិធីព្រះថោងតោងស្បៃ"],
      },
    ],
  },
];

// A flat map from every ritual alias to its global position (which day, which
// step). Built once at load so matching an entry's titles is a single lookup.
const rankByTitle = new Map();
ceremonyDays.forEach((day, dayIndex) => {
  day.steps.forEach((step, stepIndex) => {
    for (const name of step.names) {
      // First alias wins the key; duplicate aliases are harmless.
      if (!rankByTitle.has(normalize(name))) {
        rankByTitle.set(normalize(name), {
          dayIndex,
          rank: dayIndex * 100 + stepIndex,
        });
      }
    }
  });
});

// Every title the entry carries, normalised. Accepts both the Supabase
// snake_case row columns and the local data file's camelCase fields so the same
// helper works wherever the home page gets its data from.
const entryTitles = (entry) => {
  const values = [];
  for (const key of [
    "title_khmer",
    "titleKhmer",
    "title_english",
    "titleEnglish",
  ]) {
    const value = entry && entry[key];
    if (typeof value === "string" && value.trim()) values.push(value);
  }
  return values.map(normalize);
};

// Where — if anywhere — does this entry sit in the ceremony? Returns null for
// an unrecognised ritual (a future contributor's new submission), otherwise
// `{ dayIndex, rank }` where `dayIndex` is 0 for Day 1 / 1 for Day 2 and `rank`
// is a unique number that sorts the whole archive into ceremony order.
export function ceremonyPlaceOf(entry) {
  for (const title of entryTitles(entry)) {
    const place = rankByTitle.get(title);
    if (place) return place;
  }
  return null;
}

// Return a NEW array with the entries in ceremony order: Day 1 steps, then Day 2
// steps. Entries that match no known ritual keep their original relative order
// at the end, so nothing is ever lost or reordered arbitrarily.
export function sortByCeremonyOrder(entries) {
  const list = Array.isArray(entries) ? entries : [];
  const known = [];
  const unknown = [];
  for (const entry of list) {
    const place = ceremonyPlaceOf(entry);
    if (place) known.push({ entry, place });
    else unknown.push(entry);
  }
  known.sort((a, b) => a.place.rank - b.place.rank);
  return [...known.map((k) => k.entry), ...unknown];
}

// The wedding-day choices a contributor can pick when submitting a ritual,
// plus what the review queue shows. These bilingual single-line labels keep the
// form and queue simple, exactly like the day headings and tabs.
export const WEDDING_DAY_OPTIONS = [
  { value: "day1", label: "Day 1 — ចូលរោង និងសូត្រមន្ត" },
  { value: "day2", label: "Day 2 — ថ្ងៃសំពះផ្ទឹម" },
  { value: "other", label: "Other / Not sure — មិនទាន់កំណត់" },
];

// The stored value each option maps to (also the canonical "unclassified" sent).
export const WEDDING_DAY_NONE = "other";

// Short human label for a stored wedding_day value. Blank/unknown reads as an
// em dash so reviewers can tell an unclassified entry apart at a glance.
export function weddingDayLabel(value) {
  const found = WEDDING_DAY_OPTIONS.find((option) => option.value === value);
  return found ? found.label : "—";
}