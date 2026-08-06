import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile, isOnboarded } from "@/lib/data";
import { JoinButton } from "./JoinButton";

export const dynamic = "force-dynamic";

/**
 * Public landing page for an invite link. It shows just enough for someone to
 * recognise the group before signing in — the name and how many people are in
 * it, never the member list or anyone's history.
 */
export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const normalized = code.trim().toUpperCase();

  const admin = createAdminClient();
  const { data: group } = await admin
    .from("groups")
    .select("id, name, description")
    .eq("invite_code", normalized)
    .maybeSingle();

  if (!group) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-4xl">🌑</p>
        <h1 className="mt-4 text-xl font-bold">This invite doesn&rsquo;t work</h1>
        <p className="mt-2 text-sm text-muted">
          The code may have been mistyped, or the group was deleted.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl border border-line px-4 py-2.5 text-sm hover:bg-surface-2"
        >
          Go home
        </Link>
      </div>
    );
  }

  const { count } = await admin
    .from("group_members")
    .select("*", { count: "exact", head: true })
    .eq("group_id", group.id);

  const profile = await getProfile();

  // Signed in but with no location yet — set that up first, then come back here.
  if (profile && !isOnboarded(profile)) {
    redirect(`/onboarding?next=${encodeURIComponent(`/join/${normalized}`)}`);
  }

  // Already a member: just go to the group.
  if (profile) {
    const { data: existing } = await admin
      .from("group_members")
      .select("group_id")
      .eq("group_id", group.id)
      .eq("user_id", profile.id)
      .maybeSingle();
    if (existing) redirect(`/g/${group.id}`);
  }

  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <p className="text-xs uppercase tracking-[0.22em] text-gold">You&rsquo;re invited</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{group.name}</h1>
      {group.description && <p className="mt-2 text-muted">{group.description}</p>}
      <p className="mt-3 text-sm text-dim">
        {count ?? 0} {count === 1 ? "person is" : "people are"} already in
      </p>

      <div className="card mt-8 p-5 text-left">
        <p className="text-sm text-muted">
          Joining means your Fajr check-ins show on this group&rsquo;s board. You can only log
          between the adhan and sunrise in your own city — and you can leave any time.
        </p>
      </div>

      <div className="mt-6">
        {profile ? (
          <JoinButton code={normalized} />
        ) : (
          <Link
            href={`/login?next=${encodeURIComponent(`/join/${normalized}`)}`}
            className="inline-block w-full rounded-xl bg-gradient-to-r from-gold to-rose px-6 py-3 text-sm font-semibold text-night transition hover:brightness-110"
          >
            Sign in to join
          </Link>
        )}
      </div>
    </div>
  );
}
