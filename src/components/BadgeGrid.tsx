import type { Badge } from "@/lib/scoring";
import { Progress } from "./ui";

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  const earned = badges.filter((b) => b.earned);
  // Show what's actually within reach rather than a wall of locked icons.
  const upcoming = badges
    .filter((b) => !b.earned)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  return (
    <section className="card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Badges</h2>
        <span className="text-xs text-dim">
          {earned.length} of {badges.length}
        </span>
      </div>

      {earned.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {earned.map((b) => (
            <span
              key={b.id}
              title={b.requirement}
              className="flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-xs"
            >
              <span>{b.icon}</span>
              <span className="font-medium">{b.name}</span>
              <span className="ar text-dim">{b.ar}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">None yet. The first one lands after your first Fajr.</p>
      )}

      {upcoming.length > 0 && (
        <div className="mt-5 space-y-3 border-t border-line pt-4">
          <p className="text-xs uppercase tracking-wider text-dim">Next up</p>
          {upcoming.map((b) => (
            <div key={b.id}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">
                  <span className="mr-1.5 opacity-50 grayscale">{b.icon}</span>
                  {b.requirement}
                </span>
                <span className="tabular text-dim">{Math.round(b.progress * 100)}%</span>
              </div>
              <Progress value={b.progress} className="mt-1.5" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
