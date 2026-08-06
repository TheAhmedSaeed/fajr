import type { Tier } from "@/lib/prayer";
import { TIER_LABELS } from "@/lib/scoring";

export type BoardEntry = {
  userId: string;
  name: string;
  /** Where this member's own Fajr window currently is. */
  state: "before" | "open" | "closed" | "unknown";
  logged: { kind: "prayed" | "grace"; tier: Tier | null; inCongregation: boolean } | null;
  fajrLabel: string;
  cityLabel: string | null;
  streak: number;
  isYou: boolean;
};

/**
 * Live status for everyone in the group, each evaluated against their own city's
 * window. This is the part that actually creates accountability — a leaderboard
 * is retrospective, but seeing who is still asleep is happening right now.
 */
export function DawnBoard({ entries }: { entries: BoardEntry[] }) {
  const done = entries.filter((e) => e.logged).length;

  return (
    <section className="card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">
          Dawn board <span className="ar text-muted">· اليوم</span>
        </h2>
        <span className="tabular text-xs text-dim">
          {done}/{entries.length} in
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {entries.map((e) => (
          <li
            key={e.userId}
            className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 ${
              e.logged ? "border-teal/20 bg-teal/5" : "border-line bg-night/40"
            }`}
          >
            <Lamp entry={e} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {e.name}
                {e.isYou && <span className="ml-1.5 text-xs text-dim">(you)</span>}
              </p>
              <p className="truncate text-xs text-dim">
                {e.cityLabel ?? "—"} · Fajr {e.fajrLabel}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <StatusText entry={e} />
              {e.streak > 0 && (
                <p className="tabular text-[11px] text-dim">🔥 {e.streak}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Lamp({ entry }: { entry: BoardEntry }) {
  if (entry.logged) {
    const lit = entry.logged.kind === "prayed";
    return (
      <span
        aria-hidden
        className={`flex size-9 shrink-0 items-center justify-center rounded-full text-base ${
          lit ? "bg-teal/15" : "bg-violet/15"
        }`}
      >
        {lit ? "🌅" : "🛡️"}
      </span>
    );
  }

  const tone =
    entry.state === "open"
      ? "bg-gold/10 text-gold ring-1 ring-gold/30"
      : "bg-surface-2 text-dim";

  return (
    <span
      aria-hidden
      className={`flex size-9 shrink-0 items-center justify-center rounded-full text-base ${tone}`}
    >
      {entry.state === "open" ? "⏳" : entry.state === "closed" ? "🌙" : "🌑"}
    </span>
  );
}

function StatusText({ entry }: { entry: BoardEntry }) {
  if (entry.logged) {
    if (entry.logged.kind === "grace") {
      return <p className="text-xs font-medium text-violet">Grace day</p>;
    }
    const tier = entry.logged.tier ? TIER_LABELS[entry.logged.tier] : null;
    return (
      <p className="text-xs font-medium text-teal">
        {tier?.en ?? "Logged"}
        {entry.logged.inCongregation && " 🕌"}
      </p>
    );
  }

  if (entry.state === "open") return <p className="text-xs font-medium text-gold">Window open</p>;
  if (entry.state === "before") return <p className="text-xs text-dim">Before Fajr</p>;
  if (entry.state === "closed") return <p className="text-xs text-rose">Missed</p>;
  return <p className="text-xs text-dim">No location</p>;
}
