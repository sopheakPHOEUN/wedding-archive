-- ============================================================
--  Add Khmer contributor name and place to every entry
--
--  Run this in the Supabase SQL Editor (Dashboard > SQL > New query).
--  It is safe to run more than once.
--
--  It adds `contributor_khmer` and `place_khmer` columns to `entries`, so each
--  entry can carry the Khmer spelling of its contributor's name and its
--  location. The site shows the Khmer version when it is switched to Khmer and
--  falls back to the English value when the Khmer one is empty — no display is
--  ever left blank, and nothing existing is changed.
--
--  After running the ALTER statements, fill in the translations below (either
--  here in the SQL editor, or in the Table Editor under the new columns). The
--  home-page cards, the entry detail page, and the review queue then switch.
-- ============================================================

alter table public.entries
  add column if not exists contributor_khmer text;

alter table public.entries
  add column if not exists place_khmer text;

-- ---------------------------------------------------------------------------
--  Fill in the Khmer translations (one UPDATE per entry).
--  The contributor names below are DRAFT spellings proposed so the site can be
--  tested in Khmer immediately — review them first. To correct later, edit the
--  rows in the Table Editor under the new columns, or run an UPDATE with better
--  spellings; every statement here is safe to re-run. Each entry's place is
--  Kompong Cham Province, Cambodia.
-- ---------------------------------------------------------------------------
update public.entries set contributor_khmer = 'លោកគ្រូ រី ភារុម', place_khmer = 'ខេត្តកំពង់ចាម កម្ពុជា'
  where id = '07e02c4f-1ea6-45b6-97d7-5cb85ee6e199'; -- Hair Cutting Ritual
update public.entries set contributor_khmer = 'ជីតា សំ ថង', place_khmer = 'ខេត្តកំពង់ចាម កម្ពុជា'
  where id = '40c2d09a-5be8-4a3a-a7db-dc53dcd4ef85'; -- Krong Pali Ceremony
update public.entries set contributor_khmer = 'លោកគ្រូ ឈត សំណាង', place_khmer = 'ខេត្តកំពង់ចាម កម្ពុជា'
  where id = '434f9838-7acd-4f8a-9875-8aa35eac84e8'; -- Knot Typing Ceremony
update public.entries set contributor_khmer = 'លោកគ្រូ រី ភារុម', place_khmer = 'ខេត្តកំពង់ចាម កម្ពុជា'
  where id = '5317a4a9-beca-4c6d-8bd6-92be2bcee411'; -- Hai Goan Gomloh
update public.entries set contributor_khmer = 'អ្នកស្រី ហៀប សុខា', place_khmer = 'ខេត្តកំពង់ចាម កម្ពុជា'
  where id = '661f3879-a309-463c-9f24-841e73f2d94c'; -- Preah Thong Holding the Sbai
update public.entries set contributor_khmer = 'សហគមន៍មូលដ្ឋាន', place_khmer = 'ខេត្តកំពង់ចាម កម្ពុជា'
  where id = '736985e1-c9d4-4eeb-86fb-8cc0451f3d8c'; -- Holding Umbrella over Parents
update public.entries set contributor_khmer = 'ជីតា សំ ថង', place_khmer = 'ខេត្តកំពង់ចាម កម្ពុជា'
  where id = 'bf5460b9-f7b9-4284-9645-d140a5de2977'; -- Bok Leak Ceremony
update public.entries set contributor_khmer = 'អ្នកស្រី ហៀប សុខា', place_khmer = 'ខេត្តកំពង់ចាម កម្ពុជា'
  where id = 'c694afdd-a011-4093-9207-60dff4dc3660'; -- Bongvul Pbopul
update public.entries set contributor_khmer = 'លោកគ្រូ រី ភារុម', place_khmer = 'ខេត្តកំពង់ចាម កម្ពុជា'
  where id = 'd4b18877-8713-458d-8b72-fc77bbe78437'; -- Sien Doan Taa
