// Temporary validation harness for the search engine — run with:
//   node test-search.mjs
// Exercised against the real archive data (data/entries.js), not mock data.
import entries from "./data/entries.js";
import {
  tokenizeQuery,
  searchEntries,
  highlightText,
} from "./lib/search.js";

const check = (cond, msg) => {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
  console.log("ok -", msg);
};

// ---- 1. Tokenization: punctuation, extra spaces, stop words, Khmer ----
check(
  JSON.stringify(tokenizeQuery("Krong Pali,   ceremony")) ===
    JSON.stringify(["krong", "pali", "ceremony"]),
  "punctuation + extra spaces collapsed into meaningful terms"
);
check(
  JSON.stringify(tokenizeQuery("the and of the")) === "[]",
  "stop-word-only query yields no terms"
);
check(
  JSON.stringify(tokenizeQuery("សែនដូនតា")) ===
    '["សែនដូនតា"]',
  "Khmer word kept verbatim (NFC, not stripped by stop words)"
);
check(JSON.stringify(tokenizeQuery("")) === "[]", "empty query yields no terms");
check(JSON.stringify(tokenizeQuery("   ")) === "[]", "whitespace query yields no terms");

// ---- 2. Exact phrase that exists ----
{
  const { results, active } = searchEntries(entries, "Hair Cutting");
  check(active === true, "query over archive is active");
  check(results.length === 1, "exact phrase resolves to the single matching entry");
  check(results[0].entry.id === 5 && results[0].tier === "phrase", "exact phrase tier for a real phrase");
  check(results[0].label === "Exact phrase match", "exact phrase label shown");
}

// ---- 3. Phrase where only the first word exists ----
{
  const { results } = searchEntries(entries, "Hair Zzzz");
  check(results.length === 1 && results[0].entry.id === 5, "first word alone still matches");
  check(results[0].tier === "partial" && results[0].label === "Partial match (1/2)", "partial label with its count");
  check(results[0].matchedCount === 1 && results[0].termCount === 2, "partial counts are correct");
}

// ---- 4. Long query where some words do not exist ----
{
  const { results, terms } = searchEntries(entries, "ceremony dowry elephant");
  check(JSON.stringify(terms) === JSON.stringify(["ceremony", "dowry", "elephant"]), "long query tokenized");
  check(results.length === 7, "every entry matching at least one term is returned");
  check(results[0].entry.id === 1 && results[0].tier === "partial", "title match ranks top inside a partial tier");
}

// ---- 5. Words that exist in different fields ----
{
  const { results } = searchEntries(entries, "Sien Tea");
  check(results.length === 1 && results[0].entry.id === 4, "terms across different fields match one entry");
  check(results[0].tier === "all" && results[0].label === "All terms matched (2/2)", "all-terms label with its count");
  check(
    JSON.stringify(results[0].fieldTerms.title_english) === JSON.stringify(["sien"]) &&
      JSON.stringify(results[0].fieldTerms.description) === JSON.stringify(["tea"]),
    "per-field matched terms are separated correctly"
  );
  check(results[0].fieldTerms.title_english.indexOf("tea") === -1, "title does not claim a term that only matched elsewhere");
}

// ---- 6. Query with punctuation and extra spaces ----
{
  const { results, terms } = searchEntries(entries, "Ceremony ,   hair");
  check(JSON.stringify(terms) === JSON.stringify(["ceremony", "hair"]), "messy spacing/punctuation cleaned");
  check(results.every((r) => r.tier === "partial"), "no single entry holds both terms, so all are partial");
}

// ---- 7. Khmer search ----
{
  const { results } = searchEntries(entries, "សែនដូនតា");
  check(results.length === 1 && results[0].entry.id === 4 && results[0].tier === "phrase", "full Khmer phrase matches exactly");
}
{
  // "សែន" is a substring of both entry 1 (ពិធីសែនក្រុងពាលី) and entry 4
  // (សែនដូនតា), so two entries match — each as an all-terms (1/1) hit.
  const { results } = searchEntries(entries, "សែន");
  check(results.length === 2, "partial Khmer word reaches every title containing it");
  check(
    results.some((r) => r.entry.id === 4) && results.every((r) => r.tier === "all"),
    "partial Khmer word is an all-terms match"
  );
  check(
    results.every((r) => r.label === "All terms matched (1/1)"),
    "partial Khmer word labelled correctly"
  );
}

// ---- 8. English search (a shared word across several entries) ----
{
  const { results } = searchEntries(entries, "wedding");
  check(results.length >= 4, "English word reaches several entries");
  check(results.some((r) => r.entry.id === 7 && r.tier === "phrase"), "a whole-word hit is an exact phrase");
}

// ---- 9. No matching terms ----
{
  const { results, active } = searchEntries(entries, "zzzz qqqq");
  check(active === true && results.length === 0, "no meaningful term matches -> no results");
}

// ---- 10. Empty query ----
{
  const { results, active } = searchEntries(entries, "");
  check(active === false && results.length === entries.length, "empty query browses the whole archive");
  check(results[0].label === null && results[0].entry.id === 1, "no label, original order when not searching");
}

// ---- 11. Stop-word policy (common words must never drive results) ----
check(
  JSON.stringify(tokenizeQuery("with the and of in to")) === "[]",
  "common words alone yield no meaningful terms"
);
check(
  JSON.stringify(tokenizeQuery("Khmer")) === '["khmer"]',
  "a meaningful single word like 'Khmer' is preserved"
);
{
  const s = searchEntries(entries, "with the");
  check(s.mode === "no-meaningful" && s.active === true, "all-common-word query is flagged, not a browse");
  check(s.results.length === 0, "all-common-word query returns no archives");
}
{
  const s = searchEntries(entries, "the wedding");
  check(JSON.stringify(s.terms) === JSON.stringify(["wedding"]), "stop word ignored when mixed with a meaningful word");
  check(s.results.length === 6 && s.results[0].tier === "phrase", "'the wedding' searches only for 'wedding'");
}
{
  const s = searchEntries(entries, "Khmer wedding");
  check(s.results[0].entry.id === 2 && s.results[0].tier === "all", "'Khmer wedding' ranks the all-terms entry first");
}
{
  const s = searchEntries(entries, "Khmer unknownword");
  check(s.results.length === 1 && s.results[0].entry.id === 2, "'Khmer unknownword' keeps the real match");
  check(s.results[0].label === "Partial match (1/2)", "'Khmer unknownword' clearly labelled partial");
}
{
  const s = searchEntries(entries, "xyz123");
  check(s.mode === "results" && s.results.length === 0, "a real term with no match returns nothing, no fallback");
}
{
  const s = searchEntries(entries, "Khmer");
  check(s.results.length === 1 && s.results[0].entry.id === 2, "single meaningful word 'Khmer' still finds results");
}

// ---- Highlighting: consistent with matching, and accurate per field ----
const SPAN = '<span style="background-color: #B89555; color: #F5EFE3;">';
check(
  highlightText("Hair Cutting Ritual", ["hair", "cutting"]).includes(`${SPAN}Hair</span>`),
  "highlight preserves original capitalization"
);
check(
  highlightText("Hair Cutting Ritual", ["hair", "cutting"]).includes(`${SPAN}Cutting</span>`),
  "multiple matched words highlighted in one sentence"
);
check(
  !highlightText("Hair Cutting Ritual", ["hair"]).includes(`${SPAN}Cutting</span>`),
  "unmatched word in the same sentence is not highlighted"
);
check(
  highlightText("the bride\u2019s scarf", ["bride's"]).includes(">bride's</span>"),
  "smart apostrophe unified so a queried term highlights accurately"
);
check(
  highlightText("ពិធីសែនក្រុងពាលី", ["សែន"]).includes("សែន</span>"),
  "Khmer substring highlighted correctly"
);
check(highlightText("Hair Cutting", []) === "Hair Cutting", "no terms -> original text returned untouched");

// A word that only exists in the description must never light up in the title.
{
  const { results } = searchEntries(entries, "Sien Tea");
  const r = results[0];
  const titleHtml = highlightText(r.entry.titleEnglish, r.fieldTerms.title_english);
  check(titleHtml.includes(`${SPAN}Sien</span>`), "title highlights its own matched term");
  check(!titleHtml.includes(`${SPAN}Tea</span>`), "title does not highlight a term that matched elsewhere");
}

console.log("ALL SEARCH CHECKS PASSED");