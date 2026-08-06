import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  displayNameOf,
  getGroup,
  getLogs,
  getMembers,
  getProfile,
  isOnboarded,
  type Member,
} from "@/lib/data";
import { formatTime, isMethodId, isValidWindow, todayView, type MadhabId } from "@/lib/prayer";
import {
  computeGroupStats,
  computeStats,
  inRange,
  periodRange,
  rankLeaderboard,
  type LeaderboardRow,
  type Period,
} from "@/lib/scoring";
import { DawnBoard, type BoardEntry } from "@/components/DawnBoard";
import { Leaderboard } from "@/components/Leaderboard";
import { InviteBox } from "@/components/InviteBox";
import { GroupAdmin } from "@/components/GroupAdmin";

export const dynamic = "force-dynamic";

function locationOfMember(m: Member) {
  if (m.latitude === null || m.longitude === null || !m.timezone) return null;
  return {
    latitude: m.latitude,
    longitude: m.longitude,
    timezone: m.timezone,
    method: isMethodId(m.calculation_method) ? m.calculation_method : ("MuslimWorldLeague" as const),
    madhab: (m.madhab === "Hanafi" ? "Hanafi" : "Shafi") as MadhabId,
  };
}

export default async function GroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ period?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!isOnboarded(profile)) redirect("/onboarding");

  const { id } = await params;
  const { period: rawPeriod } = await searchParams;
  const period: Period =
    rawPeriod === "month" || rawPeriod === "all" ? rawPeriod : "week";

  // RLS returns nothing for a group the viewer isn't in, so this covers both
  // "does not exist" and "not a member".
  const group = await getGroup(id);
  if (!group) notFound();

  const members = await getMembers(id);
  const memberIds = members.map((m) => m.user_id);
  const logs = await getLogs(memberIds);

  const now = new Date();
  // Period boundaries follow the viewer's calendar, which is the only frame
  // that makes sense for a leaderboard spanning several timezones.
  const viewerTz = profile.timezone!;
  const viewerToday = todayView(
    { latitude: profile.latitude!, longitude: profile.longitude!, timezone: viewerTz, method: "MuslimWorldLeague", madhab: "Shafi" },
    now,
  ).today;
  const range = periodRange(period, viewerToday);

  const logsByUser = new Map<string, typeof logs>();
  for (const row of logs) {
    const list = logsByUser.get(row.user_id) ?? [];
    list.push(row);
    logsByUser.set(row.user_id, list);
  }

  const board: BoardEntry[] = [];
  const leaderboard: LeaderboardRow[] = [];

  for (const m of members) {
    const name = displayNameOf({ display_name: m.display_name });
    const mine = logsByUser.get(m.user_id) ?? [];
    const loc = locationOfMember(m);

    // Each member's streak and today are evaluated in their own timezone.
    const theirToday = loc ? todayView(loc, now) : null;
    const localToday = theirToday?.today ?? viewerToday;
    const stats = computeStats(mine, localToday);
    const todayLog = mine.find((l) => l.prayer_date === localToday) ?? null;

    board.push({
      userId: m.user_id,
      name,
      state: theirToday && isValidWindow(theirToday.window) ? theirToday.state : "unknown",
      logged: todayLog
        ? { kind: todayLog.kind, tier: todayLog.tier, inCongregation: todayLog.in_congregation }
        : null,
      fajrLabel:
        theirToday && loc && isValidWindow(theirToday.window)
          ? formatTime(theirToday.window.fajr, loc.timezone)
          : "—",
      cityLabel: m.city_label,
      streak: stats.currentStreak,
      isYou: m.user_id === profile.id,
    });

    const inPeriod = mine.filter((l) => inRange(l.prayer_date, range.from, range.to));
    leaderboard.push({
      userId: m.user_id,
      name,
      points: inPeriod.reduce((s, l) => s + l.points, 0),
      daysPrayed: inPeriod.filter((l) => l.kind === "prayed").length,
      earlyCount: inPeriod.filter((l) => l.tier === "early").length,
      currentStreak: stats.currentStreak,
      consistency: stats.consistency,
      loggedToday: Boolean(todayLog),
    });
  }

  // Sort the board so whoever is still missing is impossible to overlook.
  board.sort((a, b) => Number(Boolean(a.logged)) - Number(Boolean(b.logged)) || a.name.localeCompare(b.name));

  const earliestJoin = members.reduce<string | null>((acc, m) => {
    const d = m.joined_at.slice(0, 10);
    return acc === null || d < acc ? d : acc;
  }, null);
  const groupStats = computeGroupStats(logs, memberIds, viewerToday, earliestJoin);

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const isOwner = group.owner_id === profile.id;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-xs text-muted hover:text-ink">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">{group.name}</h1>
        {group.description && <p className="mt-1 text-sm text-muted">{group.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric value={String(members.length)} label="Members" />
        <Metric value={String(groupStats.perfectStreak)} label="Group streak" icon="🔥" tone="gold" />
        <Metric value={String(groupStats.perfectDays)} label="Perfect days" icon="💯" />
        <Metric
          value={`${board.filter((b) => b.logged).length}/${members.length}`}
          label="In today"
          icon="🌅"
        />
      </div>

      {groupStats.perfectStreak > 0 && (
        <p className="rounded-xl border border-gold/25 bg-gold/[0.06] px-4 py-3 text-sm text-gold">
          🔥 Every member has made it {groupStats.perfectStreak}{" "}
          {groupStats.perfectStreak === 1 ? "day" : "days"} running. Don&rsquo;t be the one who ends
          it.
        </p>
      )}

      <DawnBoard entries={board} />

      <Leaderboard
        rows={rankLeaderboard(leaderboard)}
        period={period}
        groupId={group.id}
        youId={profile.id}
      />

      <InviteBox code={group.invite_code} url={`${origin}/join/${group.invite_code}`} />

      <GroupAdmin groupId={group.id} isOwner={isOwner} groupName={group.name} />
    </div>
  );
}

function Metric({
  value,
  label,
  icon,
  tone = "plain",
}: {
  value: string;
  label: string;
  icon?: string;
  tone?: "plain" | "gold";
}) {
  return (
    <div className="card p-4">
      <p className="flex items-center gap-1.5 text-xs text-muted">
        {icon && <span>{icon}</span>}
        {label}
      </p>
      <p className={`tabular mt-1.5 text-2xl font-bold ${tone === "gold" ? "text-gold" : ""}`}>
        {value}
      </p>
    </div>
  );
}
