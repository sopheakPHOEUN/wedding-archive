// lib/i18n.js - A tiny, dependency-free bilingual layer (English + Khmer).
//
// Every user-facing string on the site lives here in both languages, keyed by
// a stable key. React components translate through the LanguageProvider context
// (components/LanguageProvider.js) with t("key", { param }). Server pages like
// /review read the language cookie themselves and use translate() directly, so
// they render in the right language after a switch without any client state.
//
// Validation messages produced by lib/contribute.js and lib/entries.js stay in
// English inside those files (their logic is untouched); translateRuleError()
// maps those exact messages to Khmer so the forms still show the right
// language without changing any validation logic.

export const LANG_COOKIE = "kla-lang";
export const LANG_STORAGE = "kla-lang";

// Only two languages are supported. Anything else safely becomes English.
export const resolveLang = (value) => (value === "km" ? "km" : "en");

const en = {
  // Shared chrome
  "common.skipToContent": "Skip to content",
  "common.kicker": "KHMER LIVING ARCHIVE",
  "common.entriesCount": "{n} entries",
  "common.loadingArchive": "Loading the archive…",
  "common.backToArchive": "← Back to the archive",
  "common.archivePhoto": "Archive photo",
  "common.entryPhoto": "Entry photo",
  "common.untitled": "Untitled",
  "status.pending": "Pending",
  "status.published": "Published",
  "status.returned": "Returned",

  // Header / navigation
  "nav.home": "Home",
  "nav.myEntries": "My Entries",
  "nav.review": "Review",
  "nav.contribute": "Contribute",
  "nav.logout": "Logout",
  "nav.login": "Log In",
  "nav.signup": "Sign Up",
  "header.mainAria": "Main",
  "header.openMenu": "Open menu",
  "header.closeMenu": "Close menu",

  // Home page
  "home.exploreRituals": "Explore the rituals",
  "home.viewFullSize": "View full size",
  "home.viewHeroImage": "View hero image full size",
  "home.scroll": "Scroll",
  "home.aboutEyebrow": "The Collection",
  "home.aboutTitle": "A record of living Khmer tradition",
  "home.knowledgeGatheredFrom": "Knowledge gathered from",
  "home.curatedBy": "Curated by",
  "home.ritualsEyebrow": "The Rituals",
  "home.exploreCeremony": "Explore the ceremony",
  "home.moreRituals": "More rituals",
  "home.moreRitualsSubtitle": "Not yet placed in the ceremony order",
  "home.searchPlaceholder": "Search entries…",
  "home.searchAria": "Search the archival entries",
  "home.clearSearch": "Clear search",
  "home.couldNotLoad": "Couldn't load the archive",
  "home.archiveError":
    "The archive couldn't be loaded right now. Please check your connection and try again.",
  "home.retry": "Retry",
  "home.tryMoreSpecific": "Try a more specific search",
  "home.noMeaningful":
    'That search used only common words such as \u201cthe\u201d or \u201cwith\u201d, which don\u2019t narrow the results. Try a ritual name, a place, or a special word like \u201cceremony\u201d.',
  "home.noResultsTitle": "No results for \u201c{term}\u201d",
  "home.noResultsText":
    "Try a different word, or clear the search to browse the whole archive.",
  "home.noEntriesTitle": "No entries in the archive yet",
  "home.noEntriesText":
    "As rituals are reviewed and published, they will appear here.",

  // Search match labels (lib/search.js tiers)
  "search.exactPhrase": "Exact phrase match",
  "search.allTerms": "All terms matched ({a}/{b})",
  "search.partial": "Partial match ({a}/{b})",

  // Footer
  "footer.curatedBy": "Curated by {name}",
  "footer.note":
    "Built in ICT 340 — Vibe Coding, American University of Phnom Penh, Fall 2026. This archive is under construction all semester.",

  // Entry cards
  "card.featuredEntry": "FEATURED ENTRY",
  "card.archiveEntry": "ARCHIVE ENTRY",
  "card.contributedBy": "Contributed by",
  "card.viewEntry": "View entry →",

  // About slider
  "slider.showPhoto": "Show photo: {alt}",
  "slider.previous": "Show previous photo",
  "slider.next": "Show next photo",
  "slider.showPhotoOf": "Show photo {n} of {count}",

  // Lightbox
  "lightbox.close": "Close image viewer",
  "lightbox.photo": "Photo",

  // Contribute page
  "contribute.title": "Contribute an Entry",
  "contribute.subtitle":
    "Add a ritual, tradition, or memory you know to {name}.",
  "contribute.checkingSession": "Checking your session…",
  "contribute.gateText":
    "Contributions come from logged-in users so the archive always knows who shared what. Log in or create an account, then come back here to add an entry.",

  // Entry form
  "form.field.title_khmer": "Khmer title",
  "form.field.title_english": "English title",
  "form.field.description": "Description (English)",
  "form.field.description_khmer": "Description (Khmer)",
  "form.field.contributor": "Contributor",
  "form.field.contributor_khmer": "Khmer contributor",
  "form.field.place": "Place",
  "form.field.place_khmer": "Khmer place",
  "form.ph.description":
    "What happens in this ritual, and why does it matter?",
  "form.ph.description_khmer":
    "Describe the same ritual and why it matters, in Khmer.",
  "form.photo": "Photo",
  "form.photoHint":
    "Pick one: upload a photo from your device, or paste a full http(s) link to a photo. Uploaded photos are stored in our photos bucket.",
  "form.or": "or",
  "form.currentPhoto": "Current photo",
  "form.keepPhoto": "Leave the photo as-is to keep the current one.",
  "form.weddingDay": "Wedding day",
  "form.weddingDayHint":
    "Which traditional day of the Khmer wedding ceremony does this ritual belong to? If you are not sure, choose \u201cOther / Not sure\u201d — a curator will place it for you.",
  "form.weddingDayPlaceholder": "Choose a wedding day…",
  "form.submitEntry": "Submit Entry",
  "form.submitting": "Uploading and saving…",
  "form.saveChanges": "Save Changes",
  "form.saving": "Saving…",
  "form.success":
    "Your contribution has been submitted and is waiting for review. It will appear in the public archive after approval.",
  "form.genericError": "Something went wrong. Please try again.",

  // Auth pages
  "auth.loginTitle": "Log in to your account",
  "auth.signupTitle": "Create an account to contribute",
  "auth.email": "Email",
  "auth.emailAria": "Email address",
  "auth.password": "Password",
  "auth.passwordAria": "Password",
  "auth.loading": "Loading…",
  "auth.switchToLogin": "Already have an account? Log in",
  "auth.switchToSignup": "Don't have an account? Sign up",
  "auth.invalid": "Invalid email or password",
  "auth.passwordPolicy": "Password must contain at least a letter and number",
  "auth.legend":
    "Built in ICT 340 — Vibe Coding, American University of Phnom Penh, Fall 2026. Curated by {name}.",

  // My entries
  "my.title": "My Entries",
  "my.subtitle":
    "The entries you contributed, and where each one stands in the review process.",
  "my.gateText":
    "This page is for logged-in contributors. Log in or create an account, then come back here to track your entries.",
  "my.addNew": "+ Add New Entry",
  "my.loading": "Loading your entries…",
  "my.loadError": "We couldn't load your entries. Please try again.",
  "my.empty":
    "You haven't contributed any entries yet. Once you do, they will appear here with their review status.",
  "my.edit": "Edit Entry",

  // Entry detail page
  "entry.backToArchive": "Back to the archive",
  "entry.backToResults": "Back to results",
  "entry.loading": "Loading entry…",
  "entry.notFound": "We couldn't find that entry. It may have been deleted.",
  "entry.viewFullSize": "View full size",
  "entry.contributor": "Contributor",
  "entry.place": "Place",
  "entry.notProvided": "Not provided",
  "entry.editEntry": "Edit entry",
  "entry.delete": "Delete",
  "entry.deleting": "Deleting…",
  "entry.confirmDelete": "Delete this entry? This cannot be undone.",
  "entry.ownerNote":
    "You contributed this entry. Edits send it back to the review queue.",
  "entry.changeNotSaved": "That change wasn't saved",

  // Edit page
  "edit.title": "Edit Entry",
  "edit.subtitle": "Fix what needs fixing, then save your changes.",
  "edit.gateText":
    "Editing works only for the person who contributed the entry. Log in or create an account, then come back here to make changes.",
  "edit.notOwner": "You can only edit your own entries.",
  "edit.published":
    "This entry is already published, so it can't be edited here. You can edit entries that are waiting for review or were returned to you.",
  "edit.backToEntry": "← Back to this entry",

  // Review queue
  "review.title": "Review Queue",
  "review.subtitle":
    "Entries waiting for review. Publishing adds them to the public archive; returning sends them back to the contributor for changes.",
  "review.accessDenied":
    "Access Denied — this page is for authorized reviewers only.",
  "review.loadError": "We couldn't load the review queue. Please try again.",
  "review.empty": "No entries are waiting for review right now.",
  "review.publish": "Publish",
  "review.publishing": "Publishing…",
  "review.return": "Return for change",
  "review.returning": "Returning…",
  "review.weddingDayLabel": "Wedding day",
  "review.weddingDayAssigned": "Contributor's day",
  "review.sequenceLabel": "Sequence position",
  "review.sequenceHint":
    "Position of this ritual in the ceremony (1 = first). Leave blank to keep it unclassified.",
  "review.pendingClassification": "Pending classification",
  "review.notClassified": "Not yet classified",
  "review.saveClassification": "Save day & position",
  "review.saving": "Saving…",
  "review.unclassifiedNote":
    "Entries without a verified day + sequence appear in the separate \u201cMore rituals\u201d section, not in the Day 1 / Day 2 galleries.",
  "review.saveError":
    "We couldn't save the review of \u201c{title}\u201d. Please try again.",
  "review.notAuthorized":
    "\u201c{title}\u201d wasn't {verb}; only an authorized reviewer can change an entry's status.",
  "review.success": "\u201c{title}\u201d was {verb}.",
  "review.location": "LOCATION — {place}",
  "review.submitted": "SUBMITTED {date}",

  // Review sort
  "sort.label": "Sort by date",
  "sort.oldest": "Oldest first",
  "sort.newest": "Newest first",
  "sort.aria": "Sort the review queue by submission date",
};

const km = {};

const KM_1 = {
  "common.skipToContent": "រំលងទៅកាន់មាតិកា",
  "common.kicker": "បណ្ណសារប្រពៃណីខ្មែរ",
  "common.entriesCount": "ទិន្នន័យចំនួន {n}",
  "common.loadingArchive": "កំពុងផ្ទុកបណ្ណសារ…",
  "common.backToArchive": "← ត្រឡប់ទៅបណ្ណសារ",
  "common.archivePhoto": "រូបថតបណ្ណសារ",
  "common.entryPhoto": "រូបថតទិន្នន័យ",
  "common.untitled": "គ្មានឈ្មោះ",
  "status.pending": "កំពុងរង់ចាំការពិនិត្យ",
  "status.published": "បានផ្សព្វផ្សាយ",
  "status.returned": "ត្រូវការកែសម្រួល",

  "nav.home": "ទំព័រដើម",
  "nav.myEntries": "ឯកសាររបស់ខ្ញុំ",
  "nav.review": "ពិនិត្យ",
  "nav.contribute": "ចូលរួមចែករំលែក",
  "nav.logout": "ចាកចេញ",
  "nav.login": "ចូល",
  "nav.signup": "ចុះឈ្មោះ",
  "header.mainAria": "ម៉ឺនុយមេ",
  "header.openMenu": "បើកម៉ឺនុយ",
  "header.closeMenu": "បិទម៉ឺនុយ",

  "home.exploreRituals": "ស្វែងយល់ពីពិធីនានា",
  "home.viewFullSize": "មើលទំហំពេញ",
  "home.viewHeroImage": "មើលរូបភាពធំពេញ",
  "home.scroll": "រំកិលចុះ",
  "home.aboutEyebrow": "បណ្តុំ",
  "home.aboutTitle": "កំណត់ត្រានៃប្រពៃណីខ្មែរដែលនៅមានតជំនាន់",
  "home.knowledgeGatheredFrom": "ចំណេះដឹងប្រមូលបានពី",
  "home.curatedBy": "រៀបចំដោយ",
  "home.ritualsEyebrow": "ពិធីនានា",
  "home.exploreCeremony": "ស្វែងយល់ពីពិធីអាពាហ៍ពិពាហ៍",
  "home.moreRituals": "ពិធីផ្សេងទៀត",
  "home.moreRitualsSubtitle": "មិនទាន់បានដាក់ក្នុងលំដាប់ពិធីរៀបការនៅឡើយ",
  "home.searchPlaceholder": "ស្វែងរកឯកសារ…",
  "home.searchAria": "ស្វែងរកទិន្នន័យក្នុងបណ្ណសារ",
  "home.clearSearch": "សម្អាតការស្វែងរក",
  "home.couldNotLoad": "មិនអាចផ្ទុកបណ្ណសារបានទេ",
  "home.archiveError":
    "មិនអាចផ្ទុកបណ្ណសារបានទេនៅពេលនេះ។ សូមពិនិត្យការតភ្ជាប់របស់អ្នក ហើយព្យាយាមម្តងទៀត។",
  "home.retry": "ព្យាយាមម្តងទៀត",
  "home.tryMoreSpecific": "សូមស្វែងរកដោយពាក្យច្បាស់លាស់ជាងនេះ",
  "home.noMeaningful":
    "ការស្វែងរកនេះប្រើតែពាក្យទូទៅដូចជា \u201cthe\u201d ឬ \u201cwith\u201d ដែលមិនបង្រួមលទ្ធផល។ សូមសាកប្រើឈ្មោះពិធី ឈ្មោះទីកន្លែង ឬពាក្យពិសេសដូចជា \u201cceremony\u201d។",
  "home.noResultsTitle": "រកមិនឃើញលទ្ធផលសម្រាប់ \u201c{term}\u201d",
  "home.noResultsText":
    "សូមសាកប្រើពាក្យផ្សេង ឬសម្អាតការស្វែងរកដើម្បីមើលបណ្ណសារទាំងមូល។",
  "home.noEntriesTitle": "មិនទាន់មានទិន្នន័យនៅក្នុងបណ្ណសារនៅឡើយទេ",
  "home.noEntriesText":
    "នៅពេលដែលពិធីនានាត្រូវបានពិនិត្យ និងផ្សព្វផ្សាយ ពួកវានឹងបង្ហាញនៅទីនេះ។",

  "search.exactPhrase": "ផ្គូផ្គងពាក្យផ្គុំពិតប្រាកដ",
  "search.allTerms": "ផ្គូផ្គងពាក្យទាំងអស់ ({a}/{b})",
  "search.partial": "ផ្គូផ្គងដោយផ្នែក ({a}/{b})",

  "footer.curatedBy": "រៀបចំដោយ {name}",
  "footer.note":
    "បង្កើតឡើងក្នុង ICT 340 — Vibe Coding នៃសាកលវិទ្យាល័យអាមេរិកាំងភ្នំពេញ ឆមាសសិក្សា Fall 2026។ បណ្ណសារនេះកំពុងសាងសង់ពេញមួយឆមាស។ ",

  "card.featuredEntry": "ទិន្នន័យលេចធ្លោ",
  "card.archiveEntry": "ទិន្នន័យក្នុងបណ្ណសារ",
  "card.contributedBy": "ចែករំលែកដោយ",
  "card.viewEntry": "មើលឯកសារពេញ →",

  "slider.showPhoto": "បង្ហាញរូបថត៖ {alt}",
  "slider.previous": "បង្ហាញរូបថតមុន",
  "slider.next": "បង្ហាញរូបថតបន្ទាប់",
  "slider.showPhotoOf": "បង្ហាញរូបថតទី {n} ក្នុងចំណោម {count}",

  "lightbox.close": "បិទអ្នកមើលរូបភាព",
  "lightbox.photo": "រូបថត",
};

Object.assign(km, KM_1);

const KM_2 = {
  "contribute.title": "ចូលរួមចែករំលែកឯកសារ",
  "contribute.subtitle":
    "បន្ថែមពិធី ប្រពៃណី ឬអនុស្សាវរីយ៍ដែលអ្នកស្គាល់ទៅក្នុង {name}។",
  "contribute.checkingSession": "កំពុងពិនិត្យវគ្គរបស់អ្នក…",
  "contribute.gateText":
    "ការចូលរួមចែករំលែកបានមកពីអ្នកប្រើប្រាស់ដែលបានចូល ដើម្បីឱ្យបណ្ណសារតែងតែដឹងថានរណាចែករំលែកអ្វី។ សូមចូល ឬបង្កើតគណនី រួចត្រឡប់មកទីនេះដើម្បីបន្ថែមទិន្នន័យ។",

  "form.field.title_khmer": "ឈ្មោះជាភាសាខ្មែរ",
  "form.field.title_english": "ឈ្មោះជាភាសាអង់គ្លេស",
  "form.field.description": "ការពិពណ៌នា",
  "form.field.description_khmer": "ការពិពណ៌នាជាភាសាខ្មែរ",
  "form.field.contributor": "អ្នកចែករំលែកជាភាសាអង់គ្លេស",
  "form.field.contributor_khmer": "អ្នកចែករំលែកជាភាសាខ្មែរ",
  "form.field.place": "ទីកន្លែងជាភាសាអង់គ្លេស",
  "form.field.place_khmer": "ទីកន្លែងជាភាសាខ្មែរ",
  "form.ph.description":
    "តើមានអ្វីកើតឡើងនៅក្នុងពិធីនេះ ហើយហេតុអ្វីវាសំខាន់?",
  "form.ph.description_khmer":
    "រៀបរាប់ពីពិធីដដែល និងមូលហេតុដែលវាសំខាន់ ជាភាសាខ្មែរ។",
  "form.photo": "រូបថត",
  "form.photoHint":
    "ជ្រើសរើសមួយ៖ ផ្ទុករូបថតពីឧបករណ៍របស់អ្នក ឬបិទភ្ជាប់តំណ http(s) ពេញលេញរបស់រូបថត។ រូបថតដែលបានផ្ទុកត្រូវបានរក្សាទុកក្នុងថត photos របស់យើង។",
  "form.or": "ឬ",
  "form.currentPhoto": "រូបថតបច្ចុប្បន្ន",
  "form.keepPhoto": "ទុករូបថតដដែល ដើម្បីរក្សារូបថតបច្ចុប្បន្ន។",
  "form.weddingDay": "ថ្ងៃរៀបការ",
  "form.weddingDayHint":
    "ពិធីនេះជារបស់ថ្ងៃណានៃពិធីរៀបការបែបប្រពៃណីខ្មែរ? ប្រសិនបើមិនប្រាកដ សូមជ្រើសរើស \u201cOther / Not sure — មិនទាន់កំណត់\u201d — អ្នករៀបចំនឹងជួយដាក់វា។",
  "form.weddingDayPlaceholder": "ជ្រើសរើសថ្ងៃរៀបការ…",
  "form.submitEntry": "បញ្ជូនទិន្នន័យ",
  "form.submitting": "កំពុងផ្ទុក និងរក្សាទុក…",
  "form.saveChanges": "រក្សាទុកការផ្លាស់ប្តូរ",
  "form.saving": "កំពុងរក្សាទុក…",
  "form.success":
    "ការចែករំលែករបស់អ្នកត្រូវបានដាក់ស្នើហើយ ហើយកំពុងរង់ចាំការពិនិត្យ។ វានឹងបង្ហាញក្នុងបណ្ណសារសាធារណៈបន្ទាប់ពីទទួលការយល់ព្រម។",
  "form.genericError": "មានបញ្ហាអ្វីមួយ។ សូមព្យាយាមម្តងទៀត។",

  "auth.loginTitle": "ចូលទៅក្នុងគណនីរបស់អ្នក",
  "auth.signupTitle": "បង្កើតគណនីដើម្បីចូលរួមចែករំលែក",
  "auth.email": "អ៊ីមែល",
  "auth.emailAria": "អាសយដ្ឋានអ៊ីមែល",
  "auth.password": "ពាក្យសម្ងាត់",
  "auth.passwordAria": "ពាក្យសម្ងាត់",
  "auth.loading": "កំពុងផ្ទុក…",
  "auth.switchToLogin": "មានគណនីរួចហើយ? ចូល",
  "auth.switchToSignup": "មិនទាន់មានគណនី? ចុះឈ្មោះ",
  "auth.invalid": "អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ",
  "auth.passwordPolicy":
    "ពាក្យសម្ងាត់ត្រូវតែមានយ៉ាងហោចណាស់អក្សរមួយ និងលេខមួយ",
  "auth.legend":
    "បង្កើតឡើងក្នុង ICT 340 — Vibe Coding នៃសាកលវិទ្យាល័យអាមេរិកាំងភ្នំពេញ ឆមាសសិក្សា Fall 2026។ រៀបចំដោយ {name}។",

  "my.title": "ឯកសាររបស់ខ្ញុំ",
  "my.subtitle":
    "ឯកសារដែលអ្នកបានចែករំលែក និងស្ថានភាពរបស់ទិន្នន័យនីមួយៗក្នុងដំណើរការពិនិត្យ។",
  "my.gateText":
    "ទំព័រនេះសម្រាប់អ្នកចូលរួមចែករំលែកដែលបានចូល។ សូមចូល ឬបង្កើតគណនី រួចត្រឡប់មកទីនេះដើម្បីតាមដានទិន្នន័យរបស់អ្នក។",
  "my.addNew": "+ បន្ថែមទិន្នន័យថ្មី",
  "my.loading": "កំពុងផ្ទុកទិន្នន័យរបស់អ្នក…",
  "my.loadError": "យើងមិនអាចផ្ទុកទិន្នន័យរបស់អ្នកបានទេ។ សូមព្យាយាមម្តងទៀត។",
  "my.empty":
    "អ្នកមិនទាន់បានចែករំលែកទិន្នន័យណាមួយនៅឡើយទេ។ នៅពេលអ្នកចែករំលែក ពួកវានឹងបង្ហាញនៅទីនេះជាមួយស្ថានភាពនៃការពិនិត្យ។",
  "my.edit": "កែសម្រួលទិន្នន័យ",
};

Object.assign(km, KM_2);

const KM_3 = {
  "entry.backToArchive": "ត្រឡប់ទៅបណ្ណសារ",
  "entry.backToResults": "ត្រឡប់ទៅលទ្ធផល",
  "entry.loading": "កំពុងផ្ទុកទិន្នន័យ…",
  "entry.notFound": "យើងរកមិនឃើញទិន្នន័យនេះទេ។ វាអាចត្រូវបានលុបចោល។",
  "entry.viewFullSize": "មើលទំហំពេញ",
  "entry.contributor": "អ្នកចែករំលែក",
  "entry.place": "ទីកន្លែង",
  "entry.notProvided": "មិនមានការផ្តល់",
  "entry.editEntry": "កែសម្រួលទិន្នន័យ",
  "entry.delete": "លុប",
  "entry.deleting": "កំពុងលុប…",
  "entry.confirmDelete": "លុបទិន្នន័យនេះ? សកម្មភាពនេះមិនអាចថយក្រោយបានទេ។",
  "entry.ownerNote":
    "អ្នកបានចែករំលែកទិន្នន័យនេះ។ ការកែសម្រួលនឹងបញ្ជូនវាត្រឡប់ទៅជួរពិនិត្យវិញ។",
  "entry.changeNotSaved": "ការផ្លាស់ប្តូរនោះមិនត្រូវបានរក្សាទុកទេ",

  "edit.title": "កែសម្រួលទិន្នន័យ",
  "edit.subtitle": "កែសម្រួលអ្វីដែលត្រូវកែ រួចរក្សាទុកការផ្លាស់ប្តូររបស់អ្នក។",
  "edit.gateText":
    "ការកែសម្រួលអាចធ្វើបានសម្រាប់តែអ្នកដែលបានចែករំលែកទិន្នន័យនេះប៉ុណ្ណោះ។ សូមចូល ឬបង្កើតគណនី រួចត្រឡប់មកទីនេះដើម្បីកែសម្រួល។",
  "edit.notOwner": "អ្នកអាចកែសម្រួលតែទិន្នន័យរបស់ខ្លួនឯងប៉ុណ្ណោះ។",
  "edit.published":
    "ទិន្នន័យនេះត្រូវបានផ្សព្វផ្សាយរួចហើយ ដូច្នេះវាមិនអាចកែសម្រួលនៅទីនេះបានទេ។ អ្នកអាចកែសម្រួលទិន្នន័យដែលកំពុងរង់ចាំការពិនិត្យ ឬត្រូវបានបញ្ជូនត្រឡប់មកអ្នកវិញ។",
  "edit.backToEntry": "← ត្រឡប់ទៅទិន្នន័យនេះ",

  "review.title": "ជួរពិនិត្យ",
  "review.subtitle":
    "ទិន្នន័យដែលកំពុងរង់ចាំការពិនិត្យ។ ការផ្សព្វផ្សាយនឹងបន្ថែមពួកវាទៅក្នុងបណ្ណសារសាធារណៈ ហើយការបញ្ជូនត្រឡប់នឹងផ្ញើពួកវាទៅអ្នកចូលរួមវិញដើម្បីកែប្រែ។",
  "review.accessDenied":
    "ការចូលប្រើត្រូវបានបដិសេធ — ទំព័រនេះសម្រាប់តែអ្នកពិនិត្យដែលមានការអនុញ្ញាតប៉ុណ្ណោះ។",
  "review.loadError": "យើងមិនអាចផ្ទុកជួរពិនិត្យបានទេ។ សូមព្យាយាមម្តងទៀត។",
  "review.empty": "មិនមានទិន្នន័យកំពុងរង់ចាំការពិនិត្យនៅពេលនេះទេ។",
  "review.publish": "ផ្សព្វផ្សាយ",
  "review.publishing": "កំពុងផ្សព្វផ្សាយ…",
  "review.return": "បញ្ជូនត្រឡប់ដើម្បីកែប្រែ",
  "review.returning": "កំពុងបញ្ជូនត្រឡប់…",
  "review.weddingDayLabel": "ថ្ងៃរៀបការ",
  "review.weddingDayAssigned": "ថ្ងៃដែលអ្នកចែករំលែកបានជ្រើសរើស",
  "review.sequenceLabel": "លំដាប់ទី",
  "review.sequenceHint":
    "ទីតាំងរបស់ពិធីនេះក្នុងដំណើរការរៀបការ (1 = ដំបូង)។ ទុកឱ្យទទេដើម្បីរក្សាជា \"មិនទាន់កំណត់\"។",
  "review.pendingClassification": "កំពុងរង់ចាំកំណត់ផ្នែក",
  "review.notClassified": "មិនទាន់បានកំណត់",
  "review.saveClassification": "រក្សាទុកថ្ងៃ និងលំដាប់",
  "review.saving": "កំពុងរក្សាទុក…",
  "review.unclassifiedNote":
    "ទិន្នន័យដែលមិនទាន់មានថ្ងៃ + លំដាប់ ដែលបានផ្ទៀងផ្ទាត់ នឹងបង្ហាញនៅក្នុងផ្នែក \"More rituals\" ដាច់ដោយឡែក មិនមែននៅក្នុង Day 1 / Day 2 ទេ។",
  "review.saveError":
    "យើងមិនអាចរក្សាទុកការពិនិត្យរបស់ \u201c{title}\u201d បានទេ។ សូមព្យាយាមម្តងទៀត។",
  "review.notAuthorized":
    "\u201c{title}\u201d មិន{verb}ទេ។ មានតែអ្នកពិនិត្យដែលមានការអនុញ្ញាតប៉ុណ្ណោះដែលអាចផ្លាស់ប្តូរស្ថានភាពទិន្នន័យបាន។",
  "review.success": "\u201c{title}\u201d {verb}។",
  "review.location": "ទីកន្លែង — {place}",
  "review.submitted": "ដាក់ស្នើ {date}",

  "sort.label": "តម្រៀបតាមកាលបរិច្ឆេទ",
  "sort.oldest": "ចាស់ជាងគេមុន",
  "sort.newest": "ថ្មីបំផុតមុន",
  "sort.aria": "តម្រៀបជួរពិនិត្យតាមកាលបរិច្ឆេទដាក់ស្នើ",
};

Object.assign(km, KM_3);

export const dictionaries = { en, km };

// Translate a key with optional {name} placeholders. Missing keys fall back to
// the English copy, then to the key itself, so a new string never crashes UI.
export function translate(lang, key, vars = {}) {
  const table = dictionaries[lang] || dictionaries.en;
  let text = table[key];
  if (typeof text !== "string") text = dictionaries.en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name) =>
    vars[name] !== undefined ? vars[name] : match
  );
}

// Khmer field names used inside the length-rule messages ("Khmer title must be
// 2–100 characters." etc.), so the translated sentence reads naturally.
const FIELD_KM = {
  "Khmer title": "ឈ្មោះជាភាសាខ្មែរ",
  "English title": "ឈ្មោះជាភាសាអង់គ្លេស",
  Description: "ការពិពណ៌នា",
  Contributor: "អ្នកចែករំលែក",
  "Khmer description": "ការពិពណ៌នាជាភាសាខ្មែរ",
  Place: "ទីកន្លែង",
  "Khmer contributor": "អ្នកចែករំលែកជាភាសាខ្មែរ",
  "Khmer place": "ទីកន្លែងជាភាសាខ្មែរ",
};

// "<Field> must be <min>–<max> characters." from lib/contribute.js.
const LENGTH_RULE_RE = /^([A-Za-z ]+) must be (\d+)–(\d+) characters\.$/;

// The other validation/upload messages that lib/contribute.js and
// lib/entries.js produce, keyed by their exact English text.
const RULE_ERROR_KM = {
  "Choose a wedding day, or select \"Other / Not sure\" if you are unsure.":
    "សូមជ្រើសរើសថ្ងៃរៀបការ ឬជ្រើសរើស \"Other / Not sure — មិនទាន់កំណត់\" ប្រសិនបើមិនប្រាកដ។",
  "English title must include letters, not just symbols or numbers.":
    "ឈ្មោះជាភាសាអង់គ្លេសត្រូវតែមានអក្សរ មិនមែនគ្រាន់តែនិមិត្តសញ្ញា ឬលេខទេ។",
  "Description must include real words, not just symbols or numbers.":
    "ការពិពណ៌នាត្រូវតែមានពាក្យពិត មិនមែនគ្រាន់តែនិមិត្តសញ្ញា ឬលេខទេ។",
  "Khmer description must include real words, not just symbols or numbers.":
    "ការពិពណ៌នាជាភាសាខ្មែរត្រូវតែមានពាក្យពិត មិនមែនគ្រាន់តែនិមិត្តសញ្ញា ឬលេខទេ។",
  "Contributor must include letters, not just numbers or symbols.":
    "អ្នកចែករំលែកត្រូវតែមានអក្សរ មិនមែនគ្រាន់តែលេខ ឬនិមិត្តសញ្ញាទេ។",
  "Place must include letters, not just numbers or symbols.":
    "ទីកន្លែងត្រូវតែមានអក្សរ មិនមែនគ្រាន់តែលេខ ឬនិមិត្តសញ្ញាទេ។",
  "Khmer contributor must include letters, not just numbers or symbols.":
    "អ្នកចែករំលែកជាភាសាខ្មែរត្រូវតែមានអក្សរ មិនមែនគ្រាន់តែលេខ ឬនិមិត្តសញ្ញាទេ។",
  "Khmer place must include letters, not just numbers or symbols.":
    "ទីកន្លែងជាភាសាខ្មែរត្រូវតែមានអក្សរ មិនមែនគ្រាន់តែលេខ ឬនិមិត្តសញ្ញាទេ។",
  "Your session ended. Please log in and try again.":
    "វគ្គរបស់អ្នកបានបញ្ចប់។ សូមចូល ហើយព្យាយាមម្តងទៀត។",
  "We couldn't upload your photo. Make sure it is a JPG, PNG, GIF, or WebP under 5 MB, then try again.":
    "យើងមិនអាចផ្ទុករូបថតរបស់អ្នកបានទេ។ សូមពិនិត្យថាវាជា JPG, PNG, GIF ឬ WebP តូចជាង 5 MB រួចព្យាយាមម្តងទៀត។",
  "That link could not be loaded as an image. Check the URL and try again.":
    "តំណនោះមិនអាចផ្ទុកជារូបភាពបានទេ។ សូមពិនិត្យ URL ហើយព្យាយាមម្តងទៀត។",
  "Add a photo: upload an image file or paste an image link.":
    "សូមបន្ថែមរូបថត៖ ផ្ទុកឯកសាររូបភាព ឬបិទភ្ជាប់តំណរូបភាព។",
  "We couldn't save your entry. Please try again.":
    "យើងមិនអាចរក្សាទុកទិន្នន័យរបស់អ្នកបានទេ។ សូមព្យាយាមម្តងទៀត។",
  "That change wasn't saved": "ការផ្លាស់ប្តូរនោះមិនត្រូវបានរក្សាទុកទេ",
  "Photo must be a JPG, PNG, GIF, or WebP file.":
    "រូបថតត្រូវតែជាឯកសារ JPG, PNG, GIF ឬ WebP។",
  "Photo must be smaller than 5 MB.":
    "រូបថតត្រូវតែតូចជាង 5 MB។",
  "That file is not an image.": "ឯកសារនោះមិនមែនជារូបភាពទេ។",
  "That file's contents do not look like a real image.":
    "មាតិការបស់ឯកសារនោះមិនមើលទៅដូចជារូបភាពពិតទេ។",
  "Image link must be a full http(s) URL.":
    "តំណរូបភាពត្រូវតែជា URL http(s) ពេញលេញ។",
  "Image link must use http or https.":
    "តំណរូបភាពត្រូវតែប្រើ http ឬ https។",
};

// Turn an English validation message from the lib helpers into the current
// language. Unknown messages (future copy changes) fall back to English, which
// is no worse than keeping those helpers untouched.
export function translateRuleError(lang, message) {
  if (lang !== "km" || typeof message !== "string") return message;
  const lengthMatch = message.match(LENGTH_RULE_RE);
  if (lengthMatch && FIELD_KM[lengthMatch[1]]) {
    return `${FIELD_KM[lengthMatch[1]]} ត្រូវតែមាន ${lengthMatch[2]}–${lengthMatch[3]} តួអក្សរ។`;
  }
  return RULE_ERROR_KM[message] || message;
}