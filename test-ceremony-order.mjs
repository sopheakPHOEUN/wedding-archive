// Temporary validation harness for the ceremony-order helper — run with:
//   node test-ceremony-order.mjs
// Exercises the Day 1 / Day 2 ordering against the real archive data
// (data/entries.js), and confirms that unrecognised entries are never dropped.
import entries from "./data/entries.js";
import {
  sortByCeremonyOrder,
  ceremonyPlaceOf,
  ceremonyDays,
} from "./lib/ceremony-order.js";

const check = (cond, msg) => {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
  console.log("ok -", msg);
};

// ---- 1. Structure: the ceremony is one Day 1 followed by one Day 2 ----
check(
  ceremonyDays.length === 2 &&
    ceremonyDays[0].day === 1 &&
    ceremonyDays[1].day === 2,
  "ceremony splits into Day 1 then Day 2"
);
check(
  ceremonyDays[0].steps.length === 3 && ceremonyDays[1].steps.length === 6,
  "Day 1 has 3 rituals and Day 2 has 6 rituals"
);

// ---- 2. Every current archive entry maps to a recognised step ----
check(
  entries.every((entry) => ceremonyPlaceOf(entry)),
  "every current entry matches a ceremony step"
);

// ---- 3. The archive sorts into the expected ceremony sequence ----
const expectedOrder = [
  "Krong Pali Ceremony",
  "Bok Leak Ceremony",
  "Hai Goan Gomloh",
  "Sien Doan Taa",
  "Hair Cutting Ritual",
  "Knot Typing Ceremony",
  "Bongvul Pbopul",
  "Preah Thong Holding the Sbai",
];
// Trim the raw titles (some carry a stray trailing space in the source data)
// so comparison is about the ceremony order, not about whitespace.
const sorted = sortByCeremonyOrder(entries).map((e) =>
  String(e.titleEnglish).trim()
);
check(
  JSON.stringify(sorted) === JSON.stringify(expectedOrder),
  "Day 1 rituals come before Day 2, each in ceremony order"
);

// ---- 4. Day membership is reported for grouping ----
check(
  ceremonyPlaceOf(entries.find((e) => e.id === 1)).dayIndex === 0,
  "Krong Pali belongs to Day 1"
);
check(
  ceremonyPlaceOf(entries.find((e) => e.id === 8)).dayIndex === 1,
  "Bongvul Pbopul belongs to Day 2"
);

// ---- 5. The umbrella step slots between Krong Pali and Bok Leak ----
const umbrella = ceremonyPlaceOf({ title_english: "Holding Umbrella over Parents" });
check(
  umbrella && umbrella.dayIndex === 0 && umbrella.rank === 1,
  "Umbrella-over-parents sits between Krong Pali and Bok Leak (Day 1)"
);

// ---- 6. Unrecognised entries are kept, at the end, in their own order ----
const withUnknown = sortByCeremonyOrder([
  ...entries,
  { id: 99, titleEnglish: "Brand New Ritual" },
  { id: 98, titleEnglish: "Another New Ritual" },
]);
check(
  withUnknown[withUnknown.length - 1].id === 98 &&
    withUnknown[withUnknown.length - 2].id === 99,
  "unrecognised entries stay after the ceremony, in their original order"
);

console.log("ALL CEREMONY-ORDER CHECKS PASSED");