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

export function displayNameOf(p: { display_name: string | null; email?: string | null }): string {
  return p.display_name?.trim() || p.email?.split("@")[0] || "Anonymous";
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

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, city_label, city_id, latitude, longitude, timezone, calculation_method")
    .in("id", ids);

  const byId = new Map((profiles ?? []).map((p) => [p.id as string, p]));

  return (rows ?? []).map((r) => {
    const p = byId.get(r.user_id as string);
    return {
      user_id: r.user_id as string,
      role: r.role as string,
      joined_at: r.joined_at as string,
      display_name: (p?.display_name as string | null) ?? null,
      city_label: (p?.city_label as string | null) ?? null,
      city_id: (p?.city_id as string | null) ?? null,
      latitude: (p?.latitude as number | null) ?? null,
      longitude: (p?.longitude as number | null) ?? null,
      timezone: (p?.timezone as string | null) ?? null,
      calculation_method: (p?.calculation_method as string) ?? DEFAULT_METHOD,
    };
  });
}

/** Log rows for a set of users. RLS keeps this to the viewer plus their group-mates. */
export async function getLogs(userIds: string[], from?: string): Promise<LogRow[]> {
  if (userIds.length === 0) return [];
  const supabase = await createClient();

  let query = supabase
    .from("fajr_logs")
    .select("user_id, prayer_date, kind, tier, in_congregation, points")
    .in("user_id", userIds);

  if (from) query = query.gte("prayer_date", from);

  const { data } = await query;
  return (data ?? []) as LogRow[];
}
