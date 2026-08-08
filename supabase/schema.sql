-- Fajr — database schema, row-level security, and helpers.
-- Paste the whole file into the Supabase SQL editor and run it once.
-- It is written to be idempotent, so re-running after an edit is safe.

create extension if not exists pgcrypto;

/* ------------------------------------------------------------------ */
/* Tables                                                              */
/* ------------------------------------------------------------------ */

create table if not exists public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  email              text,
  display_name       text,
  city_label         text,
  latitude           double precision,
  longitude          double precision,
  timezone           text,
  -- Not user-facing: set from the city that was picked, since each bundled city
  -- carries the convention its own local authority uses. Umm al-Qura is the
  -- fallback for a dropped pin.
  calculation_method text not null default 'UmmAlQura',
  created_at         timestamptz not null default now()
);

-- Added after the first release: remembers which bundled city was picked so the
-- name can be shown in the reader's own language. Free-text `city_label` stays
-- as the fallback for pinned coordinates.
alter table public.profiles add column if not exists city_id text;

-- Madhab was dropped from the app: it only changes the Asr shadow ratio, and
-- nothing here computes anything but Fajr and sunrise. Existing databases keep
-- the column (dropping it would be destructive); it is simply no longer read.
alter table public.profiles alter column madhab drop not null;
alter table public.profiles alter column calculation_method set default 'UmmAlQura';

comment on column public.profiles.timezone is
  'IANA timezone. Every calendar-day boundary for this user is derived from it.';

create table if not exists public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(trim(name)) between 1 and 60),
  description text check (char_length(description) <= 280),
  owner_id    uuid not null references public.profiles (id) on delete cascade,
  invite_code text not null unique,
  created_at  timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id  uuid not null references public.groups (id) on delete cascade,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  role      text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index if not exists group_members_user_idx on public.group_members (user_id);

-- One row per user per day. The unique constraint is the real guarantee that a
-- day cannot be logged twice; everything else is application-level.
create table if not exists public.fajr_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  prayer_date     date not null,
  kind            text not null default 'prayed' check (kind in ('prayed', 'grace')),
  tier            text check (tier in ('early', 'middle', 'late')),
  in_congregation boolean not null default false,
  points          integer not null default 0,
  -- Kept for auditing: what the server believed the window was at check-in time.
  fajr_at         timestamptz,
  sunrise_at      timestamptz,
  logged_at       timestamptz not null default now(),
  unique (user_id, prayer_date),
  -- A real check-in must carry a tier; a grace day must not.
  constraint tier_matches_kind check (
    (kind = 'prayed' and tier is not null) or
    (kind = 'grace'  and tier is null and points = 0 and in_congregation = false)
  )
);

create index if not exists fajr_logs_user_date_idx on public.fajr_logs (user_id, prayer_date desc);

/* ------------------------------------------------------------------ */
/* New-user trigger                                                    */
/* ------------------------------------------------------------------ */

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

/* ------------------------------------------------------------------ */
/* Invite codes                                                        */
/* ------------------------------------------------------------------ */

-- Ambiguous glyphs (0/O, 1/I) are excluded so codes survive being read aloud.
create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
  i integer;
begin
  loop
    code := '';
    for i in 1..8 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.groups g where g.invite_code = code);
  end loop;
  return code;
end;
$$;

/* ------------------------------------------------------------------ */
/* Membership helpers                                                  */
/* ------------------------------------------------------------------ */

-- SECURITY DEFINER so these can read group_members without re-entering the
-- policies defined on it. Without that, a membership policy that queries
-- group_members recurses infinitely.

create or replace function public.is_group_member(p_group uuid, p_user uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group and user_id = p_user
  );
$$;

create or replace function public.shares_group_with_me(p_user uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members mine
    join public.group_members theirs on theirs.group_id = mine.group_id
    where mine.user_id = auth.uid() and theirs.user_id = p_user
  );
$$;

/* ------------------------------------------------------------------ */
/* Row-level security                                                  */
/* ------------------------------------------------------------------ */

alter table public.profiles      enable row level security;
alter table public.groups        enable row level security;
alter table public.group_members enable row level security;
alter table public.fajr_logs     enable row level security;

-- profiles ---------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.shares_group_with_me(id));

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to authenticated
  with check (id = auth.uid());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- groups -----------------------------------------------------------------
drop policy if exists groups_select on public.groups;
create policy groups_select on public.groups for select to authenticated
  using (public.is_group_member(id, auth.uid()));

drop policy if exists groups_insert on public.groups;
create policy groups_insert on public.groups for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists groups_update on public.groups;
create policy groups_update on public.groups for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists groups_delete on public.groups;
create policy groups_delete on public.groups for delete to authenticated
  using (owner_id = auth.uid());

-- group_members ----------------------------------------------------------
drop policy if exists group_members_select on public.group_members;
create policy group_members_select on public.group_members for select to authenticated
  using (public.is_group_member(group_id, auth.uid()));

-- Joining is deliberately server-only: the server checks the invite code first,
-- then writes with the service role. There is no client INSERT policy.

drop policy if exists group_members_delete on public.group_members;
create policy group_members_delete on public.group_members for delete to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid())
  );

-- fajr_logs --------------------------------------------------------------
drop policy if exists fajr_logs_select on public.fajr_logs;
create policy fajr_logs_select on public.fajr_logs for select to authenticated
  using (user_id = auth.uid() or public.shares_group_with_me(user_id));

-- No INSERT / UPDATE / DELETE policy exists for `authenticated`, on purpose.
-- Check-ins are written only by the server, which verifies against real
-- computed prayer times first. A user holding the anon key cannot forge a day.

/* ------------------------------------------------------------------ */
/* Schema cache                                                        */
/* ------------------------------------------------------------------ */

-- PostgREST answers from a cached copy of the schema, so a freshly added column
-- can still come back as "Could not find the 'x' column ... in the schema cache"
-- until it reloads. This makes the reload immediate rather than eventual.
notify pgrst, 'reload schema';
