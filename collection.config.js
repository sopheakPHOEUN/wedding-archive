// ============================================================
//  YOUR ARCHIVE STARTS HERE
//
//  This is the only file you edit in Lab 1.
//  Change the four values below, commit, and watch your
//  live site update itself.
// ============================================================

const collection = {
  // What does your archive collect? e.g. "Khmer Proverbs"
  name: "Khmer Wedding Ceremony",

  // One sentence: what is this archive, and why does it matter?
  description: "An archive documenting the traditional order and rituals of a Khmer wedding ceremony. ",

  // The same description in Khmer. It is the identity fallback; the live value
  // is stored in the Supabase `archive` table and read from there at runtime.
  descriptionKhmer:
    "បណ្ណសារមួយដែលកត់ត្រាពីលំដាប់ប្រពៃណី និងពិធីផ្សេងៗនៃពិធីរៀបការបែបខ្មែរ។",

  // Who is building this archive? Your name, as you want it shown.
  curator: "Phoeun Sopheak",

  // The same name in Khmer. Everywhere the site shows the creator's name it
  // switches to this when the site is in Khmer, and falls back to the English
  // name above when this is empty (so the credit is never blank).
  // NOTE: the Khmer name below is a DRAFT spelling — confirm it is yours.
  curatorKhmer: "ភឿន សុភ័ក្ត្រ",

  // Where does your knowledge come from? A person, a place, a community.
  source: "Gathered from my grandparents, older relatives, and local elders who have participated in or organized Khmer weddings in my community",

  // The same source note in Khmer. The About section shows this when the site
  // is switched to Khmer, and keeps showing the English version above when this
  // is empty, so the section never appears blank.
  // NOTE: the Khmer sentence below is a DRAFT spelling — confirm it reads the
  // way you want before committing.
  sourceKhmer:
    "ប្រមូលបានពីជីដូនជីតា ញាតិសន្ដានចាស់ៗ និងអ្នកចាស់ទុំក្នុងសហគមន៍របស់ខ្ញុំ ដែលបានចូលរួម ឬរៀបចំពិធីរៀបការបែបខ្មែរ",
};

export default collection;
