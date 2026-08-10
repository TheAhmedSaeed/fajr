import test from "node:test";
import assert from "node:assert/strict";

import {
  pointsFor,
  currentStreak,
  longestStreak,
  computeStats,
  graceUsedThisMonth,
  weekStart,
  monthStart,
  periodRange,
  rankLeaderboard,
  computeGroupStats,
  badgesFor,
  GRACE_PER_MONTH,
} from "../.test-build/src/lib/scoring.js";

const prayed = (date, tier = "middle", jamaah = false, user = "u1") => ({
  user_id: user,
  prayer_date: date,
  kind: "prayed",
  tier,
  in_congregation: jamaah,
  points: pointsFor(tier, jamaah),
});

const grace = (date, user = "u1") => ({
  user_id: user,
  prayer_date: date,
  kind: "grace",
  tier: null,
  in_congregation: false,
  points: 0,
});

test("points reward praying earlier in the window", () => {
  assert.equal(pointsFor("early", false), 3);
  assert.equal(pointsFor("middle", false), 2);
  assert.equal(pointsFor("late", false), 1);
  assert.equal(pointsFor("early", true), 5); // congregation bonus
  assert.equal(pointsFor("late", true), 3);
  // Praying early alone must still beat praying late in congregation on tier alone.
  assert.ok(pointsFor("early", false) > pointsFor("late", false));
});

test("a streak stays alive until the day is actually missed", () => {
  const days = new Set(["2026-08-03", "2026-08-04", "2026-08-05"]);

  // Mid-morning on the 5th, having logged: 3.
  assert.equal(currentStreak(days, "2026-08-05"), 3);
  // On the 6th before checking in, the streak is not broken yet — it still reads 3.
  assert.equal(currentStreak(days, "2026-08-06"), 3);
  // By the 7th, the 6th was missed and the streak is gone.
  assert.equal(currentStreak(days, "2026-08-07"), 0);
});

test("streaks handle gaps, single days, and empty history", () => {
  assert.equal(currentStreak(new Set(), "2026-08-06"), 0);
  assert.equal(currentStreak(new Set(["2026-08-06"]), "2026-08-06"), 1);
  // A gap resets the current run but not the record.
  const days = new Set(["2026-07-01", "2026-07-02", "2026-07-03", "2026-08-05", "2026-08-06"]);
  assert.equal(currentStreak(days, "2026-08-06"), 2);
  assert.equal(longestStreak(days), 3);
  assert.equal(longestStreak(new Set()), 0);
});

test("streaks cross month and year boundaries", () => {
  const days = new Set(["2025-12-30", "2025-12-31", "2026-01-01", "2026-01-02"]);
  assert.equal(currentStreak(days, "2026-01-02"), 4);
  assert.equal(longestStreak(days), 4);
});

test("a grace day protects the streak without claiming a prayer", () => {
  const rows = [prayed("2026-08-03"), prayed("2026-08-04"), grace("2026-08-05"), prayed("2026-08-06")];
  const stats = computeStats(rows, "2026-08-06");

  assert.equal(stats.currentStreak, 4, "the grace day bridges the gap");
  assert.equal(stats.daysPrayed, 3, "but it does not count as a prayer");
  assert.equal(stats.graceUsed, 1);
  // Consistency counts prayers over elapsed days, so the grace day does not inflate it.
  assert.equal(stats.consistency, 3 / 4);
});

test("grace days are budgeted per calendar month", () => {
  const rows = [grace("2026-08-02"), grace("2026-08-09"), grace("2026-07-11")];
  assert.equal(graceUsedThisMonth(rows, "2026-08-20"), 2);
  assert.equal(graceUsedThisMonth(rows, "2026-07-20"), 1);
  assert.equal(graceUsedThisMonth(rows, "2026-09-01"), 0, "the budget resets on the 1st");
  assert.ok(graceUsedThisMonth(rows, "2026-08-20") >= GRACE_PER_MONTH);
});

test("computeStats summarises a history correctly", () => {
  const rows = [
    prayed("2026-08-01", "early", true),
    prayed("2026-08-02", "early", false),
    prayed("2026-08-03", "late", false),
    prayed("2026-08-05", "middle", true),
  ];
  const stats = computeStats(rows, "2026-08-05");

  assert.equal(stats.totalPoints, 5 + 3 + 1 + 4);
  assert.equal(stats.earlyCount, 2);
  assert.equal(stats.congregationCount, 2);
  assert.equal(stats.daysPrayed, 4);
  assert.equal(stats.firstDate, "2026-08-01");
  assert.equal(stats.consistency, 4 / 5);
  assert.equal(stats.loggedToday, true);
  assert.equal(stats.streakAtRisk, false);
});

test("a live streak with no check-in yet today is flagged at risk", () => {
  const rows = [prayed("2026-08-04"), prayed("2026-08-05")];
  const stats = computeStats(rows, "2026-08-06");
  assert.equal(stats.currentStreak, 2);
  assert.equal(stats.loggedToday, false);
  assert.equal(stats.streakAtRisk, true);
});

test("a user with no history has null consistency rather than 0%", () => {
  const stats = computeStats([], "2026-08-06");
  assert.equal(stats.consistency, null);
  assert.equal(stats.currentStreak, 0);
  assert.equal(stats.streakAtRisk, false, "no streak means nothing to lose");
});

test("consistency never exceeds 100%", () => {
  const stats = computeStats([prayed("2026-08-06")], "2026-08-06");
  assert.equal(stats.consistency, 1);
});

test("week starts on Sunday and month ranges are inclusive", () => {
  // 2026-08-06 is a Thursday.
  assert.equal(weekStart("2026-08-06"), "2026-08-02");
  assert.equal(weekStart("2026-08-02"), "2026-08-02", "Sunday is its own week start");
  assert.equal(weekStart("2026-08-08"), "2026-08-02", "Saturday closes the week");
  assert.equal(weekStart("2026-08-09"), "2026-08-09", "the next Sunday opens a new one");
  assert.equal(monthStart("2026-08-06"), "2026-08-01");

  assert.deepEqual(periodRange("week", "2026-08-06"), { from: "2026-08-02", to: "2026-08-06" });
  assert.deepEqual(periodRange("month", "2026-08-06"), { from: "2026-08-01", to: "2026-08-06" });
  assert.equal(periodRange("all", "2026-08-06").from, "0000-01-01");
});

test("leaderboard ranks by points, then attendance, then streak", () => {
  const row = (name, points, daysPrayed, streak) => ({
    userId: name,
    name,
    points,
    daysPrayed,
    earlyCount: 0,
    currentStreak: streak,
    consistency: null,
    loggedToday: false,
  });

  const ranked = rankLeaderboard([
    row("Bilal", 10, 5, 5),
    row("Ahmed", 14, 5, 2),
    row("Omar", 10, 6, 1),
  ]);
  assert.deepEqual(ranked.map((r) => r.name), ["Ahmed", "Omar", "Bilal"]);

  // Same points and attendance: the longer streak wins.
  const tie = rankLeaderboard([row("Zayd", 10, 5, 1), row("Anas", 10, 5, 9)]);
  assert.equal(tie[0].name, "Anas");
});

test("a group perfect day requires every member to have logged", () => {
  const members = ["u1", "u2"];
  const rows = [
    prayed("2026-08-04", "early", false, "u1"),
    prayed("2026-08-04", "late", false, "u2"),
    prayed("2026-08-05", "early", false, "u1"),
    prayed("2026-08-05", "middle", false, "u2"),
    prayed("2026-08-06", "early", false, "u1"), // u2 missed
  ];

  const stats = computeGroupStats(rows, members, "2026-08-06", null);
  assert.equal(stats.perfectDays, 2);
  // The 6th is not perfect, but the streak may still stand on the 5th today.
  assert.equal(stats.perfectStreak, 2);

  // By the 7th the run has ended.
  assert.equal(computeGroupStats(rows, members, "2026-08-07", null).perfectStreak, 0);
  // An empty group has nothing to be perfect about.
  assert.deepEqual(computeGroupStats(rows, [], "2026-08-06", null), {
    perfectDays: 0,
    perfectStreak: 0,
  });
});

test("group stats ignore logs from non-members and days before `since`", () => {
  const rows = [
    prayed("2026-08-05", "early", false, "u1"),
    prayed("2026-08-05", "early", false, "u2"),
    prayed("2026-08-05", "early", false, "stranger"),
    prayed("2026-08-01", "early", false, "u1"),
    prayed("2026-08-01", "early", false, "u2"),
  ];
  const stats = computeGroupStats(rows, ["u1", "u2"], "2026-08-05", "2026-08-03");
  assert.equal(stats.perfectDays, 1, "the 1st predates `since` and must not count");
});

test("badges unlock at their thresholds and report partial progress", () => {
  const fresh = badgesFor(computeStats([], "2026-08-06"));
  assert.ok(fresh.every((b) => !b.earned));
  assert.equal(fresh.find((b) => b.id === "first").progress, 0);

  const week = [];
  for (let i = 0; i < 7; i++) week.push(prayed(`2026-08-0${i + 1}`, "early"));
  const badges = badgesFor(computeStats(week, "2026-08-07"));
  const byId = Object.fromEntries(badges.map((b) => [b.id, b]));

  assert.equal(byId.first.earned, true);
  assert.equal(byId.streak7.earned, true);
  assert.equal(byId.streak30.earned, false);
  assert.equal(byId.early10.earned, false);
  assert.ok(Math.abs(byId.early10.progress - 0.7) < 1e-9, "7 of 10 early check-ins");
  assert.ok(byId.streak30.progress > 0 && byId.streak30.progress < 1);
});

test("a badge earned on a past streak is not lost when the streak breaks", () => {
  const rows = [];
  for (let i = 1; i <= 8; i++) rows.push(prayed(`2026-07-0${i}`));
  // Long gap: current streak is 0, but the record still stands.
  const stats = computeStats(rows, "2026-08-06");
  assert.equal(stats.currentStreak, 0);
  assert.equal(badgesFor(stats).find((b) => b.id === "streak7").earned, true);
});
