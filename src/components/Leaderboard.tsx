import Link from "next/link";
import type { LeaderboardRow, Period } from "@/lib/scoring";
import type { Dict } from "@/lib/i18n";

export function Leaderboard({
  rows,
  period,
  groupId,
  youId,
  t,
}: {
  rows: LeaderboardRow[];
  period: Period;
  groupId: string;
  youId: string;
  t: Dict;
}) {
  const periods: Array<{ id: Period; label: string }> = [
    { id: "week", label: t.group.week },
    { id: "month", label: t.group.month },
    { id: "all", label: t.group.all },
  ];

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="text-sm font-semibold">{t.group.leaderboard}</h2>
        <div className="flex gap-1 rounded-lg border border-line bg-night/60 p-0.5">
          {periods.map((p) => (
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
        <p className="px-5 py-8 text-center text-sm text-muted">{t.group.emptyPeriod}</p>
      ) : (
        <ol className="divide-y divide-[var(--color-line)]">
          {rows.map((r, i) => (
            <li
              key={r.userId}
              className={`flex items-center gap-3 px-5 py-3 ${
                r.userId === youId ? "bg-gold/[0.04]" : ""
              }`}
            >
              <Rank index={i} t={t} />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {r.name}
                  {r.userId === youId && <span className="ms-1.5 text-xs text-dim">{t.group.you}</span>}
                </p>
                <p className="text-xs text-dim">
                  {t.group.days(r.daysPrayed)}
                  {r.earlyCount > 0 && ` · ${t.group.atFirstLight(r.earlyCount)}`}
                  {r.currentStreak > 0 && ` · 🔥 ${r.currentStreak}`}
                </p>
              </div>

              <div className="shrink-0 text-end">
                <p className="tabular text-base font-bold text-gold">{r.points}</p>
                <p className="text-[10px] uppercase text-dim">{t.checkIn.pts}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Rank({ index, t }: { index: number; t: Dict }) {
  const medal = ["🥇", "🥈", "🥉"][index];
  if (medal) {
    return (
      <span aria-label={t.group.rank(index + 1)} className="w-7 shrink-0 text-center text-lg">
        {medal}
      </span>
    );
  }
  return <span className="tabular w-7 shrink-0 text-center text-sm text-dim">{index + 1}</span>;
}
