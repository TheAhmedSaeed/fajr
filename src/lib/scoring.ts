import { addDays, daysBetween, type Tier } from "./prayer";

/* ------------------------------------------------------------------ */
/* Points                                                              */
/* ------------------------------------------------------------------ */

/**
 * Praying at the start of the window is the thing we actually want to
 * encourage, so the window's first third is worth triple the last third.
 * Scraping in at 05:59 still counts — it just doesn't win the leaderboard.
 */
export const TIER_POINTS: Record<Tier, number> = {
  early: 3,
  middle: 2,
  late: 1,
  // Outside the window entirely. Recorded, never rewarded.
  overdue: 0,
};

/** Praying in congregation is its own axis, worth a flat bonus on top of the tier. */
export const CONGREGATION_BONUS = 2;

export function pointsFor(tier: Tier, inCongregation: boolean): number {
  // A late check-in scores nothing at all — the congregation bonus cannot
  // rescue it, since the congregation it refers to prayed hours earlier.
  if (tier === "overdue") return 0;
  return TIER_POINTS[tier] + (inCongregation ? CONGREGATION_BONUS : 0);
}

/* ------------------------------------------------------------------ */
/* Grace days                                                          */
/* ------------------------------------------------------------------ */

/**
 * A grace day protects a streak from a single miss. It is deliberately *not* a
 * claim that you prayed: it scores zero points and never counts toward
 * consistency. It exists because the failure mode of a pure streak is a cliff —
 * miss day 47 and the whole thing collapses, so people quit rather than restart.
 */
export const GRACE_PER_MONTH = 2;
/** How far back a grace day may reach. 1 = "yesterday only". */
export const GRACE_LOOKBACK_DAYS = 1;

/**
 * How far back a group owner may reach when logging for a member who could
 * not. Bounded so a well-meaning owner cannot quietly backfill a whole month
 * of streak after the fact.
 */
export const ADMIN_LOG_LOOKBACK_DAYS = 7;

/* ------------------------------------------------------------------ */
/* Log rows                                                            */
/* ------------------------------------------------------------------ */

export type LogKind = "prayed" | "grace";

export type LogRow = {
  user_id: string;
  prayer_date: string;
  kind: LogKind;
  tier: Tier | null;
  in_congregation: boolean;
  points: number;
  /** The group owner who entered this on someone's behalf; null when self-logged. */
  logged_by?: string | null;
};

export type Stats = {
  currentStreak: number;
  longestStreak: number;
  daysPrayed: number;
  totalPoints: number;
  earlyCount: number;
  /** Days prayed but logged after sunrise. Counted, but worth nothing. */
  overdueCount: number;
  congregationCount: number;
  graceUsed: number;
  /** 0..1, or null when the user has never logged. */
  consistency: number | null;
  firstDate: string | null;
  loggedToday: boolean;
  /** Streak is alive but today's check-in is still missing. */
  streakAtRisk: boolean;
};

/* ------------------------------------------------------------------ */
/* Calendar helpers                                                    */
/* ------------------------------------------------------------------ */

function dayOfWeek(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sunday
}

/** Sunday-start week, matching the Sun–Thu working week common across the region. */
export function weekStart(date: string): string {
  return addDays(date, -dayOfWeek(date));
}

export function monthStart(date: string): string {
  return `${date.slice(0, 7)}-01`;
}

export function inRange(date: string, from: string, to: string): boolean {
  return date >= from && date <= to;
}

/* ------------------------------------------------------------------ */
/* Streaks                                                             */
/* ------------------------------------------------------------------ */

/**
 * Consecutive days ending today or yesterday. Anchoring on yesterday matters:
 * at 3pm you have not yet missed today, so a 20-day streak must still read 20
 * rather than dropping to 0 until the user checks in.
 */
export function currentStreak(days: Set<string>, today: string): number {
  let cursor: string;
  if (days.has(today)) cursor = today;
  else if (days.has(addDays(today, -1))) cursor = addDays(today, -1);
  else return 0;

  let n = 0;
  while (days.has(cursor)) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

export function longestStreak(days: Set<string>): number {
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    run = prev !== null && daysBetween(prev, d) === 1 ? run + 1 : 1;
    if (run > best) best = run;
    prev = d;
  }
  return best;
}

/** Roll a user's raw log rows up into everything the UI displays. */
export function computeStats(rows: LogRow[], today: string): Stats {
  const days = new Set(rows.map((r) => r.prayer_date));
  const prayed = rows.filter((r) => r.kind === "prayed");
  const firstDate = rows.length ? rows.map((r) => r.prayer_date).sort()[0] : null;

  // Elapsed days are the denominator; a user who joined 3 days ago is not
  // penalised for the days before they existed.
  const elapsed = firstDate ? daysBetween(firstDate, today) + 1 : 0;
  const streak = currentStreak(days, today);

  return {
    currentStreak: streak,
    longestStreak: longestStreak(days),
    daysPrayed: prayed.length,
    totalPoints: rows.reduce((s, r) => s + r.points, 0),
    earlyCount: prayed.filter((r) => r.tier === "early").length,
    overdueCount: prayed.filter((r) => r.tier === "overdue").length,
    congregationCount: prayed.filter((r) => r.in_congregation).length,
    graceUsed: rows.filter((r) => r.kind === "grace").length,
    consistency: elapsed > 0 ? Math.min(1, prayed.length / elapsed) : null,
    firstDate,
    loggedToday: days.has(today),
    streakAtRisk: streak > 0 && !days.has(today),
  };
}

/** Grace days already spent in the calendar month containing `date`. */
export function graceUsedThisMonth(rows: LogRow[], date: string): number {
  const prefix = date.slice(0, 7);
  return rows.filter((r) => r.kind === "grace" && r.prayer_date.startsWith(prefix)).length;
}

/* ------------------------------------------------------------------ */
/* Badges                                                              */
/* ------------------------------------------------------------------ */

/** Badge identity and progress only — names and requirements come from the dictionary. */
export type BadgeId =
  | "first"
  | "streak7"
  | "streak30"
  | "streak40"
  | "streak100"
  | "early10"
  | "early50"
  | "jamaah10"
  | "jamaah40";

export type Badge = {
  id: BadgeId;
  icon: string;
  earned: boolean;
  /** 0..1 toward earning it. */
  progress: number;
};

function badge(id: BadgeId, icon: string, have: number, need: number): Badge {
  return {
    id,
    icon,
    earned: have >= need,
    progress: Math.min(1, need === 0 ? 1 : have / need),
  };
}

export function badgesFor(stats: Stats): Badge[] {
  // Streak badges key off the best streak ever reached, so breaking a streak
  // never confiscates a badge already earned.
  const best = Math.max(stats.currentStreak, stats.longestStreak);
  return [
    badge("first", "\u{1F305}", stats.daysPrayed, 1),
    badge("streak7", "\u{1F525}", best, 7),
    badge("streak30", "\u{1F319}", best, 30),
    badge("streak40", "\u{1F54B}", best, 40),
    badge("streak100", "\u{1F48E}", best, 100),
    badge("early10", "\u2B50", stats.earlyCount, 10),
    badge("early50", "\u2600\uFE0F", stats.earlyCount, 50),
    badge("jamaah10", "\u{1F54C}", stats.congregationCount, 10),
    badge("jamaah40", "\u{1F932}", stats.congregationCount, 40),
  ];
}

/* ------------------------------------------------------------------ */
/* Leaderboard                                                         */
/* ------------------------------------------------------------------ */

export type LeaderboardRow = {
  userId: string;
  name: string;
  points: number;
  daysPrayed: number;
  earlyCount: number;
  overdueCount: number;
  currentStreak: number;
  consistency: number | null;
  loggedToday: boolean;
};

export type Period = "week" | "month" | "all";

export function periodRange(period: Period, today: string): { from: string; to: string } {
  if (period === "week") return { from: weekStart(today), to: today };
  if (period === "month") return { from: monthStart(today), to: today };
  return { from: "0000-01-01", to: today };
}

/**
 * Points-first, then days prayed, then streak. Points already encode *how early*
 * someone prayed, so this ranks earliness above raw attendance without needing a
 * separate tiebreak rule.
 */
export function rankLeaderboard(rows: LeaderboardRow[]): LeaderboardRow[] {
  return [...rows].sort(
    (a, b) =>
      b.points - a.points ||
      b.daysPrayed - a.daysPrayed ||
      b.currentStreak - a.currentStreak ||
      a.name.localeCompare(b.name),
  );
}

/* ------------------------------------------------------------------ */
/* Group-level stats                                                   */
/* ------------------------------------------------------------------ */

export type GroupStats = {
  /** Days on which every member logged. */
  perfectDays: number;
  /** Consecutive perfect days ending today or yesterday. */
  perfectStreak: number;
};

export function computeGroupStats(
  rows: LogRow[],
  memberIds: string[],
  today: string,
  /** Don't count days before the group had anyone in it. */
  since: string | null,
): GroupStats {
  if (memberIds.length === 0) return { perfectDays: 0, perfectStreak: 0 };

  const members = new Set(memberIds);
  const byDate = new Map<string, Set<string>>();
  for (const r of rows) {
    if (!members.has(r.user_id)) continue;
    if (since && r.prayer_date < since) continue;
    let set = byDate.get(r.prayer_date);
    if (!set) byDate.set(r.prayer_date, (set = new Set()));
    set.add(r.user_id);
  }

  const perfect = new Set<string>();
  for (const [date, set] of byDate) {
    if (set.size === members.size) perfect.add(date);
  }

  return { perfectDays: perfect.size, perfectStreak: currentStreak(perfect, today) };
}
