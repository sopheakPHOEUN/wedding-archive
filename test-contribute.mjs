// Temporary validation test harness — deleted after running.
import { validateEntryFields, validateImageUrl } from "./lib/contribute.js";

const check = (cond, msg) => {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
  console.log("ok -", msg);
};

// Khmer chars: \u178F=ត  \u1796=ព  \u17B7=ិ  \u17B8=ី
check(validateEntryFields({ title_khmer: "\u178f" }).errors.title_khmer, "title_khmer single char rejected");
check(!validateEntryFields({ title_khmer: "\u1796\u17b7\u17b8" }).errors.title_khmer, "title_khmer khmer word accepted");
check(validateEntryFields({ title_khmer: "x".repeat(101) }).errors.title_khmer, "title_khmer 101 chars rejected");
check(validateEntryFields({ title_english: "######" }).errors.title_english, "title_english symbols rejected");
check(!validateEntryFields({ title_english: "Goan" }).errors.title_english, "title_english letters accepted");
check(validateEntryFields({ description: "abc" }).errors.description, "description too short rejected");
check(!validateEntryFields({ description: "This ritual opens the ceremony." }).errors.description, "description valid accepted");
check(validateEntryFields({ contributor: "00000" }).errors.contributor, "contributor numbers-only rejected");
check(!validateEntryFields({ contributor: "Grandpa Sam" }).errors.contributor, "contributor name accepted");
check(validateEntryFields({ place: "12345678" }).errors.place, "place numbers-only rejected");
check(!validateEntryFields({ place: "Phnom Penh" }).errors.place, "place accepted");

const trimmed = validateEntryFields({
  title_khmer: "  \u1796\u17b7\u17b8  ",
  title_english: " Goan ",
  description: "This ritual opens the ceremony.",
  contributor: " Grandpa ",
  place: " Kandal ",
});
check(trimmed.values.title_khmer === "\u1796\u17b7\u17b8" && trimmed.values.contributor === "Grandpa", "text fields trimmed");

check(!validateImageUrl("javascript:alert(1)").ok, "javascript: url rejected");
check(!validateImageUrl("not a url").ok, "garbage url rejected");
check(validateImageUrl("https://example.com/photo.jpg").ok, "https image url accepted");

console.log("ALL VALIDATION CHECKS PASSED");