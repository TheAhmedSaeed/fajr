import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/data";

export default async function Home() {
  const profile = await getProfile();
  if (profile) redirect("/dashboard");

  return (
    <div className="py-6">
      <section className="text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-gold">Fajr, together</p>
        <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
          The hardest prayer
          <br />
          <span className="dawn-text">is easier with company.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
          Make a group, invite your friends or family, and build a streak nobody wants to be the
          first to break.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="w-full rounded-xl bg-gradient-to-r from-gold to-rose px-6 py-3 text-sm font-semibold text-night transition hover:brightness-110 sm:w-auto"
          >
            Start a group
          </Link>
          <Link
            href="/login"
            className="w-full rounded-xl border border-line bg-surface-2/60 px-6 py-3 text-sm font-semibold transition hover:bg-surface-2 sm:w-auto"
          >
            I have an invite
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        <Feature
          icon="🕰️"
          title="The window is the point"
          body="You can only log between the adhan and شروق الشمس, computed for your city and today's date. Not before. Not after."
        />
        <Feature
          icon="⚡"
          title="Earlier beats later"
          body="The window splits into thirds. Praying right after the adhan is worth 3 points; scraping in before sunrise is worth 1."
        />
        <Feature
          icon="🛡️"
          title="One miss won't end you"
          body="Two grace days a month protect your streak. They score nothing — they just stop a single miss from wiping out 40 days."
        />
      </section>

      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="text-lg font-semibold">How the scoring works</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Tier tone="gold" pts="3" label="First light" ar="الوقت المختار" note="First third of the window" />
          <Tier tone="rose" pts="2" label="On time" ar="في الوقت" note="Middle third" />
          <Tier tone="muted" pts="1" label="Just in time" ar="قبل الشروق" note="Last third before sunrise" />
        </div>
        <p className="mt-5 border-t border-line pt-4 text-sm text-muted">
          Praying in congregation adds <strong className="text-teal">+2</strong>. Your group ranks by
          points this week, this month, and all time — plus a shared streak for days when{" "}
          <em>everyone</em> makes it.
        </p>
      </section>

      <p className="mx-auto mt-10 max-w-lg text-center text-sm text-dim">
        Nothing here can prove you prayed — that stays between you and Allah. What it can do is make
        sure you were awake, and that your friends will notice if you weren&rsquo;t.
      </p>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="card p-5">
      <div className="text-2xl">{icon}</div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function Tier({
  tone,
  pts,
  label,
  ar,
  note,
}: {
  tone: "gold" | "rose" | "muted";
  pts: string;
  label: string;
  ar: string;
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
      <p className={`text-2xl font-bold ${color}`}>{pts}</p>
      <p className="mt-1 text-sm font-medium">{label}</p>
      <p className={`ar text-sm ${color}`}>{ar}</p>
      <p className="mt-1 text-xs text-dim">{note}</p>
    </div>
  );
}
