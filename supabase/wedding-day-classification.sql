-- ============================================================
--  Wedding day + sequence classification for entries
--
--  Run this in the Supabase SQL Editor (Dashboard > SQL > New query).
--  It is safe to run more than once.
--
--  It reuses the existing `entries` table — no new tables, no separate
--  databases — and adds two classification columns plus a reviewer RPC:
--
--    1. `wedding_day`   text    -- 'day1' | 'day2' | 'other' | NULL
--                                  NULL means "not yet classified" and the entry
--                                  stays out of the Day 1 / Day 2 galleries.
--    2. `screen_order`  integer -- the ritual's sequence position inside the
--                                  ceremony. NULL means not positioned.
--
--  The `classify_review_entry` RPC lets a reviewer set the decision
--  ('published' / 'returned' / 'pending') together with the day and sequence in
--  one atomic update — so contributor information is never overwritten. It is
--  SECURITY DEFINER and runs through the same is_reviewer() RPC the site
--  already trusts, so only reviewers can change classification.
-- ============================================================

-- 1) Classification columns on the existing entries table.
alter table public.entries
  add column if not exists wedding_day text;

alter table public.entries
  add column if not exists screen_order integer;

-- 2) The reviewer action that sets day + sequence (optionally together with a
--    new status). Safe to re-run: it simply replaces the previous function.
drop function if exists public.classify_review_entry(uuid, text, text, integer);
create function public.classify_review_entry(
  entry_id uuid,
  decision text,
  day_value text,
  position_value integer
)
returns boolean
language plpgsql security definer
set search_path = public
as $$
declare
  v_is_reviewer boolean;
  v_status text;
begin
  -- Only reviewers may classify an entry. Uses the same is_reviewer() RPC the
  -- rest of the site trusts; if it is not exactly true, nothing changes.
  select public.is_reviewer() into v_is_reviewer;
  if v_is_reviewer is not true then
    return false;
  end if;

  -- A pasted or empty '' means "unclassified" and is stored as NULL so the
  -- public gallery groups it into the separate unclassified section.
  if day_value = '' then
    day_value := null;
  end if;
  if decision = 'pending' then
    v_status := 'pending';
  elsif decision = 'published' then
    v_status := 'published';
  elsif decision = 'returned' then
    v_status := 'returned';
  else
    return false;
  end if;

  update public.entries
     set status = v_status,
         wedding_day = day_value,
         screen_order = position_value
   where id = entry_id;

  return found;
end;
$$;

-- 3) Grant authenticated users permission to CALL the RPC (RLS + definer still
--    guard the actual update to reviewers only, exactly as with review_entry).
revoke all on function public.classify_review_entry(uuid, text, text, integer)
  from public;
grant execute on function public.classify_review_entry(uuid, text, text, integer)
  to authenticated;