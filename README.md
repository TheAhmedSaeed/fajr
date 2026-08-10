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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | The **Publishable key** (`sb_publishable_…`), formerly `anon`. Safe in the browser. |
| `SUPABASE_SERVICE_ROLE_KEY` | The **Secret key** (`sb_secret_…`), formerly `service_role` — **server-only, never expose it**. `SUPABASE_SECRET_KEY` works as an alias. |
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

### Email

Supabase's built-in email service is rate-limited to a handful of messages an hour,
project-wide. That is not enough to onboard even a small group, so configure your own SMTP
under **Authentication → Emails** before inviting anyone.

Two settings, not one: configuring SMTP does **not** raise the cap. Also raise the email
limit under **Authentication → Rate Limits**, which stays at the low default until changed.

**If sign-in reports success but no mail arrives**, `signInWithOtp` returned OK because the
message was *queued*, not delivered — so the failure is downstream and will not appear in the
app. Check, in order:

1. **Supabase → Logs → Auth.** An SMTP rejection is recorded here with the provider's reason.
   Nothing logged at all means the request never reached Supabase.
2. **Your provider's own log** (Resend → Emails, SendGrid → Activity). Present but bounced or
   blocked is a deliverability problem; absent entirely means the credentials point somewhere
   other than you think.
3. **Sender address.** It must be on a domain you have verified with the provider. Most
   providers accept the SMTP connection and then reject the message when the From address is
   unverified, which looks exactly like silence.
4. **Port and username.** Port 465 is implicit TLS, 587 is STARTTLS — the wrong pairing fails
   quietly. Providers often want a literal username rather than your email (Resend uses
   `resend`, with the API key as the password).

The app logs the underlying error from Supabase to the server console on every failed
sign-in, so your host's logs (Railway → Deployments → Logs) will show the real reason
alongside whatever the user was told.

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

If you see **`Could not find the 'city_id' column of 'profiles' in the schema cache`**, this
is the step you are missing.

Re-run `supabase/schema.sql` after pulling — it is idempotent and every change is additive,
so nothing is lost:

- `profiles.city_id` remembers *which* bundled city was picked, so its name renders in the
  reader's own language rather than the one chosen by whoever set it.
- `profiles.calculation_method` now defaults to `UmmAlQura`.
- `profiles.madhab` is made nullable and is no longer read. The column is left in place
  rather than dropped, since dropping it would be destructive; you can remove it by hand if
  you want the table tidy.

The file ends with `notify pgrst, 'reload schema'`, because PostgREST answers from a cached
copy of the schema and can keep reporting a column as missing for a while after it exists.
Onboarding also survives the un-migrated case: `city_id` only decides whether a city name can
be translated, so if the column is absent the save retries without it rather than blocking
you.

**The calculation method is not a user-facing setting.** Each bundled city carries the
convention its own local authority uses — Umm al-Qura in Saudi, the Egyptian authority in
Egypt and the Levant, ISNA in North America, and so on — so choosing a city chooses the
method. Umm al-Qura is the fallback for a dropped pin. Twelve methods are supported
internally; the picker was removed because it asked people to answer a question their city
already answers.

**Madhab is not stored or used at all.** It only changes the Asr shadow ratio: verified to
move Asr by 78 minutes in Cairo while leaving Fajr and sunrise byte-identical. Since nothing
here computes anything but Fajr and sunrise, it was a setting that could not affect any
number on the screen.

High latitudes use `adhan`'s recommended rule, and locations inside the polar circle fall
back to `AqrabBalad` (nearest locality) rather than returning an invalid time.

**Known limitation:** above the Arctic/Antarctic circles the nearest-locality substitution
can place the resolved window on an adjacent local date, so the check-in button may not
open on some midsummer days. Everything degrades safely — no bad data is written — but that
case deserves a dedicated rule if anyone actually uses it from Tromsø.

---

## Translations

Every string the app displays lives in [`locales/ar.json`](locales/ar.json) and
[`locales/en.json`](locales/en.json). Nothing user-facing is hard-coded in a component, so
translating is editing two files — no TypeScript involved.

- `{braces}` are filled at runtime. Keep every placeholder a string contains; you may move it
  within the sentence, which matters when the natural word order differs.
- `units` holds counted nouns. Arabic changes the noun at one, two, three-to-ten and
  eleven-plus, so a number is never simply concatenated to a plural. The keys are the standard
  CLDR categories (`zero`/`one`/`two`/`few`/`many`/`other`) and `Intl.PluralRules` picks
  between them. Write `{n}` where the numeral should appear, and leave it out where the word
  already carries it — `يومان` needs no digit.

After editing, run `npm test`. It checks that both files declare the same keys, that matching
strings use the same placeholders, that nothing was left blank, that every counted noun covers
the categories its language actually uses, and that no placeholder survives into rendered
output. A dropped `{email}`, a deleted key or an emptied value each fail with the exact path.

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
locales/             ar.json / en.json — all display text, editable without code
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
