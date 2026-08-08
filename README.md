# Fajr 🌅

The interface is **Arabic by default, fully right-to-left**, with an English toggle in the
header (remembered in a cookie).

A group streak for Fajr. You create a group, invite people, and everyone checks in — but
**only between the adhan and sunrise in their own city, on today's date.** There is no
backfilling and no editing. That constraint is the whole product; the leaderboard is only
worth something because the window is real.

Built with Next.js 16 (App Router), Supabase (Postgres + magic-link auth), and
[`adhan`](https://github.com/batoulapps/adhan-js) for prayer-time astronomy.

---

## How the gamification works

**Points, not just streaks.** A pure streak rewards logging at 05:59 exactly as much as
praying right after the adhan. So the window is split into equal thirds:

| When you log | Tier | Points |
| --- | --- | --- |
| First third of the window | First light · الوقت المختار | **3** |
| Middle third | On time · في الوقت | **2** |
| Last third, before sunrise | Just in time · قبل الشروق | **1** |

Praying in congregation adds **+2** on top (self-reported).

**Streaks, with a floor.** The failure mode of a pure streak is a cliff — miss day 47 and
the whole thing collapses, so people quit instead of restarting. Each person gets **2 grace
days a month**. A grace day protects the streak and nothing else: it scores zero points,
never counts as a prayer, and never touches your consistency percentage. It can only be
applied to the previous day.

**Leaderboards that a newcomer can win.** Week / month / all-time. The weekly board resets,
so someone joining today isn't permanently behind a person with a 200-day streak. Ranking is
points → days prayed → current streak.

**The Dawn Board.** During the window, the group page shows every member's live status,
each evaluated against *their own* city — who's in, whose window is open right now, who
missed. This is the part that actually creates accountability; a leaderboard is
retrospective, but seeing that your brother is still asleep is happening now.

**A shared streak.** Days when *every* member logs are "perfect days", and consecutive
perfect days become a group streak. It gives the group something to lose together.

**Badges.** First Light, 7/30/40/100-day streaks, 10/50 first-third check-ins, and 10/40
congregation prayers. A badge earned on a past streak isn't lost when that streak breaks.

---

## Setup

### 1. Create a Supabase project

At [supabase.com](https://supabase.com) — the free tier is plenty.

### 2. Run the schema

Open **SQL Editor** in the Supabase dashboard, paste all of
[`supabase/schema.sql`](supabase/schema.sql), and run it. It's idempotent, so re-running
after an edit is safe. It creates the tables, the row-level security policies, the
new-user trigger, and the invite-code generator.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in from **Project Settings → API**:

| Variable | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key — **server-only, never expose it** |
| `NEXT_PUBLIC_SITE_URL` | Optional override. Leave unset and the origin is taken from the request, which is correct on Railway/Vercel. Set it only to force a specific host — no trailing slash needed, it is stripped. |

### 4. Point Supabase auth at your app

**Authentication → URL Configuration**:

- *Site URL* → your `NEXT_PUBLIC_SITE_URL`
- *Redirect URLs* → add `http://localhost:3000/**` and `https://your-domain.com/**`

Use the `/**` wildcard rather than the bare `/auth/callback` path. The sign-in link carries a
`?next=` query string, and an exact-path entry does not always match it.

Add a `/**` entry for **every** origin you sign in from, including `http://localhost:3000/**`
if you also develop locally. Supabase does not error on an unlisted redirect — it quietly
discards it and substitutes the Site URL, so the failure looks like a link pointing at the
wrong host rather than a rejection.

The host in the emailed link comes from **the app that sent it**, not from Supabase's Site
URL. Signing in from `localhost` produces a localhost link, which is correct; signing in from
production produces a production link. If a deployed site emails localhost links, the origin
is being misread — see `src/lib/site-url.ts`.

### 5. Run it

```bash
npm install
npm run dev
```

### Deploying

Set the same four environment variables in your host's project settings, with
`NEXT_PUBLIC_SITE_URL` as your production origin, and add that origin to the Supabase
redirect list.

**Railway:** generate a domain (Settings → Networking → Generate Domain) and deploy. You do
not need to set `NEXT_PUBLIC_SITE_URL` — the origin is read from the `x-forwarded-host` and
`x-forwarded-proto` headers Railway sets, so links point at your real domain automatically.
`npm run build` / `npm run start` are already wired up, and `next start` honours `PORT`.

If you *do* set `NEXT_PUBLIC_SITE_URL`, redeploy after changing it: Next.js inlines
`NEXT_PUBLIC_*` at build time, so a value edited after the first deploy has no effect until
the app is rebuilt.

**Vercel:** works as-is with the same four variables.

> Supabase's built-in email service is rate-limited to a handful of messages an hour, which
> is fine for a family group but will throttle a real launch. Plug in an SMTP provider under
> **Authentication → Emails** before inviting a crowd.

---

## Why check-ins can't be forged

The one thing that would make this pointless is a user writing their own check-in rows.

- `fajr_logs` has **no `INSERT`, `UPDATE`, or `DELETE` policy** for the `authenticated`
  role. Someone holding the public anon key — which ships to every browser — cannot write
  a row, forge a date, or delete a miss.
- Check-ins are written **only** by a server action using the service-role key, and only
  after it recomputes the window from the stored profile and the *server* clock. The
  browser sends one thing: the congregation checkbox. No date, time, or tier is ever
  accepted from the client.
- `unique (user_id, prayer_date)` makes double-logging a day impossible at the database
  level, not just in application code.
- A `CHECK` constraint enforces that a real check-in carries a tier and a grace day carries
  none, scores zero, and can't claim congregation.

What this *doesn't* do is prove anyone prayed — nothing could, and that part stays between
a person and Allah. What it does prove is that they were awake and present during the
window, which is most of the battle.

---

## Prayer-time correctness

Two rules govern `src/lib/prayer.ts`, and breaking either silently corrupts the window for
anyone outside the server's timezone:

1. **`adhan` reads machine-local date components** off the `Date` you hand it. So the date
   is built with the local `new Date(y, m, d, 12)` constructor, never `Date.UTC`, so the
   components round-trip regardless of the server's `TZ`. (Verified — the test suite passes
   identically under `TZ=UTC`, `America/Los_Angeles`, `Pacific/Kiritimati`, and
   `Asia/Kolkata`.)
2. **A user's calendar day comes only from their IANA timezone** via `Intl`, never from the
   server clock.

The test suite sweeps all 88 bundled cities across the solstices and mid-January, asserting
that the computed Fajr and sunrise always land on the requested local calendar date, and
spot-checks against published values (Riyadh 6 Aug: 03:58 / 05:24; London 21 Dec sunrise:
08:04; NYC 6 Aug sunrise: 05:58).

```bash
npm test        # 26 tests, no database required
npm run typecheck
```

### Upgrading an existing database

The Arabic release added `profiles.city_id`, which remembers *which* bundled city was picked
so the name can be rendered in the reader's own language. Re-run `supabase/schema.sql` — it
is idempotent and the new column is an `add column if not exists`, so nothing is lost.

Twelve calculation methods are supported (Umm al-Qura, Egyptian, MWL, Karachi, ISNA,
Diyanet, MUIS, and others); each bundled city defaults to the convention its local
authority actually uses. High latitudes use `adhan`'s recommended rule, and locations
inside the polar circle fall back to `AqrabBalad` (nearest locality) rather than returning
an invalid time.

**Known limitation:** above the Arctic/Antarctic circles the nearest-locality substitution
can place the resolved window on an adjacent local date, so the check-in button may not
open on some midsummer days. Everything degrades safely — no bad data is written — but that
case deserves a dedicated rule if anyone actually uses it from Tromsø.

---

## Project layout

```
src/
  lib/
    prayer.ts        Prayer-time core — timezone-safe date handling, window tiers
    scoring.ts       Points, streaks, grace days, badges, leaderboards, group stats
    cities.ts        88 cities with coordinates, timezones, and local method defaults
    data.ts          Read layer (row-level security applies to every query here)
    supabase/        Session client, browser client, service-role client
  app/
    actions.ts       All server actions — check-in enforcement lives here
    dashboard/       Personal check-in, stats, badges, groups
    g/[id]/          Group page: dawn board, leaderboard, invites
    join/[code]/     Public invite landing page
    onboarding/      One-time location + method setup
supabase/schema.sql  Tables, RLS policies, triggers, invite-code generator
tests/               Unit tests for the prayer and scoring cores
```

---

## Things worth building next

- **Push notifications** at the adhan and again 20 minutes before sunrise. This is the
  single highest-impact addition; right now the app can only help someone who already
  opened it.
- **Nudges** — a one-tap "wake up" ping to group members whose window is open and who
  haven't logged.
- **Time-zone-aware group weeks.** Leaderboard periods currently use the *viewer's*
  calendar, which is intuitive but means two members in distant zones can briefly disagree
  about where a week ends.
