import type { Stats } from "@/lib/scoring";
import type { Dict } from "@/lib/i18n";

export function StatsRow({ stats, t }: { stats: Stats; t: Dict }) {
  const consistency = stats.consistency === null ? "—" : `${Math.round(stats.consistency * 100)}%`;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Stat
        icon="🔥"
        value={String(stats.currentStreak)}
        label={t.stats.currentStreak}
        tone={stats.streakAtRisk ? "warn" : "gold"}
        hint={stats.streakAtRisk ? t.stats.notLoggedToday : undefined}
      />
      <Stat icon="⭐" value={String(stats.totalPoints)} label={t.stats.totalPoints} />
      <Stat
        icon="📈"
        value={consistency}
        label={t.stats.consistency}
        hint={t.stats.daysPrayed(stats.daysPrayed)}
      />
      <Stat icon="🏔️" value={String(stats.longestStreak)} label={t.stats.longestStreak} />
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
