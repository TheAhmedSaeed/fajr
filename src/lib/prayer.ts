import {
  Coordinates,
  CalculationMethod,
  CalculationParameters,
  HighLatitudeRule,
  Madhab,
  PolarCircleResolution,
  PrayerTimes,
} from "adhan";

/**
 * Prayer-time core.
 *
 * Two rules govern everything in this file, and breaking either one silently
 * corrupts the check-in window for users outside the server's timezone:
 *
 *  1. `adhan` reads the *machine-local* Y/M/D components off the Date you hand
 *     it (verified against adhan 4.4.x). So the date must be built with the
 *     local `new Date(y, m, d, ...)` constructor — never `Date.UTC` — so the
 *     components round-trip no matter what TZ the server runs in.
 *
 *  2. A user's "calendar day" is only ever derived from their IANA timezone via
 *     `Intl`, never from the server clock.
 */

export const CALCULATION_METHODS = [
  { id: "UmmAlQura", label: "Umm al-Qura", note: "Makkah · Saudi Arabia" },
  { id: "Egyptian", label: "Egyptian General Authority", note: "Egypt · Levant" },
  { id: "MuslimWorldLeague", label: "Muslim World League", note: "Europe · common default" },
  { id: "Karachi", label: "University of Karachi", note: "Pakistan · India · Bangladesh" },
  { id: "NorthAmerica", label: "ISNA", note: "North America" },
  { id: "Dubai", label: "Dubai", note: "UAE" },
  { id: "Qatar", label: "Qatar", note: "Qatar" },
  { id: "Kuwait", label: "Kuwait", note: "Kuwait" },
  { id: "Turkey", label: "Diyanet", note: "Turkey" },
  { id: "Singapore", label: "MUIS", note: "Singapore · Malaysia" },
  { id: "Tehran", label: "Tehran", note: "Iran" },
  { id: "MoonsightingCommittee", label: "Moonsighting Committee", note: "High-latitude friendly" },
] as const;

export type MethodId = (typeof CALCULATION_METHODS)[number]["id"];
export type MadhabId = "Shafi" | "Hanafi";

export function isMethodId(v: string): v is MethodId {
  return CALCULATION_METHODS.some((m) => m.id === v);
}

export type PrayerLocation = {
  latitude: number;
  longitude: number;
  timezone: string;
  method: MethodId;
  madhab: MadhabId;
};

/** Where in the Fajr window a check-in landed. */
export type Tier = "early" | "middle" | "late";

export type Window = {
  /** Calendar date in the user's timezone, `YYYY-MM-DD`. */
  date: string;
  fajr: Date;
  sunrise: Date;
};

/* ------------------------------------------------------------------ */
/* Calendar-date helpers (timezone-safe)                               */
/* ------------------------------------------------------------------ */

/** The calendar date at `instant` as seen in `timezone`. Returns `YYYY-MM-DD`. */
export function localDate(instant: Date, timezone: string): string {
  // en-CA formats as YYYY-MM-DD, which is exactly the shape we store in Postgres.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

/** Shift a `YYYY-MM-DD` string by whole days. Pure string/UTC math — no zone involved. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

/** Whole days from `a` to `b` (b - a). Both `YYYY-MM-DD`. */
export function daysBetween(a: string, b: string): number {
  const p = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((p(b) - p(a)) / 86_400_000);
}

/**
 * Build a Date whose *machine-local* Y/M/D equal the given calendar day.
 * Noon avoids every DST transition, and adhan only reads the date parts.
 */
function calendarDay(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/* ------------------------------------------------------------------ */
/* Prayer times                                                        */
/* ------------------------------------------------------------------ */

function paramsFor(loc: PrayerLocation): CalculationParameters {
  const coords = new Coordinates(loc.latitude, loc.longitude);
  const params = CalculationMethod[loc.method]();
  params.madhab = Madhab[loc.madhab];
  // `recommended` picks MiddleOfTheNight above ~48° and the twilight angle below it.
  params.highLatitudeRule = HighLatitudeRule.recommended(coords);
  // Without this, latitudes inside the polar circle return Invalid Date in summer.
  params.polarCircleResolution = PolarCircleResolution.AqrabBalad;
  return params;
}

/** Fajr and sunrise for one calendar day at one location. */
export function windowFor(loc: PrayerLocation, date: string): Window {
  const coords = new Coordinates(loc.latitude, loc.longitude);
  const times = new PrayerTimes(coords, calendarDay(date), paramsFor(loc));
  return { date, fajr: times.fajr, sunrise: times.sunrise };
}

export function isValidWindow(w: Window): boolean {
  return (
    w.fajr instanceof Date &&
    w.sunrise instanceof Date &&
    !Number.isNaN(w.fajr.getTime()) &&
    !Number.isNaN(w.sunrise.getTime()) &&
    w.sunrise.getTime() > w.fajr.getTime()
  );
}

/**
 * Which tier `at` falls into, or null if it is outside [fajr, sunrise).
 *
 * The window is split into equal thirds so that logging right after the adhan
 * scores more than scraping in a minute before sunrise. That is the whole point
 * of the scoring system: reward praying early, not merely praying legally.
 */
export function tierAt(w: Window, at: Date): Tier | null {
  const start = w.fajr.getTime();
  const end = w.sunrise.getTime();
  const t = at.getTime();
  if (t < start || t >= end) return null;
  const progress = (t - start) / (end - start);
  if (progress < 1 / 3) return "early";
  if (progress < 2 / 3) return "middle";
  return "late";
}

export type WindowState = "before" | "open" | "closed";

export type TodayView = {
  /** The user's current calendar date, in their timezone. */
  today: string;
  /** Today's Fajr window. */
  window: Window;
  state: WindowState;
  /** Tier you would earn by logging right now; null unless `state === "open"`. */
  tier: Tier | null;
  /** Tomorrow's window — used for the countdown once today's has closed. */
  next: Window;
};

/**
 * Everything the UI and the check-in endpoint need to reason about "now".
 * `now` is a real instant; all day boundaries come from `loc.timezone`.
 */
export function todayView(loc: PrayerLocation, now: Date = new Date()): TodayView {
  const today = localDate(now, loc.timezone);
  const window = windowFor(loc, today);
  const next = windowFor(loc, addDays(today, 1));

  let state: WindowState;
  if (now.getTime() < window.fajr.getTime()) state = "before";
  else if (now.getTime() < window.sunrise.getTime()) state = "open";
  else state = "closed";

  return { today, window, state, tier: tierAt(window, now), next };
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

export function formatTime(instant: Date, timezone: string): string {
  if (Number.isNaN(instant.getTime())) return "--:--";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(instant);
}
