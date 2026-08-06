import type { Stats } from "@/lib/scoring";

export function StatsRow({ stats }: { stats: Stats }) {
  const consistency =
    stats.consistency === null ? "—" : `${Math.round(stats.consistency * 100)}%`;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat
        icon="🔥"
        value={String(stats.currentStreak)}
        label="Current streak"
        tone={stats.streakAtRisk ? "warn" : "gold"}
        hint={stats.streakAtRisk ? "Not logged today" : undefined}
      />
      <Stat icon="⭐" value={String(stats.totalPoints)} label="Total points" />
      <Stat icon="📈" value={consistency} label="Consistency" hint={`${stats.daysPrayed} days prayed`} />
      <Stat icon="🏔️" value={String(stats.longestStreak)} label="Longest streak" />
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
  hint,
  tone = "plain",
}: {
  icon: string;
  value: string;
  label: string;
  hint?: string;
  tone?: "plain" | "gold" | "warn";
}) {
  const color = { plain: "text-ink", gold: "text-gold", warn: "text-rose" }[tone];

  return (
    <div className="card p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <p className={`tabular mt-1.5 text-2xl font-bold ${color}`}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-dim">{hint}</p>}
    </div>
  );
}
