-- ============================================================
--  Add Khmer descriptions and store the archive story in Khmer
--
--  Run this in the Supabase SQL Editor (Dashboard > SQL > New query).
--  It is safe to run more than once.
--
--  It does two things:
--    1. Adds a `description_khmer` column to `entries`, so every entry can
--       carry its own Khmer description alongside the English one.
--    2. Creates the `archive` table with one row holding the archive's own
--       story in English and Khmer. The home page reads this row and shows
--       the Khmer version when the site is switched to Khmer.
--       (collection.config.js is the fallback if the row is missing.)
-- ============================================================

-- 1) Every entry gets a Khmer description column.
alter table public.entries
  add column if not exists description_khmer text;

-- 2) One-row table for the archive's own bilingual description.
create table if not exists public.archive (
  id smallint primary key default 1 check (id = 1),
  description text not null,
  description_khmer text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed the single row. Keep these in sync with collection.config.js.
insert into public.archive (id, description, description_khmer)
values (
  1,
  'An archive documenting the traditional order and rituals of a Khmer wedding ceremony. ',
  'បណ្ណសារមួយដែលកត់ត្រាពីលំដាប់ប្រពៃណី និងពិធីផ្សេងៗនៃពិធីរៀបការបែបខ្មែរ។'
)
on conflict (id) do nothing;

-- Public read access so the home page can display the story to everyone.
alter table public.archive enable row level security;

drop policy if exists "Archive is publicly readable" on public.archive;
create policy "Archive is publicly readable"
  on public.archive
  for select
  using (true);

-- The archive owner (the student) keeps write access through their session.
drop policy if exists "Owner can update the archive" on public.archive;
create policy "Owner can update the archive"
  on public.archive
  for update
  to authenticated
  using (true)
  with check (true);