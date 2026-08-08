import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, getDict, isLocale, type Dict, type Locale } from "./i18n";

export const LOCALE_COOKIE = "locale";

/** The viewer's chosen language, defaulting to Arabic. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getT(): Promise<{ locale: Locale; t: Dict }> {
  const locale = await getLocale();
  return { locale, t: getDict(locale) };
}
