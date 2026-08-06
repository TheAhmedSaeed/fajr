import Link from "next/link";
import type { LeaderboardRow, Period } from "@/lib/scoring";

const PERIODS: Array<{ id: Period; label: string }> = [
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
];

export function Leaderboard({
  rows,
  period,
  groupId,
  youId,
}: {
  rows: LeaderboardRow[];
  period: Period;
  groupId: string;
  youId: string;
}) {
  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="text-sm font-semibold">Leaderboard</h2>
        <div className="flex gap-1 rounded-lg border border-line bg-night/60 p-0.5">
          {PERIODS.map((p) => (
            <Link
              key={p.id}
              href={`/g/${groupId}?period=${p.id}`}
              scroll={false}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                period === p.id ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted">
          Nothing logged in this period yet.
        </p>
      ) : (
        <ol className="divide-y divide-[var(--color-line)]">
          {rows.map((r, i) => (
            <li
              key={r.userId}
              className={`flex items-center gap-3 px-5 py-3 ${
                r.userId === youId ? "bg-gold/[0.04]" : ""
              }`}
            >
              <Rank index={i} />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {r.name}
                  {r.userId === youId && <span className="ml-1.5 text-xs text-dim">(you)</span>}
                </p>
                <p className="text-xs text-dim">
                  {r.daysPrayed} {r.daysPrayed === 1 ? "day" : "days"}
                  {r.earlyCount > 0 && ` · ${r.earlyCount} at first light`}
                  {r.currentStreak > 0 && ` · 🔥 ${r.currentStreak}`}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="tabular text-base font-bold text-gold">{r.points}</p>
                <p className="text-[10px] uppercase tracking-wider text-dim">pts</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Rank({ index }: { index: number }) {
  const medal = ["🥇", "🥈", "🥉"][index];
  if (medal) {
    return (
      <span aria-label={`Rank ${index + 1}`} className="w-7 shrink-0 text-center text-lg">
        {medal}
      </span>
    );
  }
  return (
    <span className="tabular w-7 shrink-0 text-center text-sm text-dim">{index + 1}</span>
  );
}
