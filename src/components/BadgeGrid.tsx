import type { Badge } from "@/lib/scoring";
import type { Dict } from "@/lib/i18n";
import { Progress } from "./ui";

export function BadgeGrid({ badges, t }: { badges: Badge[]; t: Dict }) {
  const earned = badges.filter((b) => b.earned);
  // Show what's actually within reach rather than a wall of locked icons.
  const upcoming = badges
    .filter((b) => !b.earned)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3);

  return (
    <section className="card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">{t.badges.heading}</h2>
        <span className="text-xs text-dim">{t.badges.of(earned.length, badges.length)}</span>
      </div>

      {earned.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {earned.map((b) => (
            <span
              key={b.id}
              title={t.badges.items[b.id].requirement}
              className="flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-xs"
            >
              <span>{b.icon}</span>
              <span className="font-medium">{t.badges.items[b.id].name}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">{t.badges.empty}</p>
      )}

      {upcoming.length > 0 && (
        <div className="mt-5 space-y-3 border-t border-line pt-4">
          <p className="text-xs uppercase text-dim">{t.badges.nextUp}</p>
          {upcoming.map((b) => (
            <div key={b.id}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-muted">
                  <span className="me-1.5 opacity-50 grayscale">{b.icon}</span>
                  {t.badges.items[b.id].requirement}
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
