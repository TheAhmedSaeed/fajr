import Link from "next/link";
import { redirect } from "next/navigation";
import { displayNameOf, getLogs, getMyGroups, getProfile, isOnboarded, locationOf } from "@/lib/data";
import { addDays, formatTime, isValidWindow, todayView } from "@/lib/prayer";
import {
  badgesFor,
  computeStats,
  GRACE_PER_MONTH,
  graceUsedThisMonth,
  type LogRow,
} from "@/lib/scoring";
import { CheckInCard } from "@/components/CheckInCard";
import { GraceCard } from "@/components/GraceCard";
import { StatsRow } from "@/components/StatsRow";
import { BadgeGrid } from "@/components/BadgeGrid";
import { GroupForms } from "@/components/GroupForms";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!isOnboarded(profile)) redirect("/onboarding");

  const location = locationOf(profile)!;
  const now = new Date();
  const view = todayView(location, now);

  const logs = await getLogs([profile.id]);
  const stats = computeStats(logs, view.today);
  const todayLog = logs.find((l) => l.prayer_date === view.today) ?? null;
  const groups = await getMyGroups(profile.id);

  // A grace day is offered only for yesterday, and only if there is history to protect.
  const graceTarget = addDays(view.today, -1);
  const graceRemaining = GRACE_PER_MONTH - graceUsedThisMonth(logs, view.today);
  const showGrace =
    graceRemaining > 0 &&
    logs.length > 0 &&
    !logs.some((l: LogRow) => l.prayer_date === graceTarget) &&
    // Nothing to bridge if they hadn't started yet.
    Boolean(stats.firstDate && stats.firstDate < graceTarget);

  const windowOk = isValidWindow(view.window) && isValidWindow(view.next);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting()}, {displayNameOf(profile)}
        </h1>
        <p className="mt-1 text-sm text-muted">{view.today}</p>
      </div>

      {windowOk ? (
        <CheckInCard
          cityLabel={profile.city_label ?? location.timezone}
          fajrISO={view.window.fajr.toISOString()}
          sunriseISO={view.window.sunrise.toISOString()}
          nextFajrISO={view.next.fajr.toISOString()}
          fajrLabel={formatTime(view.window.fajr, location.timezone)}
          sunriseLabel={formatTime(view.window.sunrise, location.timezone)}
          nextFajrLabel={formatTime(view.next.fajr, location.timezone)}
          serverNowISO={now.toISOString()}
          streak={stats.currentStreak}
          logged={
            todayLog
              ? {
                  kind: todayLog.kind,
                  tier: todayLog.tier,
                  points: todayLog.points,
                  inCongregation: todayLog.in_congregation,
                }
              : null
          }
        />
      ) : (
        <div className="card border-danger/30 p-5">
          <p className="text-sm">
            Fajr and sunrise could not be resolved for your location today. Try a different
            calculation method in{" "}
            <Link href="/settings" className="text-gold underline underline-offset-2">
              settings
            </Link>
            .
          </p>
        </div>
      )}

      {showGrace && (
        <GraceCard
          targetDate={graceTarget}
          remaining={graceRemaining}
          streakAtStake={stats.currentStreak}
        />
      )}

      <StatsRow stats={stats} />

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">Your groups</h2>
          <span className="text-xs text-dim">{groups.length}</span>
        </div>

        {groups.length > 0 ? (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {groups.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/g/${g.id}`}
                  className="card block p-4 transition hover:border-gold/30"
                >
                  <p className="font-semibold">{g.name}</p>
                  {g.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{g.description}</p>
                  )}
                  <p className="mt-2.5 text-xs text-dim">
                    {g.member_count} {g.member_count === 1 ? "member" : "members"}
                    {g.owner_id === profile.id && " · you own this"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">
            No groups yet. Create one and share the invite link, or enter a code you were sent.
          </p>
        )}
      </section>

      <GroupForms />

      <BadgeGrid badges={badgesFor(stats)} />
    </div>
  );
}

function greeting(): string {
  return "Assalamu alaikum";
}
