import { redirect } from "next/navigation";
import { displayNameOf, getLogs, getProfile } from "@/lib/data";
import { getT } from "@/lib/locale";
import { LocationPicker } from "@/components/LocationPicker";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const { locale, t } = await getT();
  const logs = await getLogs([profile.id]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">{t.settings.title}</h1>
      <p className="mt-1 text-sm text-muted">{t.settings.subtitle}</p>

      <div className="mt-8">
        <LocationPicker
          locale={locale}
          initial={{
            displayName: displayNameOf(profile),
            cityId: profile.city_id,
            cityLabel: profile.city_label,
            latitude: profile.latitude,
            longitude: profile.longitude,
            timezone: profile.timezone,
            method: profile.calculation_method,
          }}
          submitLabel={t.settings.submit}
        />
      </div>

      <section className="card mt-6 p-5">
        <h2 className="text-sm font-semibold">{t.settings.recordTitle}</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label={t.settings.signedInAs} value={profile.email ?? "—"} ltr />
          <Row
            label={t.settings.daysLogged}
            value={String(logs.filter((l) => l.kind === "prayed").length)}
          />
          <Row
            label={t.settings.graceUsed}
            value={String(logs.filter((l) => l.kind === "grace").length)}
          />
        </dl>
        <p className="mt-4 border-t border-line pt-3 text-xs text-dim">{t.settings.permanence}</p>
      </section>
    </div>
  );
}

function Row({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className={`truncate font-medium ${ltr ? "ltr" : "tabular"}`}>{value}</dd>
    </div>
  );
}
