# Khmer Living Archive — Khmer Wedding Ceremony

*A bilingual (Khmer / English) archive of the traditional Khmer wedding ceremony, built as the ICT 340 capstone at AUPP, Fall 2026.*

This README documents the project's purpose, design decisions, architecture, data model, security boundaries, development process, cultural sources, and local setup. It is based on the repository details inspected for this project. Anything that cannot be established from the repository or code inspection is identified as something to confirm before submission.

## 1. What this is

This is an archive of the Khmer wedding ceremony, documented in the order the rituals actually happen — from the Day 1 to the main wedding day. The entries were gathered from my grandparents, older relatives, and local elders in my community who have participated in or organised Khmer weddings; every entry names the person who shared it and the place it comes from. A visitor can browse the ceremony day by day, search it in Khmer or English, and open any ritual to read its bilingual description, its contributor, and its place. Anyone can create an account, contribute a ritual of their own, and track its journey to publication on their "My Entries" page. Nothing appears on the public gallery until a reviewer publishes it.

## 2. Who it's for — the people in Cambodia

The archive is built for the people who hold this knowledge: Khmer families and elders (most of whom read Khmer and browse on phones), the younger generation who want to keep wedding traditions, and anyone curious about Khmer culture. Each group shaped a specific decision:

- **Khmer first.** The whole interface is bilingual through one translation layer (`lib/i18n.js`) — the home page, the contribute form (including every validation message, mapped to Khmer by `translateRuleError`), My Entries, the review queue, and the entry detail page. Every entry carries Khmer and English titles, descriptions, contributor names, and places, and the site shows the right one for the active language. A Khmer-browser visitor is switched to the Khmer site automatically on their first visit (`components/LanguageProvider.js`). The search engine matches Khmer as it is actually written: Unicode NFC normalisation, vowel signs and subscripts treated as part of the word, partial Khmer words accepted (`lib/search.js`). Khmer fonts (Kantumruy Pro, Noto Sans Khmer) are loaded so Khmer glyphs always render, and the day tabs even use Khmer numerals (១, ២).
- **Phones first.** The layout reflows at 960 / 860 / 640 px breakpoints, and the navigation collapses into a hamburger menu on phones (`components/Header.js`, `HeaderMenu.js`). The photo carousel supports touch and drag, and honours `prefers-reduced-motion` (`components/AboutSlider.js`).
- **Slow connections.** The site is a static Next.js build plus Supabase — nothing heavy on the critical path. Entry photos load lazily (`loading="lazy"` in the cards), fonts come through plain `<link>` tags with fallback stacks so a blocked font server still shows a working page (`app/layout.js`), and the hero is one local JPG.
- **Sources named and credited.** Every card and entry page shows "Contributed by … • place", switching to the Khmer spelling when the site is in Khmer. Because the people are the source, the review queue deliberately hides who submitted an entry, so the reviewer's decision is about the content, not the person.

## 3. How it's built — the stack and the data model

**Site:** Next.js 15 (App Router, React 19, plain JavaScript only) deployed on Vercel. **Accounts, data, photos:** Supabase — PostgreSQL for data, Supabase Auth for accounts, Supabase Storage for photos — reached through `@supabase/ssr`: a browser client for pages (`lib/supabase-browser.js`) and a server client for the server-rendered `/review` page (`lib/supabase.js`). There is no custom API server; the database's Row Level Security policies and reviewer-guarded functions are the security boundary.

**Tables and objects** (short list, kept true to the SQL in `supabase/`):

| Object | What it holds | Where it is defined |
|---|---|---|
| `entries` | Every entry: bilingual titles and descriptions, contributor + place (English and Khmer), photo (`image`), `owner` (the session user who submitted it), `status`, the reviewer-added `wedding_day` and `screen_order`, `created_at`. | The base table and its RLS came from the course skeleton via the Supabase dashboard and the `CREATE` SQL is **not in this repo (UNSURE)**. The repo contains only the additive `ALTER TABLE` statements that added `description_khmer`, `contributor_khmer`, `place_khmer`, `wedding_day`, and `screen_order`. |
| `archive` | The archive's own bilingual description, one row (`id = 1`). RLS: anyone may read it; any authenticated account may update it. | `supabase/archive-khmer.sql` (committed) |
| `photos` | Storage bucket where uploaded photos land; files are never stored on the app server. | Course skeleton (dashboard) |
| reviewers | **There is no `reviewers` table in this repo.** Reviewer status is a dashboard-side function `is_reviewer()` from the course skeleton. **UNSURE** how it stores membership — its SQL is not in this repository. | Course skeleton (dashboard) |
| `classify_review_entry(entry_id, decision, day_value, position_value)` | The reviewer RPC that sets `status` + `wedding_day` + `screen_order` atomically. `SECURITY DEFINER`, re-checks `is_reviewer()` inside the database, returns `false` (no change) for non-reviewers. | `supabase/wedding-day-classification.sql` (committed) |

**The three entry statuses:**

| Status | Meaning | Who sets it |
|---|---|---|
| `pending` | Submitted, waiting in the review queue. Every new submission is inserted with `status: 'pending'` (`lib/contribute.js`), and every saved edit by a non-reviewer resets it to `pending` again (`lib/entries.js`). |
| `published` | Visible to everyone on the public gallery. Only a reviewer, through the `classify_review_entry` RPC with `decision = 'published'`. |
| `returned` | Sent back to its owner for changes. Only a reviewer, via `decision = 'returned'`. The owner can then edit, and saving sends the entry back to `pending`. |

**Who can read and write what** (the policies actually enforced):

- The public home page only ever fetches `.eq("status", "published")` — that filter is client-side so it applies to logged-in reviewers too (`app/page.js`).
- A contributor's "My Entries" page scopes every query with `.eq("owner", user.id)` (`app/my-entries/page.js`), and update/delete repeat the same scope and verify the write with `.select()` (`lib/entries.js`).
- `/review` is server-rendered: it calls `is_reviewer()` before rendering anything, and only then fetches `pending` rows (`app/review/page.js`).
- A fresh submission can never be published directly: the insert always carries `status: 'pending'` (`lib/contribute.js`), which the skeleton's INSERT policy expects; only the RPC moves entries out of `pending`.
- The exact `entries` RLS predicates live in the dashboard, not in this repo — **UNSURE**, but the app code is written to work with them.

## 4. The gate — how an entry becomes public

**What the gate function does.** The course brief refers to the review function as review_entry. However, this repository uses classify_review_entry(entry_id, decision, day_value, position_value), which is defined in supabase/wedding-day-classification.sql. An earlier function named review_entry is mentioned in the code comments and belongs to the course skeleton. It is not included in this repository, and the review queue does not call it, so its exact behaviour is unconfirmed.

The classify_review_entry function allows an authorised reviewer to set an entry's status to published, returned, or pending, while also assigning its wedding day and sequence position. These changes happen in a single atomic database operation, keeping the review decision and the entry's placement in the archive consistent. This ensures that a published entry has its intended classification for the homepage to display and sort correctly.

**Why the gate lives in the database.** Because the browser can never be trusted to enforce a rule about itself. The function is `SECURITY DEFINER` with `search_path = public`, and at call time it asks `is_reviewer()` again inside the database. A caller on the website can only *ask* — the database decides and returns `false` without changing anything if the caller is not a reviewer. That is why the queue UI (`components/ReviewQueue.js`) can safely send the decision from the browser and rely on the result.

**What a hidden Publish button does and does not protect.** Hiding the Publish button from anyone who is not a reviewer is *cosmetic*, and the README should be explicit about that: it is not the protection. Anyone can open the browser console and call the same RPC (the Supabase key is public by design), or edit the DOM to reveal the button. Nothing in the page stops them. What actually protects the archive is entirely database-side — the RPC's in-database `is_reviewer()` re-check, plus the dashboard RLS policies that would block a plain `UPDATE` that tries to set `status = 'published'` from the client. The hidden button is a good UX cue; the database is the gate.

**The decisions the briefs left to me, named and reasoned:**

1. **What a returned entry says.** There is no freeform reviewer-comment field. A returned entry shows the status label "Returned" (Khmer: ត្រូវការកែសម្រួល — "needs changes") on My Entries, the detail page keeps it out of the public gallery, and the edit page says "Fix what needs fixing, then save your changes." Saving always sends the entry back to the queue as `pending`. I chose this because the brief asks for a simple three-state loop, and a comment field would have been schema and UI the task did not ask for.
2. **Reviewers cannot take down published entries.** The queue fetches only `pending` rows, and the edit page refuses published entries with "already published, so it can't be edited here." There is no unpublish button anywhere, so a published entry stays public. I chose this because the reviewer's job in the brief is to decide on the queue, not to curate the public archive afterwards.
3. **Search shows no contributor their own pending entries.** The home page applies the `status = 'published'` filter to everyone — including the logged-in owner (a comment in `app/page.js` says so on purpose, so even a reviewer who could read pending rows through RLS sees only published ones in the gallery and search). A contributor sees their own pending and returned entries only on My Entries, with status chips. I chose this because the gallery and search are the public face of an archive, so work-in-progress should stay in the private queue until a reviewer is satisfied.

## 5. How it was built — AI assistance (this replaces the Prompt Journal)

The repository's Git history contains commits marked [AI assisted]. Commit messages, diffs, and committed test harnesses provide evidence of the development tasks and code changes. However, the repository does not establish which AI model handled each task. That information may be available in the developer's Cline session history.

**How I checked the AI's work in every row:** I read every diff before committing; I ran the committed offline harnesses (`node test-search.mjs`, `node test-ceremony-order.mjs`, `node test-contribute.mjs`), which run against the real archive data in `data/entries.js`, not mocks; and I tested the gates from a stranger account — a second, non-reviewer account — to confirm submissions land as `pending`, that the RPC refuses non-reviewers, and that no pending/returned content is readable logged out.

| Model | Task (commit) | What the model produced | Kept / rewrote | Verdict |
|---|---|---|---|---|
| **nvidia/nemotron-3.5-lightning** | Sprint 1: entry data + browse (`c23a223`, `abc3684`) | The 8 seed entries and the home gallery cards | Kept the entries (they are my own collected words); reviewed every card file | ✔ kept |
| **anthropic/claude-3-haiku** | Sprint 1: search (`c39884c`, `8466efd`) | `lib/search.js` relevance tiers + result highlighting | Kept the tiers; rewrote the Khmer matching edge cases (NFC, vowel signs) | ✔ kept + `test-search.mjs` |
| **nvidia/nemotron-3.5-lightning:free** | Auth pages (`ff9ad64`, `be9bc1c`, `1ffa869`) | Signup/login pages, header auth state | Kept; later fixed the signup error message | ✔ kept |
| **nvidia/nemotron-3.5-lightning:free** | Sprint 2: data to Supabase (`50ae23a`) | Retire `data/entries.js`; read entries from Supabase | Kept; the seed file now exists only for the offline harnesses | ✔ kept |
| **nvidia/nemotron-3.5-lightning:free** | Sprint 2: contribute form + photo (`45d8951`) | `lib/contribute.js`, `ContributeForm.js` | Kept the OWASP-style upload checks (extension allowlist, magic bytes, 5 MB cap, random storage names) | ✔ kept + `test-contribute.mjs` |
| **nvidia/nemotron-3.5-lightning:fre** | Sprint 2: edit/delete own entries (`5e982c9`) | `lib/entries.js`, edit page | Kept the double ownership check (RLS + `.eq("owner", user.id)` and `.select()` re-read) | ✔ kept |
| **deepseek/deepseek-v4-flash-0731** | Sprint 3: entries wait for review (`a32a630`) | `status: 'pending'` on insert; statuses in the UI | Kept | ✔ kept |
| **deepseek/deepseek-v4-flash-0731** | Sprint 3: review queue (`466cd13`) | `/review` server gate + queue buttons | Kept the server-side `is_reviewer()` gate; rewired the actions onto `classify_review_entry` | ✔ kept |
| **deepseek/deepseek-v4-flash-0731** | Review fix (`7c95ffe`) | Returned entries resubmitted by a reviewer re-enter the queue | Kept the read-status-before-write fix | ✔ kept |
| **deepseek/deepseek-v4-flash-0731** | Day order + classification (`af066c7`) | `lib/ceremony-order.js`, day tabs, `classify_review_entry` SQL | Kept; verified every entry maps to a ceremony step | ✔ kept + `test-ceremony-order.mjs` |
| **deepseek/deepseek-v4-flash-0731** | Design + Khmer pass (`23579f6` → `ab42d57`) | Royal Khmer visual redesign, full bilingual layer | Read each diff; kept the design, kept the Khmer strings verbatim | ✔ kept |
| **deepseek/deepseek-v4-flash-0731** | This README | The README was reviewed and revised against the repository; remaining unverified items are identified for owner confirmation.| ✔ kept |

The rule from the brief: an AI draft is never published as-is. If this README ever claims the archive does something it does not, that is the failure this section exists to prevent.

## 6. Sources — the people behind the archive

All knowledge was gathered from named people with their permission, the way the capstone brief asked in August. The Khmer spellings of the names below are **draft** spellings proposed in `supabase/contributor-place-khmer.sql` — confirm each one with the person before the final. If anyone asks not to be named, replace their row with "a ⟨role⟩ in ⟨place⟩ who asked not to be named."

| Contributor | Rituals they shared | Place |
|---|---|---|
| Grandpa Sam Thong · ជីតា ស៊ាំ ថុង | Krong Pali Ceremony; Bok Leak Ceremony | Kompong Cham Province · ខេត្តកំពង់ចាម កម្ពុជា |
| Lecturer Ry Phearom · លោកគ្រូ រី ភារម្យ | Hair Cutting Ritual; Hai Goan Gomloh; Sien Doan Taa | Kompong Cham Province |
| Lecturer Chot Somnang · លោកគ្រូ ជោត សំណាង | Knot Tying Ceremony | Kompong Cham Province |
| Ms. Heab Sokha · អ្នកស្រី ហៀប សុខា | Preah Thong Holding the Sbai; Bongvul Pbopul | Kompong Cham Province |
| A local community group · សហគមន៍មូលដ្ឋាន | Holding Umbrella over Parents | Kompong Cham Province |

**Photos:** the static images `public/hero.jpg` and `public/old.jpg` are used by the site, but the repository does not document who took them — **Confirm and add the photographer/source and permission for each image, or replace the image before final publication.** Entry photos are uploaded through the contribute form, which records the contributor but has no separate photo-credit field, so photos are credited through the contributor attribution; any photo not taken by me must additionally be credited here.

## 7. Running it

**Clone, install, run:**

```bash
git clone <your-repo-url>
cd wedding-archive
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
```

The offline harnesses (no database, no server) run individually:

```bash
node test-search.mjs          # search engine, against the real entry data
node test-ceremony-order.mjs  # Day 1 / Day 2 ordering
node test-contribute.mjs      # form validation + image URL rules
```

**Environment variables** (by name only — values belong in `.env.local`, which is gitignored; never commit values):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (optional alias — the code tries it first and falls back to the anon key)

The Supabase key the browser receives is **public by design** — it ships to every visitor, and it is safe only because the database's RLS policies and reviewer RPCs (section 3) are the actual boundary. The key itself is not the protection; the policies are. No secret of any kind belongs in this repository or its history.

**Additive schema** (run in the Supabase SQL Editor, in this order; every script is idempotent):

1. `supabase/archive-khmer.sql` — `description_khmer` column + the `archive` table.
2. `supabase/contributor-place-khmer.sql` — `contributor_khmer` / `place_khmer` columns + the per-entry Khmer name updates you must review before relying on them.
3. `supabase/wedding-day-classification.sql` — `wedding_day` / `screen_order` + the `classify_review_entry` RPC.

The base `entries` table, its RLS policies, the `photos` bucket, and the `is_reviewer()` / `review_entry` functions come from the course skeleton in the Supabase dashboard and are not stored in this repo.

