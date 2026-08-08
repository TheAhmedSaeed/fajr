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
      <p className="text-xs uppercase text-gold">{t.onboarding.eyebrow}</p>
      <h1 className="mt-3 text-3xl font-bold">{t.onboarding.title}</h1>
      <p className="mt-2 text-muted">{t.onboarding.subtitle}</p>

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
        />
      </div>
    </div>
  );
}
