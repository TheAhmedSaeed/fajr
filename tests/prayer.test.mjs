import test from "node:test";
import assert from "node:assert/strict";

import {
  addDays,
  daysBetween,
  localDate,
  windowFor,
  isValidWindow,
  tierAt,
  todayView,
  formatTime,
  tierAtLocalTime,
  OVERDUE_GRACE_MINUTES,
} from "../.test-build/src/lib/prayer.js";
import { CITIES } from "../.test-build/src/lib/cities.js";

const riyadh = {
  latitude: 24.7136,
  longitude: 46.6753,
  timezone: "Asia/Riyadh",
  method: "UmmAlQura",
};

test("addDays and daysBetween handle month and year boundaries", () => {
  assert.equal(addDays("2026-08-06", 1), "2026-08-07");
  assert.equal(addDays("2026-08-31", 1), "2026-09-01");
  assert.equal(addDays("2026-01-01", -1), "2025-12-31");
  assert.equal(addDays("2024-02-28", 1), "2024-02-29"); // leap year
  assert.equal(daysBetween("2026-08-01", "2026-08-06"), 5);
  assert.equal(daysBetween("2025-12-31", "2026-01-01"), 1);
});

test("localDate reports the date in the target zone, not the server zone", () => {
  // 2026-08-06 22:00Z is already the 7th in Riyadh (+03) and still the 6th in New York (-04).
  const instant = new Date("2026-08-06T22:00:00Z");
  assert.equal(localDate(instant, "Asia/Riyadh"), "2026-08-07");
  assert.equal(localDate(instant, "America/New_York"), "2026-08-06");
  assert.equal(localDate(instant, "UTC"), "2026-08-06");
});

test("prayer times match published values", () => {
  // Riyadh, 6 Aug 2026, Umm al-Qura.
  const w = windowFor(riyadh, "2026-08-06");
  assert.equal(formatTime(w.fajr, "Asia/Riyadh"), "03:58");
  assert.equal(formatTime(w.sunrise, "Asia/Riyadh"), "05:24");

  // London on the winter solstice — sunrise is a well-known 08:04 GMT.
  const london = {
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: "Europe/London",
    method: "MuslimWorldLeague",
  };
  assert.equal(formatTime(windowFor(london, "2026-12-21").sunrise, "Europe/London"), "08:04");
});

test("computed window always falls on the requested calendar date", () => {
  for (const city of CITIES) {
    const loc = {
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone,
      method: city.method,
    };
    for (const date of ["2026-01-15", "2026-06-21", "2026-12-21"]) {
      const w = windowFor(loc, date);
      assert.ok(isValidWindow(w), `${city.name} ${date}: invalid window`);
      assert.equal(
        localDate(w.fajr, city.timezone),
        date,
        `${city.name} ${date}: fajr landed on the wrong local day`,
      );
      assert.equal(
        localDate(w.sunrise, city.timezone),
        date,
        `${city.name} ${date}: sunrise landed on the wrong local day`,
      );
    }
  }
});

test("polar latitudes resolve instead of returning Invalid Date", () => {
  const tromso = {
    latitude: 69.6496,
    longitude: 18.956,
    timezone: "Europe/Oslo",
    method: "MuslimWorldLeague",
  };
  const w = windowFor(tromso, "2026-06-21"); // midnight sun
  assert.ok(isValidWindow(w), "Tromsø midsummer should still produce a usable window");
});

test("tiers split the window into equal thirds and exclude the boundaries", () => {
  const w = windowFor(riyadh, "2026-08-06");
  const start = w.fajr.getTime();
  const span = w.sunrise.getTime() - start;

  assert.equal(tierAt(w, new Date(start - 1)), null, "before the adhan");
  assert.equal(tierAt(w, w.fajr), "early", "the adhan itself is inside the window");
  assert.equal(tierAt(w, new Date(start + span * 0.2)), "early");
  assert.equal(tierAt(w, new Date(start + span * 0.5)), "middle");
  assert.equal(tierAt(w, new Date(start + span * 0.9)), "late");
  // Sunrise ends the legal window; what follows is the grace period, covered
  // by its own test below.
  assert.equal(tierAt(w, w.sunrise), "overdue", "sunrise closes the legal window");
  assert.equal(tierAt(w, new Date(w.sunrise.getTime() + 1)), "overdue", "past sunrise is late");
});

test("todayView tracks the window state across a full day", () => {
  const day = "2026-08-06";
  const w = windowFor(riyadh, day);

  const before = todayView(riyadh, new Date(w.fajr.getTime() - 60_000));
  assert.equal(before.state, "before");
  assert.equal(before.tier, null);
  assert.equal(before.today, day);

  const open = todayView(riyadh, new Date(w.fajr.getTime() + 60_000));
  assert.equal(open.state, "open");
  assert.equal(open.tier, "early");

  const closed = todayView(riyadh, new Date(w.sunrise.getTime() + 90 * 60_000));
  assert.equal(closed.state, "closed");
  assert.equal(closed.tier, null);
  // Tomorrow's window is what the countdown should point at once today has closed.
  assert.equal(closed.next.date, "2026-08-07");
  assert.ok(closed.next.fajr.getTime() > closed.window.sunrise.getTime());
});

test("a user's day boundary follows their timezone, not the server's", () => {
  const la = {
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: "America/Los_Angeles",
    method: "NorthAmerica",
  };
  // 08:00Z on 6 Aug is still the evening of 5 Aug in Los Angeles.
  const view = todayView(la, new Date("2026-08-06T08:00:00Z"));
  assert.equal(view.today, "2026-08-06");

  const evening = todayView(la, new Date("2026-08-06T03:00:00Z")); // 20:00 on the 5th, PDT
  assert.equal(evening.today, "2026-08-05");
});

test("every bundled city has a timezone Intl accepts", () => {
  for (const city of CITIES) {
    assert.doesNotThrow(
      () => new Intl.DateTimeFormat("en-CA", { timeZone: city.timezone }),
      `${city.name} has an invalid timezone: ${city.timezone}`,
    );
    assert.ok(Math.abs(city.latitude) <= 90, `${city.name} latitude out of range`);
    assert.ok(Math.abs(city.longitude) <= 180, `${city.name} longitude out of range`);
  }
});

test("city ids are unique", () => {
  const ids = CITIES.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("the grace window accepts a late check-in, then closes", () => {
  const w = windowFor(riyadh, "2026-08-06");
  const sunrise = w.sunrise.getTime();

  assert.equal(tierAt(w, new Date(sunrise - 1)), "late", "still inside the window");
  assert.equal(tierAt(w, w.sunrise), "overdue", "sunrise itself is already late");
  assert.equal(tierAt(w, new Date(sunrise + 29 * 60_000)), "overdue");
  assert.equal(
    tierAt(w, new Date(sunrise + OVERDUE_GRACE_MINUTES * 60_000)),
    null,
    "the grace period is exclusive at its end",
  );
  assert.equal(tierAt(w, new Date(sunrise + 60 * 60_000)), null, "an hour late is simply missed");

  // The grace period must never reach back before sunrise.
  assert.equal(tierAt(w, new Date(w.fajr.getTime() - 1)), null);
});

test("todayView reports an overdue state between sunrise and the grace cutoff", () => {
  const w = windowFor(riyadh, "2026-08-06");

  const justAfter = todayView(riyadh, new Date(w.sunrise.getTime() + 60_000));
  assert.equal(justAfter.state, "overdue");
  assert.equal(justAfter.tier, "overdue");

  const wellAfter = todayView(riyadh, new Date(w.sunrise.getTime() + 45 * 60_000));
  assert.equal(wellAfter.state, "closed");
  assert.equal(wellAfter.tier, null);
});

test("a reported wall-clock time maps to the same tier as the live clock", () => {
  const date = "2026-08-06";
  const w = windowFor(riyadh, date);
  const tz = riyadh.timezone;

  // Riyadh 2026-08-06: fajr 03:58, sunrise 05:24.
  assert.equal(tierAtLocalTime(w, tz, "03:57"), null, "before the adhan");
  assert.equal(tierAtLocalTime(w, tz, "03:58"), "early");
  assert.equal(tierAtLocalTime(w, tz, "04:20"), "early");
  assert.equal(tierAtLocalTime(w, tz, "04:35"), "middle");
  assert.equal(tierAtLocalTime(w, tz, "05:10"), "late");
  assert.equal(tierAtLocalTime(w, tz, "05:24"), "overdue", "sunrise is outside the window");
  assert.equal(tierAtLocalTime(w, tz, "05:50"), "overdue", "inside the grace period");
  assert.equal(tierAtLocalTime(w, tz, "05:54"), null, "grace period has closed");
  assert.equal(tierAtLocalTime(w, tz, "09:00"), null);

  // Malformed input must be rejected, not coerced.
  for (const bad of ["", "abc", "25:00", "04:99", "4", "04-20"]) {
    assert.equal(tierAtLocalTime(w, tz, bad), null, `should reject "${bad}"`);
  }
});

test("a reported time and the equivalent instant agree on the tier", () => {
  // The two code paths are independent — one compares instants, the other
  // wall-clock minutes — so they must not be allowed to drift apart.
  for (const city of CITIES.slice(0, 20)) {
    const loc = {
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone,
      method: city.method,
    };
    const w = windowFor(loc, "2026-08-06");
    if (!isValidWindow(w)) continue;

    for (const offsetMin of [1, 15, 40, 70]) {
      const at = new Date(w.fajr.getTime() + offsetMin * 60_000);
      if (at.getTime() >= w.sunrise.getTime()) continue;
      const wall = formatTime(at, city.timezone);
      assert.equal(
        tierAtLocalTime(w, city.timezone, wall),
        tierAt(w, at),
        `${city.name} at ${wall}`,
      );
    }
  }
});
