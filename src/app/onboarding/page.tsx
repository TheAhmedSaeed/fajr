import { redirect } from "next/navigation";
import { displayNameOf, getProfile, isOnboarded } from "@/lib/data";
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

  return (
    <div className="mx-auto max-w-2xl py-4">
      <p className="text-xs uppercase tracking-[0.22em] text-gold">One-time setup</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Set your Fajr window</h1>
      <p className="mt-2 text-muted">
        Everything else depends on this: your check-in only opens between the adhan and sunrise in{" "}
        <em>your</em> city, on today&rsquo;s date.
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
          submitLabel="Save and continue"
          redirectTo={next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"}
        />
      </div>
    </div>
  );
}
