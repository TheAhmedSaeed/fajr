import arJson from "../../locales/ar.json";
import enJson from "../../locales/en.json";

/**
 * All display text lives in `locales/*.json` so it can be edited without
 * touching code. This module only turns that data into a typed object.
 *
 * Two things the raw JSON cannot express, handled here:
 *
 *  - **Interpolation.** `{name}` placeholders are filled at call time.
 *  - **Counted nouns.** Arabic changes the noun at one, two, three-to-ten and
 *    eleven-plus, so a count is never simply concatenated. `Intl.PluralRules`
 *    picks the category and `units` in the JSON supplies the wording, which is
 *    why the locale files use the standard CLDR category names.
 */

export const LOCALES = ["ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ar";

export function isLocale(v: string | undefined): v is Locale {
  return v === "ar" || v === "en";
}

export function dirOf(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** The Arabic file is the reference shape; English must match it key for key. */
type Raw = typeof arJson;
const RAW: Record<Locale, Raw> = { ar: arJson, en: enJson as Raw };

type UnitName = keyof Raw["units"];

/** Replace `{token}` with a value. An unknown token is left visible rather than blanked. */
function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in vars ? String(vars[key]) : whole,
  );
}

function build(locale: Locale) {
  const raw = RAW[locale];
  const plural = new Intl.PluralRules(locale);

  /** A counted noun in the right form for `n`, e.g. 3 → "3 أيام". */
  function unit(name: UnitName, n: number): string {
    const forms = raw.units[name] as Record<string, string>;
    const category = plural.select(n);
    return fill(forms[category] ?? forms.other, { n });
  }

  const t = <T extends Record<string, string>>(section: T) => section;

  return {
    dir: dirOf(locale),
    nav: t(raw.nav),
    footer: raw.footer,

    landing: raw.landing,
    tiers: raw.tiers,
    methods: raw.methods,

    login: {
      ...raw.login,
      sentTo: (email: string) => fill(raw.login.sentTo, { email }),
    },

    onboarding: raw.onboarding,

    picker: {
      ...raw.picker,
      methodInUse: (method: string) => fill(raw.picker.methodInUse, { method }),
    },

    checkIn: {
      ...raw.checkIn,
      beforeHelp: (fajr: string) => fill(raw.checkIn.beforeHelp, { fajr }),
      openPrompt: (points: number, tier: string) =>
        fill(raw.checkIn.openPrompt, { points: unit("points", points), tier }),
      loggedPoints: (n: number) => fill(raw.checkIn.loggedPoints, { points: unit("points", n) }),
      loggedStreak: (n: number) => fill(raw.checkIn.loggedStreak, { days: unit("days", n) }),
      loggedClosed: (sunrise: string) => fill(raw.checkIn.loggedClosed, { sunrise }),
      closedBody: (sunrise: string) => fill(raw.checkIn.closedBody, { sunrise }),
      nextAt: (time: string) => fill(raw.checkIn.nextAt, { time }),
      ptsShort: (n: number) => fill(raw.checkIn.ptsShort, { points: unit("points", n) }),
    },

    grace: {
      ...raw.grace,
      title: (date: string) => fill(raw.grace.title, { date }),
      withStreak: (n: number) => fill(raw.grace.withStreak, { days: unit("days", n) }),
      remaining: (n: number) => fill(raw.grace.remaining, { n }),
    },

    stats: {
      ...raw.stats,
      daysPrayed: (n: number) => fill(raw.stats.daysPrayed, { days: unit("days", n) }),
    },

    badges: {
      ...raw.badges,
      of: (earned: number, total: number) => fill(raw.badges.of, { earned, total }),
    },

    dashboard: {
      ...raw.dashboard,
      members: (n: number) => fill(raw.dashboard.members, { members: unit("members", n) }),
    },

    groupForms: raw.groupForms,

    group: {
      ...raw.group,
      perfectBanner: (n: number) => fill(raw.group.perfectBanner, { days: unit("days", n) }),
      boardCount: (done: number, total: number) => fill(raw.group.boardCount, { done, total }),
      days: (n: number) => fill(raw.group.days, { days: unit("days", n) }),
      atFirstLight: (n: number) => fill(raw.group.atFirstLight, { n }),
      rank: (n: number) => fill(raw.group.rank, { n }),
      deleteConfirm: (name: string) => fill(raw.group.deleteConfirm, { name }),
      fajrAt: (time: string) => fill(raw.group.fajrAt, { time }),
    },

    join: {
      ...raw.join,
      alreadyIn: (n: number) => fill(raw.join.alreadyIn, { people: unit("people", n) }),
    },

    settings: raw.settings,

    errors: {
      ...raw.errors,
      magicLinkSent: (email: string) => fill(raw.errors.magicLinkSent, { email }),
      logged: (n: number) => fill(raw.errors.logged, { points: unit("points", n) }),
    },
  };
}

export type Dict = ReturnType<typeof build>;

const DICTIONARIES: Record<Locale, Dict> = { ar: build("ar"), en: build("en") };

export function getDict(locale: Locale): Dict {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

/**
 * Long-form date for display. Western digits in both locales, so they line up
 * with the tabular figures used for times and scores everywhere else.
 */
export function formatDate(date: string, locale: Locale): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-u-nu-latn" : "en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
