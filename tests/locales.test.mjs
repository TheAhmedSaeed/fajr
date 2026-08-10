import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getDict, LOCALES } from "../.test-build/src/lib/i18n.js";

const load = (locale) =>
  JSON.parse(readFileSync(new URL(`../locales/${locale}.json`, import.meta.url), "utf8"));

const ar = load("ar");
const en = load("en");

/** Every leaf path in an object, e.g. "checkIn.submit" or "landing.features.0.title". */
function paths(value, prefix = "") {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    paths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function at(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

const placeholders = (s) =>
  new Set([...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]));

// `_readme` is guidance for whoever edits the file; `units` intentionally
// diverges because Arabic dual forms carry the number in the word itself.
const skip = (p) => p.startsWith("_readme") || p.startsWith("units.");

const arPaths = paths(ar).filter((p) => !skip(p));
const enPaths = paths(en).filter((p) => !skip(p));

test("both locale files define exactly the same keys", () => {
  const missingInEn = arPaths.filter((p) => !enPaths.includes(p));
  const missingInAr = enPaths.filter((p) => !arPaths.includes(p));

  assert.deepEqual(missingInEn, [], "keys present in ar.json but missing from en.json");
  assert.deepEqual(missingInAr, [], "keys present in en.json but missing from ar.json");
});

test("every string uses the same placeholders in both languages", () => {
  const mismatches = [];
  for (const path of arPaths) {
    const a = at(ar, path);
    const e = at(en, path);
    if (typeof a !== "string" || typeof e !== "string") continue;

    const pa = [...placeholders(a)].sort();
    const pe = [...placeholders(e)].sort();
    if (pa.join(",") !== pe.join(",")) {
      mismatches.push(`${path}: ar has {${pa}} but en has {${pe}}`);
    }
  }
  assert.deepEqual(mismatches, [], mismatches.join("\n"));
});

test("no translation was left empty by accident", () => {
  // The Arabic board title already says "today", so its suffix is deliberately blank.
  const allowedEmpty = new Set(["group.boardToday"]);
  const empty = [];

  for (const [locale, data] of [["ar", ar], ["en", en]]) {
    for (const path of paths(data).filter((p) => !p.startsWith("_readme"))) {
      const value = at(data, path);
      if (typeof value === "string" && value.trim() === "" && !allowedEmpty.has(path)) {
        empty.push(`${locale}.json → ${path}`);
      }
    }
  }
  assert.deepEqual(empty, [], empty.join("\n"));
});

test("each counted noun covers every plural category its language uses", () => {
  const sample = Array.from({ length: 201 }, (_, i) => i);

  for (const locale of LOCALES) {
    const rules = new Intl.PluralRules(locale);
    const needed = new Set(sample.map((n) => rules.select(n)));
    const data = locale === "ar" ? ar : en;

    for (const [name, forms] of Object.entries(data.units)) {
      for (const category of needed) {
        assert.ok(
          typeof forms[category] === "string" && forms[category].trim() !== "",
          `${locale}.json → units.${name} is missing the "${category}" form`,
        );
      }
    }
  }
});

test("Arabic counted nouns render in the correct form", () => {
  const t = getDict("ar");

  // 1, 2, 3-10 and 11+ each take a different shape; concatenating a plural
  // noun to every number is the mistake this guards against.
  assert.equal(t.group.days(1), "يوم");
  assert.equal(t.group.days(2), "يومان");
  assert.equal(t.group.days(3), "3 أيام");
  assert.equal(t.group.days(10), "10 أيام");
  assert.equal(t.group.days(11), "11 يومًا");
  assert.equal(t.group.days(40), "40 يومًا");

  assert.equal(t.checkIn.ptsShort(1), "نقطة");
  assert.equal(t.checkIn.ptsShort(2), "نقطتان");
  assert.equal(t.checkIn.ptsShort(3), "3 نقاط");
});

test("English counted nouns render in the correct form", () => {
  const t = getDict("en");
  assert.equal(t.group.days(1), "1 day");
  assert.equal(t.group.days(2), "2 days");
  assert.equal(t.checkIn.ptsShort(1), "1 point");
  assert.equal(t.checkIn.ptsShort(5), "5 points");
});

test("placeholders are substituted, never left visible", () => {
  for (const locale of LOCALES) {
    const t = getDict(locale);
    const rendered = [
      t.login.sentTo("a@b.com"),
      t.checkIn.beforeHelp("04:12"),
      t.checkIn.openPrompt(3, "X"),
      t.checkIn.loggedPoints(5),
      t.checkIn.loggedStreak(7),
      t.checkIn.loggedClosed("05:30"),
      t.checkIn.closedBody("05:30"),
      t.checkIn.nextAt("04:10"),
      t.grace.title("2026-08-08"),
      t.grace.withStreak(12),
      t.grace.remaining(1),
      t.stats.daysPrayed(4),
      t.badges.of(2, 9),
      t.dashboard.members(3),
      t.group.perfectBanner(5),
      t.group.boardCount(1, 2),
      t.group.atFirstLight(6),
      t.group.rank(1),
      t.group.deleteConfirm("Family"),
      t.group.fajrAt("04:12"),
      t.join.alreadyIn(2),
      t.errors.magicLinkSent("a@b.com"),
      t.errors.logged(3),
    ];

    for (const text of rendered) {
      assert.ok(!/\{[a-z]\w*\}/i.test(text), `${locale}: unsubstituted placeholder in "${text}"`);
      assert.ok(text.trim() !== "", `${locale}: rendered an empty string`);
    }
  }
});

test("an unknown placeholder is left visible rather than silently dropped", () => {
  // A translator inventing {foo} should see it in the UI, not lose the sentence.
  const t = getDict("ar");
  assert.equal(typeof t.group.fajrAt("04:12"), "string");
  assert.ok(t.group.fajrAt("04:12").includes("04:12"));
});
