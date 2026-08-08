import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { getProfile } from "@/lib/data";
import { getT } from "@/lib/locale";
import { dirOf } from "@/lib/i18n";
import { setLocale, signOut } from "./actions";

export const metadata: Metadata = {
  title: "الفجر — صلّه في وقته، معًا",
  description:
    "سلسلة جماعية لصلاة الفجر. سجّل فقط بين الأذان وشروق الشمس، أينما كنت.",
};

export const viewport: Viewport = {
  themeColor: "#070b16",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [profile, { locale, t }] = await Promise.all([getProfile(), getT()]);
  const dir = dirOf(locale);

  return (
    <html lang={locale} dir={dir}>
      <body>
        <div className="dawn-bg" />

        <header className="sticky top-0 z-20 border-b border-line/70 bg-night/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href={profile ? "/dashboard" : "/"} className="flex items-center gap-2">
              <span className="text-lg">🌅</span>
              <span className="text-base font-bold">
                {locale === "ar" ? "الفجر" : "Fajr"}
                <span className="text-gold">.</span>
              </span>
            </Link>

            <nav className="flex items-center gap-1 text-sm">
              {profile ? (
                <>
                  <Link
                    href="/dashboard"
                    className="rounded-lg px-3 py-1.5 text-muted transition hover:bg-surface-2 hover:text-ink"
                  >
                    {t.nav.dashboard}
                  </Link>
                  <Link
                    href="/settings"
                    className="rounded-lg px-3 py-1.5 text-muted transition hover:bg-surface-2 hover:text-ink"
                  >
                    {t.nav.settings}
                  </Link>
                  <form action={signOut}>
                    <button className="rounded-lg px-3 py-1.5 text-muted transition hover:bg-surface-2 hover:text-ink">
                      {t.nav.signOut}
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg bg-gradient-to-r from-gold to-rose px-4 py-1.5 font-semibold text-night transition hover:brightness-110"
                >
                  {t.nav.signIn}
                </Link>
              )}

              <form action={setLocale}>
                <input type="hidden" name="locale" value={locale === "ar" ? "en" : "ar"} />
                <button
                  aria-label={t.nav.switchLabel}
                  className="rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted transition hover:bg-surface-2 hover:text-ink"
                >
                  {t.nav.switchTo}
                </button>
              </form>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>

        <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-center text-xs text-dim">
          {t.footer}
        </footer>
      </body>
    </html>
  );
}
