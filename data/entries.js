// ============================================================
//  ENTRIES DATA
//
//  Every entry in the archive lives in this array, one object
//  per entry. The fields are:
//
//    id           - stable number for each entry. It stays with the
//                   entry even if entries are reordered or removed,
//                   so it can be used as a React key and to look an
//                   entry up later.
//    titleEnglish - the ritual's name in romanized Khmer/English
//    titleKhmer   - the same name in Khmer script. Keep it exactly
//                   as written — Khmer script is content, not
//                   decoration.
//    description  - what happens in this step and why it matters
//    contributor  - the person who shared this knowledge
//    place        - where this knowledge comes from
//    image        - path to the entry's photo. Empty for now.
//                   To add one: create a "public/images" folder in
//                   the project, put your photo file in it, then set
//                   image: "/images/your-photo-file.jpg"
//
//  To add a new entry: copy one object block, paste it at the
//  end of the array, give it the next id, and fill in your own
//  words from your own collection.
// ============================================================

const entries = [
  {
    id: 1,
    titleEnglish: "Hai Goan Gomloh",
    titleKhmer: "ហែរកូនកំលោះ",
    description:
      "Cambodian weddings begin with the groom and his family traveling to meet the bride’s family, bearing gifts for dowry, such as: meats, fruits, pastries, drinks and desserts. Guests are handed matching gold trays of fruits and gifts as they arrive so they can join in the procession, symbolic of his journey to the bride’s home. The trays will be arranged on the table. Family members and friends are introduced, and wedding rings will be exchanged.",
    contributor: "Lecturer Ry Phearom",
    place: "Kompong Cham Province, Cambodia",
    image: "",
  },
  {
    id: 2,
    titleEnglish: "Sien Doan Taa",
    titleKhmer: "សែនដូនតា",
    description:
      "This step is called as Tea Ceremony, at which the bride and groom offer tea to honor the spirits of their ancestors. It is a way for them to honor those who have passed before them and to invite their spirit to celebrate their wedding. It is a time to remember those near and dear to their hearts and remember to include them in their important life events.",
    contributor: "Lecturer Ry Phearom",
    place: "Kompong Cham Province, Cambodia",
    image: "",
  },
];

export default entries;