import { redirect } from "next/navigation";
import { displayNameOf, getProfile, isOnboarded } from "@/lib/data";
import { getT } from "@/lib/locale";
import { LocationPicker } from "@/components/LocationPicker";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const { next } = await searchParams;
  // Already set up and arriving here by hand — send them on.
  if (isOnboarded(profile) && !next) redirect("/dashboard");

  const { locale, t } = await getT();

  return (
    <div className="mx-auto max-w-2xl py-4">
      <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
        <span className="size-1.5 rounded-full bg-gold" />
        {t.onboarding.eyebrow}
      </span>

      <h1 className="mt-4 text-3xl font-bold">
        {t.onboarding.title} <span aria-hidden>🌅</span>
      </h1>
      <p className="mt-2 text-muted">{t.onboarding.subtitle}</p>

      <p className="mt-4 rounded-xl border border-line bg-surface-2/40 px-4 py-3 text-sm text-muted">
        {t.onboarding.why}
      </p>

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
          submitLabel={t.onboarding.submit}
          redirectTo={next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"}
          numbered
        />
      </div>

      <p className="mt-6 text-center text-xs text-dim">{t.onboarding.changeLater}</p>
    </div>
  );
}
