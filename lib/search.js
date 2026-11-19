// lib/search.js - Search and highlight engine for the archive home page.
//
// One engine feeds both the result list and the card highlighting, so a
// result can only ever highlight words that actually matched inside the field
// being displayed — never words that matched somewhere else in the entry.
//
// Relevance policy (per the task brief):
//   tier 1  Exact phrase — every meaningful query term appears together and in
//                          the same order inside one field.
//   tier 2  All terms    — every meaningful term exists somewhere in the entry.
//   tier 3  Partial      — only some meaningful terms exist.
// No match  — the entry is not returned at all.
// Within a tier, results are ranked by score: matching more terms beats fewer,
// and terms that hit a title outweigh description/metadata matches. A real
// phrase adds a bonus so a phrase in a title outranks one in a description.
//
// Khmer support: every string passes through Unicode NFC normalization, and
// matching never depends on space-splitting alone — a term matches a field as
// soon as it appears anywhere inside that field's normalized content, so
// partial Khmer words match too. The exact-phrase tier is stricter: it needs a
// real, contiguous, ordered run of words (compared as normalized tokens), so
// punctuation or extra spaces between words are handled instead of breaking.

// Style for a matched term inside card titles/descriptions. Kept as an inline
// span with the archive's accent colors, same as the previous highlighter, so
// the Royal Khmer design is untouched.
const HIGHLIGHT_STYLE = "background-color: #B89555; color: #F5EFE3;";

// English function words with no search meaning. Only tokens made purely of
// ASCII letters are tested against this list, so Khmer words are never
// removed from a query.
const STOPWORDS = new Set([
  "a", "an", "the", "and", "but", "or", "nor", "for", "to", "of", "in", "on",
  "at", "by", "with", "from", "as", "is", "are", "was", "were", "be", "been",
  "being", "it", "its", "this", "that", "these", "those", "he", "she", "his",
  "her", "their", "they", "we", "you", "i", "me", "my", "not", "no", "so",
  "do", "does", "did", "if", "then", "than", "into", "over", "under", "about",
  "between", "up", "out", "off", "again", "your", "had", "has", "have", "him",
  "them", "us", "our",
]);

// A word is letters, digits, or Unicode marks (combining/spacing marks such as
// Khmer vowel signs and subscripts — category M), optionally with an
// apostrophe or hyphen kept inside it (e.g. "bride's", "two-week"). Marks must
// be included or Khmer words like សែនដូនតា get shredded at their vowel signs,
// because a Khmer vowel sign is category Mc, not L. Runs on lowercased,
// punctuation-free text.
const WORD_RE = /[\p{L}\p{N}\p{M}]+(?:['-][\p{L}\p{N}\p{M}]+)*/gu;

// Soft normalization shared by matching and highlighting: Unicode NFC, curly
// punctuation turned into ASCII, invisible/zero-width characters removed.
// Case is preserved here — displayed text must read exactly as authored.
function softNormalize(text) {
  if (typeof text !== "string") return "";
  return text
    .normalize("NFC")
    .replace(/[\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060\uFEFF\u00AD]/g, "")
    .replace(/[\u201C\u201D\u201E]/g, "\"")
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/[\u2013\u2014\u2015]/g, "-")
    .replace(/\u2026/g, "...");
}

// Match-time normalization: softNormalize, lowercased, then every run of
// non-word characters becomes a single space. Used only for "does this field
// contain this term / phrase" checks, never for what the visitor sees.
function matchNormalize(text) {
  return softNormalize(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}'-]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

// Split a lowercased, punctuation-stripped string into its words.
function wordsOf(normalizedText) {
  return normalizedText.match(WORD_RE) || [];
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Meaningful search terms from a raw query string. Returns [] when the query
// is empty or only contains stop words — such a query means "browse all".
export function tokenizeQuery(rawQuery) {
  if (typeof rawQuery !== "string" || rawQuery.trim() === "") return [];
  const seen = new Set();
  const terms = [];
  for (const word of wordsOf(matchNormalize(rawQuery))) {
    if (word.length === 0) continue;
    if (/^[a-z]+$/.test(word) && STOPWORDS.has(word)) continue;
    if (!seen.has(word)) {
      seen.add(word);
      terms.push(word);
    }
  }
  return terms;
}

// Is the needle present as a contiguous, ordered run inside the haystack?
function containsSequence(haystack, needle) {
  if (needle.length === 0) return true;
  for (let i = 0; i + needle.length <= haystack.length; i += 1) {
    let ok = true;
    for (let j = 0; j < needle.length; j += 1) {
      if (haystack[i + j] !== needle[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

// Fields searched on an entry. Title fields outweigh descriptions, which
// outweigh the contributor and place metadata.
const FIELD_KEYS = [
  "title_english",
  "title_khmer",
  "description",
  "contributor",
  "place",
];
const CAMEL_KEYS = { title_english: "titleEnglish", title_khmer: "titleKhmer" };
const FIELD_WEIGHT = {
  title_english: 4,
  title_khmer: 4,
  description: 2,
  contributor: 1,
  place: 1,
};

// Safe read of one searchable field, accepting both Supabase's snake_case
// rows and the data file's camelCase entries.
function entryField(entry, key) {
  const value = entry[key] ?? entry[CAMEL_KEYS[key]];
  if (value === undefined || value === null) return "";
  return typeof value === "string" ? value : String(value);
}

// Search and rank the archive.
//
// Returns:
//   mode    - "browse": nothing was typed, so the whole archive is returned
//             untouched (active is false). "no-meaningful": a query was typed
//             but it is only common words or punctuation, so there is nothing
//             to match on and results is empty — the caller should ask for a
//             more specific term instead of showing everything. "results": a
//             real search ran with meaningful terms, and results is sorted.
//   active  - true for "results" and "no-meaningful", false for "browse"
//   terms   - the meaningful query terms used for matching (stop words such as
//             "the" and "with" are dropped before counting and matching)
//   results - for "browse": [{ entry, ... }] in original order; for
//             "results": [{ entry, tier, label, matchedCount, termCount,
//             fieldTerms, score }] sorted by relevance. fieldTerms[k] holds the
//             terms that matched inside field k — used per-field highlighting
export function searchEntries(entries, rawQuery) {
  const list = Array.isArray(entries) ? entries : [];
  const searching = typeof rawQuery === "string" && rawQuery.trim() !== "";

  // Nothing typed (or whitespace only): browse the whole archive, untouched.
  if (!searching) {
    return {
      mode: "browse",
      active: false,
      terms: [],
      results: list.map((entry, index) => ({
        entry,
        index,
        tier: null,
        label: null,
        matchedCount: 0,
        termCount: 0,
        score: 0,
        fieldTerms: {},
      })),
    };
  }

  const terms = tokenizeQuery(rawQuery);

  // A query was typed but every term is a common word (or the query was only
  // punctuation): there is nothing meaningful to match on. Return no results —
  // never the full archive as a fallback, which would be misleading and would
  // leave nothing highlighted.
  if (terms.length === 0) {
    return { mode: "no-meaningful", active: true, terms: [], results: [] };
  }

  const results = [];

  list.forEach((entry, index) => {
    // Normalize each field once; both matching and phrase checks read from it.
    const fields = {};
    for (const key of FIELD_KEYS) {
      const match = matchNormalize(entryField(entry, key));
      fields[key] = { match, wordList: wordsOf(match) };
    }

    // Which terms actually exist inside each field.
    const fieldTerms = {};
    for (const key of FIELD_KEYS) fieldTerms[key] = [];

    for (const term of terms) {
      for (const key of FIELD_KEYS) {
        if (fields[key].match.includes(term)) fieldTerms[key].push(term);
      }
    }

    const matchedTerms = [];
    for (const key of FIELD_KEYS) {
      for (const term of fieldTerms[key]) {
        if (!matchedTerms.includes(term)) matchedTerms.push(term);
      }
    }
    if (matchedTerms.length === 0) return; // no meaningful term matched

    const termCount = terms.length;
    const matchedCount = matchedTerms.length;

    // Exact phrase: every query term, together and in order, as a contiguous
    // run of words inside one field.
    const phraseFields = FIELD_KEYS.filter((key) =>
      containsSequence(fields[key].wordList, terms)
    );

    const tier = phraseFields.length
      ? "phrase"
      : matchedCount === termCount
        ? "all"
        : "partial";
    const label =
      tier === "phrase"
        ? "Exact phrase match"
        : tier === "all"
          ? `All terms matched (${termCount}/${termCount})`
          : `Partial match (${matchedCount}/${termCount})`;

    // Relevance score within a tier: the best field weight per matched term,
    // plus a phrase bonus so a phrase in a title beats one in a description.
    let score = 0;
    for (const term of matchedTerms) {
      let best = 0;
      for (const key of FIELD_KEYS) {
        if (fieldTerms[key].includes(term)) {
          best = Math.max(best, FIELD_WEIGHT[key]);
        }
      }
      score += best;
    }
    if (phraseFields.length > 0) {
      score += 2 * Math.max(...phraseFields.map((key) => FIELD_WEIGHT[key]));
    }

    results.push({
      entry,
      index,
      tier,
      label,
      matchedCount,
      termCount,
      fieldTerms,
      score,
    });
  });

  const tierOrder = { phrase: 0, all: 1, partial: 2 };
  results.sort((a, b) => {
    if (tierOrder[a.tier] !== tierOrder[b.tier]) {
      return tierOrder[a.tier] - tierOrder[b.tier];
    }
    if (b.score !== a.score) return b.score - a.score;
    return a.index - b.index;
  });

  return { mode: "results", active: true, terms, results };
}

// Wrap every occurrence of the given terms in a highlight span. Only the
// field's own matched terms are passed in, so a word that matched in the
// description can never light up inside a title, and a word that exists only
// in another field is never marked. When there is nothing to highlight the
// original text is returned untouched.
export function highlightText(text, fieldTerms) {
  const base = softNormalize(text);
  const terms = Array.isArray(fieldTerms) ? fieldTerms.filter(Boolean) : [];
  if (!base || terms.length === 0) {
    return typeof text === "string" ? text : "";
  }
  const patterns = terms.map(escapeRegExp).sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(${patterns.join("|")})`, "gi");
  return base.replace(regex, `<span style="${HIGHLIGHT_STYLE}">$1</span>`);
}

