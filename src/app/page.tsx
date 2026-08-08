import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/data";
import { getT } from "@/lib/locale";
import { TIER_POINTS } from "@/lib/scoring";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string; error_description?: string }>;
}) {
  const { code, next, error_description } = await searchParams;

  /*
   * Supabase falls back to the project's Site URL when the requested
   * `emailRedirectTo` is not on the redirect allow-list, which drops the
   * auth code on `/` instead of `/auth/callback`. Forwarding it keeps sign-in
   * working even when the dashboard is misconfigured. Cookies survive the hop,
   * so the PKCE verifier is still available to the exchange.
   */
  if (code) {
    const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
    redirect(`/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(target)}`);
  }
  if (error_description) {
    redirect(`/login?error=${encodeURIComponent(error_description)}`);
  }

  const profile = await getProfile();
  if (profile) redirect("/dashboard");

  const { t } = await getT();

  return (
    <div className="py-6">
      <section className="text-center">
        <p className="text-xs uppercase text-gold">{t.landing.eyebrow}</p>
        <h1 className="mt-4 text-4xl font-bold leading-[1.15] sm:text-6xl">
          {t.landing.titleTop}
          <br />
          <span className="dawn-text">{t.landing.titleBottom}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
          {t.landing.subtitle}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="w-full rounded-xl bg-gradient-to-r from-gold to-rose px-6 py-3 text-sm font-semibold text-night transition hover:brightness-110 sm:w-auto"
          >
            {t.landing.ctaPrimary}
          </Link>
          <Link
            href="/login"
            className="w-full rounded-xl border border-line bg-surface-2/60 px-6 py-3 text-sm font-semibold transition hover:bg-surface-2 sm:w-auto"
          >
            {t.landing.ctaSecondary}
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        {t.landing.features.map((f) => (
          <div key={f.title} className="card p-5">
            <div className="text-2xl">{f.icon}</div>
            <h3 className="mt-3 font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="text-lg font-semibold">{t.landing.scoringTitle}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Tier tone="gold" pts={TIER_POINTS.early} name={t.tiers.early.name} note={t.tiers.early.note} />
          <Tier tone="rose" pts={TIER_POINTS.middle} name={t.tiers.middle.name} note={t.tiers.middle.note} />
          <Tier tone="muted" pts={TIER_POINTS.late} name={t.tiers.late.name} note={t.tiers.late.note} />
        </div>
        <p className="mt-5 border-t border-line pt-4 text-sm text-muted">
          {t.landing.scoringNote}
        </p>
      </section>

      <p className="mx-auto mt-10 max-w-lg text-center text-sm text-dim">{t.landing.honest}</p>
    </div>
  );
}

function Tier({
  tone,
  pts,
  name,
  note,
}: {
  tone: "gold" | "rose" | "muted";
  pts: number;
  name: string;
  note: string;
}) {
  const color = { gold: "text-gold", rose: "text-rose", muted: "text-muted" }[tone];
  const ring = {
    gold: "border-gold/30 bg-gold/10",
    rose: "border-rose/30 bg-rose/10",
    muted: "border-line bg-surface-2",
  }[tone];

  return (
    <div className={`rounded-xl border p-4 ${ring}`}>
      <p className={`tabular text-2xl font-bold ${color}`}>{pts}</p>
      <p className={`mt-1 text-sm font-medium ${color}`}>{name}</p>
      <p className="mt-1 text-xs text-dim">{note}</p>
    </div>
  );
}
