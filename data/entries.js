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
    titleEnglish: "Krong Pali Ceremony",
    titleKhmer: "ពិធីសែនក្រុងពាលី",
    description:
      "Krong Pali Ceremony is a traditional belief ritual for Cambodian. They performed to pray for happiness and ask for permission from the local guardian spirits, earth deities, and protectors of the land before they start build ceremony.",
    contributor: "Grandpa Sam Thong​",
    place: "Kompong Cham Province, Cambodia",
    image: "",
  },
   {
    id: 2,
    titleEnglish: "Bok Leak Ceremony",
    titleKhmer: "ការធ្វើធ្មេញ (បុកល័ក្ក)",
    description:
      "The Bok Leak ceremony is a traditional Khmer custom performed during weddings to enhance the bride's beauty and celebrate her transition into womanhood, signifying that she has reached the age of maturity and is ready for family life.",
    contributor: "Grandpa Sam Thong",
    place: "Kompong Cham Province, Cambodia",
    image: "",
  },
  {
    id: 3,
    titleEnglish: "Hai Goan Gomloh",
    titleKhmer: "ហែរកូនកំលោះ",
    description:
      "Hai Goan Gomloh is the important celebrity of the groom and his family traveling to meet bride’s family, bring gifts for dowry such as meats, fruits, drinks, desserts, and jewelry. Guests are handed with gold trays of gifts as they arrive, so they can join in the procession. Then the trays will be arranged on the table, then both family members and friends are introduced, and wedding rings will be exchanged.",
    contributor: "Lecturer Ry Phearom",
    place: "Kompong Cham Province, Cambodia",
    image: "",
  },
  {
    id: 4,
    titleEnglish: "Sien Doan Taa",
    titleKhmer: "សែនដូនតា",
    description:
      "This step is called as Tea Ceremony, at which the bride and groom offer tea to honor the spirits of their ancestors. It is a way for them to honor those who have passed before them and to invite their spirit to celebrate their wedding. It is a time to remember those near and dear to their hearts and remember to include them in their important life events.",
    contributor: "Lecturer Ry Phearom",
    place: "Kompong Cham Province, Cambodia",
    image: "",
  },
   {
    id: 5,
    titleEnglish: "Hair Cutting Ritual ",
    titleKhmer: "កាត់សក់",
    description:
      "The symbolic hair cutting is another well known Cambodian wedding tradition. Family member and friend pretend to cut new couple hair, this represents cleaning the couple from their past and preparing them for starting a new life together.",
    contributor: "Lecturer Ry Phearom",
    place: "Kompong Cham Province, Cambodia",
    image: "",
  },
  {
    id: 6,
    titleEnglish: "Knot Typing Ceremony",
    titleKhmer: "ពិធីសំពះផ្ទឹម",
    description:
      "This is a memorial ceremony for the new couple’s binding together. This celebrate by family members, and friends tie their hand with red blessing string and wish to the new couple. The red strings are symbolic of two people coming together and forever love.",
    contributor: "Lecturer Chot Somnang",
    place: "Kompong Cham Province, Cambodia",
    image: "",
  },
   {
    id: 7,
    titleEnglish: "Preah Thong Holding the Sbai ",
    titleKhmer: "ពិធីព្រះថោងតោងស្បៃ",
    description:
      " Preah Thong holding the sbai is the symbol of unity, the origin of the nation, and respect for the role of women. Furthermore, This ceremony marks the final stage of the wedding ceremony following the Sampeas Phtim during which the groom holds onto the bride's scarf and follows her into the room.",
    contributor: "Ms. Heab Sokha",
    place: "Kompong Cham Province, Cambodia",
    image: "",
  },
  {
    id: 8,
    titleEnglish: "Bongvul Pbopul",
    titleKhmer: "បង្វិលពពិល",
    description:
      "Bongvul Pbopul is an important ceremony and special that cannot be ignored for each wedding because Cambodians believe that it can bring happiness to the new couple. This ceremony involves a restriction which participation is only for men and women who have married. The new couple kneels in the middle of a circle of already married couples, three lit candles are passed around seven times and their smoke waved towards the new couple.",
    contributor: "Ms. Heab Sokha",
    place: "Kompong Cham Province, Cambodia",
    image: "",
  },

];

export default entries;