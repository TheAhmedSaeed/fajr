import { redirect } from "next/navigation";
import { displayNameOf, getLogs, getProfile } from "@/lib/data";
import { LocationPicker } from "@/components/LocationPicker";
import { GRACE_PER_MONTH } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const logs = await getLogs([profile.id]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted">
        Moving city? Update this and every future window follows the new location.
      </p>

      <div className="mt-8">
        <LocationPicker
          initial={{
            displayName: displayNameOf(profile),
            cityLabel: profile.city_label,
            latitude: profile.latitude,
            longitude: profile.longitude,
            timezone: profile.timezone,
            method: profile.calculation_method,
            madhab: profile.madhab,
          }}
          submitLabel="Save changes"
        />
      </div>

      <section className="card mt-6 p-5">
        <h2 className="text-sm font-semibold">Your record</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label="Signed in as" value={profile.email ?? "—"} />
          <Row label="Days logged" value={String(logs.filter((l) => l.kind === "prayed").length)} />
          <Row label="Grace days used" value={String(logs.filter((l) => l.kind === "grace").length)} />
        </dl>
        <p className="mt-4 border-t border-line pt-3 text-xs text-dim">
          Past check-ins are permanent — they can&rsquo;t be edited or deleted, by you or anyone
          else. That&rsquo;s what makes the leaderboard worth anything. You get {GRACE_PER_MONTH}{" "}
          grace days a month and nothing more.
        </p>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}
