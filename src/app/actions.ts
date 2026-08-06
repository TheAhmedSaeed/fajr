"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile, locationOf } from "@/lib/data";
import { addDays, isMethodId, localDate, todayView, windowFor } from "@/lib/prayer";
import {
  GRACE_LOOKBACK_DAYS,
  GRACE_PER_MONTH,
  graceUsedThisMonth,
  pointsFor,
  type LogRow,
} from "@/lib/scoring";

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const next = String(formData.get("next") ?? "/dashboard");

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true, message: `Check ${email} for your sign-in link.` };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/* ------------------------------------------------------------------ */
/* Profile                                                             */
/* ------------------------------------------------------------------ */

export async function saveProfile(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You are not signed in." };

  const displayName = String(formData.get("display_name") ?? "").trim();
  const cityLabel = String(formData.get("city_label") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));
  const method = String(formData.get("calculation_method") ?? "");
  const madhab = String(formData.get("madhab") ?? "Shafi");

  if (!displayName) return { ok: false, error: "Pick a name your group will recognise." };
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return { ok: false, error: "Choose a city, or allow location access." };
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return { ok: false, error: "Choose a city, or allow location access." };
  }
  if (!isMethodId(method)) return { ok: false, error: "Pick a calculation method." };

  // Reject a timezone Intl does not recognise — a bad zone would silently shift
  // every day boundary for this user.
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: timezone });
  } catch {
    return { ok: false, error: "That timezone was not recognised. Try picking a city instead." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      city_label: cityLabel || null,
      latitude,
      longitude,
      timezone,
      calculation_method: method,
      madhab: madhab === "Hanafi" ? "Hanafi" : "Shafi",
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");

  // Onboarding passes this so a first-time user lands where they were headed.
  const to = String(formData.get("redirect_to") ?? "");
  if (to.startsWith("/") && !to.startsWith("//")) redirect(to);

  return { ok: true, message: "Saved." };
}

/* ------------------------------------------------------------------ */
/* Check-in — the one action that must not be forgeable                */
/* ------------------------------------------------------------------ */

/**
 * Records today's Fajr.
 *
 * Every input that decides whether this is allowed is recomputed here from the
 * stored profile and the server clock. The client sends only the congregation
 * flag. There is no code path that accepts a date, a time, or a tier from the
 * browser, and `authenticated` has no INSERT policy on `fajr_logs`, so this is
 * the only way a row can appear.
 */
export async function checkIn(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "You are not signed in." };

  const location = locationOf(profile);
  if (!location) return { ok: false, error: "Set your city first so we can work out Fajr." };

  const inCongregation = formData.get("in_congregation") === "on";
  const view = todayView(location, new Date());

  if (view.state === "before") {
    return {
      ok: false,
      error: "Fajr has not come in yet. The window opens at the adhan.",
    };
  }
  if (view.state === "closed" || !view.tier) {
    return {
      ok: false,
      error: "The sun is already up. Fajr can only be logged between the adhan and sunrise.",
    };
  }

  const points = pointsFor(view.tier, inCongregation);
  const admin = createAdminClient();

  const { error } = await admin.from("fajr_logs").insert({
    user_id: profile.id,
    prayer_date: view.today,
    kind: "prayed",
    tier: view.tier,
    in_congregation: inCongregation,
    points,
    fajr_at: view.window.fajr.toISOString(),
    sunrise_at: view.window.sunrise.toISOString(),
  });

  if (error) {
    // 23505 = unique_violation on (user_id, prayer_date).
    if (error.code === "23505") return { ok: false, error: "You already logged Fajr today." };
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: `Logged. +${points} points.` };
}

/**
 * Spends a grace day on a recent miss.
 *
 * A grace day never claims a prayer happened: it writes zero points and is
 * excluded from consistency. It only stops one miss from resetting a streak.
 */
export async function useGraceDay(
  _prev: ActionResult | null,
  _formData: FormData,
): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "You are not signed in." };

  const location = locationOf(profile);
  if (!location) return { ok: false, error: "Set your city first." };

  const today = localDate(new Date(), location.timezone);
  const target = addDays(today, -GRACE_LOOKBACK_DAYS);

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("fajr_logs")
    .select("user_id, prayer_date, kind, tier, in_congregation, points")
    .eq("user_id", profile.id);

  const rows = (existing ?? []) as LogRow[];

  if (rows.some((r) => r.prayer_date === target)) {
    return { ok: false, error: "That day is already accounted for." };
  }
  if (graceUsedThisMonth(rows, today) >= GRACE_PER_MONTH) {
    return {
      ok: false,
      error: `You have used both grace days this month. They reset on the 1st.`,
    };
  }

  const window = windowFor(location, target);
  const admin = createAdminClient();

  const { error } = await admin.from("fajr_logs").insert({
    user_id: profile.id,
    prayer_date: target,
    kind: "grace",
    tier: null,
    in_congregation: false,
    points: 0,
    fajr_at: window.fajr.toISOString(),
    sunrise_at: window.sunrise.toISOString(),
  });

  if (error) {
    if (error.code === "23505") return { ok: false, error: "That day is already accounted for." };
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Grace day applied. Your streak is safe." };
}

/* ------------------------------------------------------------------ */
/* Groups                                                              */
/* ------------------------------------------------------------------ */

export async function createGroup(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "You are not signed in." };

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (name.length < 1 || name.length > 60) {
    return { ok: false, error: "Give the group a name (1–60 characters)." };
  }

  const admin = createAdminClient();

  const { data: codeData, error: codeError } = await admin.rpc("generate_invite_code");
  if (codeError) return { ok: false, error: codeError.message };

  const { data: group, error } = await admin
    .from("groups")
    .insert({
      name,
      description: description || null,
      owner_id: profile.id,
      invite_code: codeData as string,
    })
    .select("id")
    .single();

  if (error || !group) return { ok: false, error: error?.message ?? "Could not create the group." };

  const { error: memberError } = await admin
    .from("group_members")
    .insert({ group_id: group.id, user_id: profile.id, role: "owner" });

  if (memberError) {
    // Don't leave an orphan group nobody can see or delete.
    await admin.from("groups").delete().eq("id", group.id);
    return { ok: false, error: memberError.message };
  }

  revalidatePath("/dashboard");
  redirect(`/g/${group.id}`);
}

export async function joinGroup(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "You are not signed in." };

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter an invite code." };

  const admin = createAdminClient();

  // Looked up with the service role because a non-member cannot see the group
  // yet — the invite code is what grants them the right to.
  const { data: group } = await admin
    .from("groups")
    .select("id")
    .eq("invite_code", code)
    .maybeSingle();

  if (!group) return { ok: false, error: "That invite code does not match any group." };

  const { error } = await admin
    .from("group_members")
    .upsert(
      { group_id: group.id, user_id: profile.id, role: "member" },
      { onConflict: "group_id,user_id", ignoreDuplicates: true },
    );

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  redirect(`/g/${group.id}`);
}

export async function leaveGroup(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "You are not signed in." };

  const groupId = String(formData.get("group_id") ?? "");
  if (!groupId) return { ok: false, error: "Missing group." };

  const supabase = await createClient();
  const { data: group } = await supabase
    .from("groups")
    .select("owner_id")
    .eq("id", groupId)
    .maybeSingle();

  if (group && group.owner_id === profile.id) {
    return {
      ok: false,
      error: "You own this group. Delete it instead, or hand it over first.",
    };
  }

  // RLS allows deleting only your own membership row.
  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", profile.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteGroup(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await getProfile();
  if (!profile) return { ok: false, error: "You are not signed in." };

  const groupId = String(formData.get("group_id") ?? "");
  if (!groupId) return { ok: false, error: "Missing group." };

  const supabase = await createClient();
  // RLS restricts DELETE on groups to the owner, so this is safe as-is.
  const { error } = await supabase.from("groups").delete().eq("id", groupId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
