import { createClient } from "./supabase/server";
import { DEFAULT_METHOD, isMethodId, type PrayerLocation } from "./prayer";
import type { LogRow } from "./scoring";

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  city_label: string | null;
  city_id: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  calculation_method: string;
  created_at: string;
};

export type Group = {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  invite_code: string;
  created_at: string;
};

export type Member = {
  user_id: string;
  role: string;
  joined_at: string;
  display_name: string | null;
  city_label: string | null;
  city_id: string | null;
  /** Members can be in different timezones, so each one's "today" is their own. */
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  calculation_method: string;
};

/** A profile is only usable once it has a location; until then we send the user to onboarding. */
export function isOnboarded(p: Profile | null): boolean {
  return Boolean(p && p.latitude !== null && p.longitude !== null && p.timezone);
}

export function locationOf(p: Profile): PrayerLocation | null {
  if (p.latitude === null || p.longitude === null || !p.timezone) return null;
  return {
    latitude: p.latitude,
    longitude: p.longitude,
    timezone: p.timezone,
    method: isMethodId(p.calculation_method) ? p.calculation_method : DEFAULT_METHOD,
  };
}

/** A member's prayer location, or null if they never finished onboarding. */
export function locationOfMember(m: Member): PrayerLocation | null {
  if (m.latitude === null || m.longitude === null || !m.timezone) return null;
  return {
    latitude: m.latitude,
    longitude: m.longitude,
    timezone: m.timezone,
    method: isMethodId(m.calculation_method) ? m.calculation_method : DEFAULT_METHOD,
  };
}

export function displayNameOf(
  p: { display_name: string | null; email?: string | null },
  fallback = "Anonymous",
): string {
  return p.display_name?.trim() || p.email?.split("@")[0] || fallback;
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as Profile | null) ?? null;
}

export async function getMyGroups(userId: string): Promise<Array<Group & { member_count: number }>> {
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId);

  const ids = (memberships ?? []).map((m) => m.group_id as string);
  if (ids.length === 0) return [];

  const { data: groups } = await supabase.from("groups").select("*").in("id", ids);

  // RLS already limits this to groups the viewer belongs to, so one query is enough.
  const { data: allMembers } = await supabase
    .from("group_members")
    .select("group_id")
    .in("group_id", ids);

  const counts = new Map<string, number>();
  for (const m of allMembers ?? []) {
    counts.set(m.group_id as string, (counts.get(m.group_id as string) ?? 0) + 1);
  }

  return ((groups ?? []) as Group[])
    .map((g) => ({ ...g, member_count: counts.get(g.id) ?? 0 }))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function getGroup(groupId: string): Promise<Group | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("groups").select("*").eq("id", groupId).maybeSingle();
  return (data as Group | null) ?? null;
}

export async function getMembers(groupId: string): Promise<Member[]> {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("group_members")
    .select("user_id, role, joined_at")
    .eq("group_id", groupId);

  const ids = (rows ?? []).map((r) => r.user_id as string);
  if (ids.length === 0) return [];

  // Naming columns explicitly means one missing column fails the whole select,
  // and a failure here is not obvious downstream: every field arrives null and
  // the group page quietly renders each member as an anonymous, location-less
  // row. `city_id` is optional cosmetics, so it is dropped and retried rather
  // than allowed to take the names and coordinates down with it.
  const COLUMNS = "id, display_name, city_label, latitude, longitude, timezone, calculation_method";

  // The two selects return different row shapes, so widen to the union of both.
  type ProfileRow = {
    id: string;
    display_name: string | null;
    city_label: string | null;
    city_id?: string | null;
    latitude: number | null;
    longitude: number | null;
    timezone: string | null;
    calculation_method: string | null;
  };

  const full = await supabase.from("profiles").select(`${COLUMNS}, city_id`).in("id", ids);
  let profiles = full.data as ProfileRow[] | null;

  if (full.error) {
    console.error("[getMembers] profile select failed, retrying without city_id", {
      code: full.error.code,
      message: full.error.message,
    });
    const reduced = await supabase.from("profiles").select(COLUMNS).in("id", ids);
    profiles = reduced.data as ProfileRow[] | null;
    if (reduced.error) {
      console.error("[getMembers] profile select failed", {
        code: reduced.error.code,
        message: reduced.error.message,
      });
    }
  }

  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (rows ?? []).map((r) => {
    const p = byId.get(r.user_id as string);
    return {
      user_id: r.user_id as string,
      role: r.role as string,
      joined_at: r.joined_at as string,
      display_name: p?.display_name ?? null,
      city_label: p?.city_label ?? null,
      city_id: p?.city_id ?? null,
      latitude: p?.latitude ?? null,
      longitude: p?.longitude ?? null,
      timezone: p?.timezone ?? null,
      calculation_method: p?.calculation_method ?? DEFAULT_METHOD,
    };
  });
}

/** Log rows for a set of users. RLS keeps this to the viewer plus their group-mates. */
export async function getLogs(userIds: string[], from?: string): Promise<LogRow[]> {
  if (userIds.length === 0) return [];
  const supabase = await createClient();

  // Naming `logged_by` explicitly means a database without it fails the whole
  // select — and a failed select here returns no rows at all, which reads as
  // "nobody has ever prayed": no streak, no points, an empty board. Attribution
  // is worth far less than the history, so it is dropped and retried.
  const COLUMNS = "user_id, prayer_date, kind, tier, in_congregation, points";

  const build = (columns: string) => {
    const q = supabase.from("fajr_logs").select(columns).in("user_id", userIds);
    return from ? q.gte("prayer_date", from) : q;
  };

  const full = await build(`${COLUMNS}, logged_by`);
  if (!full.error) return (full.data ?? []) as unknown as LogRow[];

  console.error("[getLogs] select failed, retrying without logged_by", {
    code: full.error.code,
    message: full.error.message,
  });

  const reduced = await build(COLUMNS);
  if (reduced.error) {
    console.error("[getLogs] select failed", {
      code: reduced.error.code,
      message: reduced.error.message,
    });
  }
  return (reduced.data ?? []) as unknown as LogRow[];
}
