import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { getProfile } from "@/lib/data";
import { signOut } from "./actions";

export const metadata: Metadata = {
  title: "Fajr — pray it on time, together",
  description:
    "A group streak for Fajr. Check in only between the adhan and sunrise, wherever you are.",
};

export const viewport: Viewport = {
  themeColor: "#070b16",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  return (
    <html lang="en">
      <body>
        <div className="dawn-bg" />

        <header className="sticky top-0 z-20 border-b border-line/70 bg-night/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href={profile ? "/dashboard" : "/"} className="flex items-center gap-2">
              <span className="text-lg">🌅</span>
              <span className="text-base font-bold tracking-tight">
                Fajr<span className="text-gold">.</span>
              </span>
            </Link>

            <nav className="flex items-center gap-1 text-sm">
              {profile ? (
                <>
                  <Link
                    href="/dashboard"
                    className="rounded-lg px-3 py-1.5 text-muted transition hover:bg-surface-2 hover:text-ink"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="rounded-lg px-3 py-1.5 text-muted transition hover:bg-surface-2 hover:text-ink"
                  >
                    Settings
                  </Link>
                  <form action={signOut}>
                    <button className="rounded-lg px-3 py-1.5 text-muted transition hover:bg-surface-2 hover:text-ink">
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg bg-gradient-to-r from-gold to-rose px-4 py-1.5 font-semibold text-night transition hover:brightness-110"
                >
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>

        <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-center text-xs text-dim">
          Prayer times computed locally with the calculation method you choose. Check-in is
          verified against your own city&rsquo;s window — never a shared clock.
        </footer>
      </body>
    </html>
  );
}
