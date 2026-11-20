import fs from "fs";

const L = fs.readFileSync("lib/i18n.js", "utf8").split("\n");
// L[302] is line 303 (1-indexed): the new description_khmer key
const base = L[301].replace(/^\s*"[^"]*":\s*"|",\s*$/g, "").normalize("NFC");
const newer = L[302].replace(/^\s*"[^"]*":\s*"|",\s*$/g, "").normalize("NFC");
console.log("302 base codepoints:", [...base].map((c) => c.codePointAt(0).toString(16)).join(" "));
console.log("303 new  codepoints:", [...newer].map((c) => c.codePointAt(0).toString(16)).join(" "));
// The new label must equal base + "ជាភាសាខ្មែរ" (i.e. base is a prefix)
const suffix = "\u1797\u17b6\u179f\u17b6\u1781\u17d2\u1798\u17c2\u179a"; // ជាភាសាខ្មែរ
console.log("base is prefix of new label:", newer.startsWith(base));
console.log("new label equals base+suffix:", newer === base + suffix);
console.log("line 303 raw:", L[302]);