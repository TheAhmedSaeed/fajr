import type { Tier } from "@/lib/prayer";
import type { Dict } from "@/lib/i18n";

export type BoardEntry = {
  userId: string;
  name: string;
  /** Where this member's own Fajr window currently is. */
  state: "before" | "open" | "overdue" | "closed" | "unknown";
  logged: {
    kind: "prayed" | "grace";
    tier: Tier | null;
    inCongregation: boolean;
    /** True when a group owner entered this row rather than the member. */
    byOwner: boolean;
  } | null;
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
export function DawnBoard({ entries, t }: { entries: BoardEntry[]; t: Dict }) {
  const done = entries.filter((e) => e.logged).length;

  return (
    <section className="card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold">
          {t.group.boardTitle}
          {t.group.boardToday && <span className="text-muted"> · {t.group.boardToday}</span>}
        </h2>
        <span className="tabular text-xs text-dim">{t.group.boardCount(done, entries.length)}</span>
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
                {e.isYou && <span className="ms-1.5 text-xs text-dim">{t.group.you}</span>}
              </p>
              <p className="truncate text-xs text-dim">
                {e.cityLabel ?? "—"} · {t.group.fajrAt(e.fajrLabel)}
              </p>
            </div>

            <div className="shrink-0 text-end">
              <StatusText entry={e} t={t} />
              {e.streak > 0 && <p className="tabular text-[11px] text-dim">🔥 {e.streak}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Lamp({ entry }: { entry: BoardEntry }) {
  if (entry.logged) {
    if (entry.logged.kind === "grace") {
      return <Badge className="bg-violet/15">🛡️</Badge>;
    }
    // A late prayer gets its own mark, so "in" and "in on time" stay distinct
    // at a glance — which is the entire point of the board.
    if (entry.logged.tier === "overdue") {
      return <Badge className="bg-violet/10">🌤️</Badge>;
    }
    return <Badge className="bg-teal/15">🌅</Badge>;
  }

  const tone =
    entry.state === "open" ? "bg-gold/10 text-gold ring-1 ring-gold/30" : "bg-surface-2 text-dim";

  return (
    <span
      aria-hidden
      className={`flex size-9 shrink-0 items-center justify-center rounded-full text-base ${tone}`}
    >
      {entry.state === "open" ? "⏳" : entry.state === "overdue" ? "🌤️" : entry.state === "closed" ? "🌙" : "🌑"}
    </span>
  );
}

function Badge({ children, className }: { children: string; className: string }) {
  return (
    <span
      aria-hidden
      className={`flex size-9 shrink-0 items-center justify-center rounded-full text-base ${className}`}
    >
      {children}
    </span>
  );
}

function StatusText({ entry, t }: { entry: BoardEntry; t: Dict }) {
  if (entry.logged) {
    if (entry.logged.kind === "grace") {
      return <p className="text-xs font-medium text-violet">{t.group.stateGrace}</p>;
    }
    const late = entry.logged.tier === "overdue";
    return (
      <>
        <p className={`text-xs font-medium ${late ? "text-violet" : "text-teal"}`}>
          {entry.logged.tier ? t.tiers[entry.logged.tier].name : t.group.stateLogged}
          {entry.logged.inCongregation && " 🕌"}
        </p>
        {entry.logged.byOwner && <p className="text-[10px] text-dim">{t.group.loggedByOwner}</p>}
      </>
    );
  }

  if (entry.state === "open") return <p className="text-xs font-medium text-gold">{t.group.stateOpen}</p>;
  if (entry.state === "overdue") return <p className="text-xs text-violet">{t.group.stateOverdue}</p>;
  if (entry.state === "before") return <p className="text-xs text-dim">{t.group.stateBefore}</p>;
  if (entry.state === "closed") return <p className="text-xs text-rose">{t.group.stateMissed}</p>;
  return <p className="text-xs text-dim">{t.group.stateUnknown}</p>;
}
