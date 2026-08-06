"use client";

import { useActionState, useMemo, useState } from "react";
import { saveProfile, type ActionResult } from "@/app/actions";
import { Notice, SubmitButton } from "./ui";
import { CITIES, cityForTimezone, searchCities, type City } from "@/lib/cities";
import {
  CALCULATION_METHODS,
  formatTime,
  isValidWindow,
  localDate,
  todayView,
  type MadhabId,
  type MethodId,
} from "@/lib/prayer";

type Props = {
  initial: {
    displayName: string;
    cityLabel: string | null;
    latitude: number | null;
    longitude: number | null;
    timezone: string | null;
    method: string;
    madhab: string;
  };
  submitLabel: string;
  /** Where to send the user after a successful save. Omit to stay on the page. */
  redirectTo?: string;
};

export function LocationPicker({ initial, submitLabel, redirectTo }: Props) {
  const [state, action] = useActionState<ActionResult | null, FormData>(saveProfile, null);

  const [query, setQuery] = useState("");
  const [cityLabel, setCityLabel] = useState(initial.cityLabel ?? "");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initial.latitude !== null && initial.longitude !== null
      ? { lat: initial.latitude, lng: initial.longitude }
      : null,
  );
  const [timezone, setTimezone] = useState(initial.timezone ?? "");
  const [method, setMethod] = useState<MethodId>(
    (CALCULATION_METHODS.find((m) => m.id === initial.method)?.id ?? "MuslimWorldLeague") as MethodId,
  );
  const [madhab, setMadhab] = useState<MadhabId>(initial.madhab === "Hanafi" ? "Hanafi" : "Shafi");
  const [geoError, setGeoError] = useState<string | null>(null);

  const results = useMemo(() => searchCities(query), [query]);

  function pickCity(city: City) {
    setCoords({ lat: city.latitude, lng: city.longitude });
    setTimezone(city.timezone);
    setCityLabel(`${city.name}, ${city.country}`);
    setMethod(city.method);
    setQuery("");
  }

  function useMyLocation() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("This browser can't share your location. Pick a city instead.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setTimezone(tz);
        // Only borrow the name and method — the pinned coordinates stay exact.
        const near = cityForTimezone(tz);
        setCityLabel(near ? `Near ${near.name}` : tz.split("/").pop()?.replace(/_/g, " ") ?? tz);
        if (near) setMethod(near.method);
      },
      () => setGeoError("Location was blocked. Pick a city from the list instead."),
    );
  }

  // Preview the real window so the choice is verifiable before saving.
  const preview = useMemo(() => {
    if (!coords || !timezone) return null;
    try {
      const loc = {
        latitude: coords.lat,
        longitude: coords.lng,
        timezone,
        method,
        madhab,
      };
      const view = todayView(loc, new Date());
      if (!isValidWindow(view.window)) return null;
      return {
        date: localDate(new Date(), timezone),
        fajr: formatTime(view.window.fajr, timezone),
        sunrise: formatTime(view.window.sunrise, timezone),
      };
    } catch {
      return null;
    }
  }, [coords, timezone, method, madhab]);

  const popular = CITIES.slice(0, 6);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="latitude" value={coords?.lat ?? ""} />
      <input type="hidden" name="longitude" value={coords?.lng ?? ""} />
      <input type="hidden" name="timezone" value={timezone} />
      <input type="hidden" name="city_label" value={cityLabel} />
      <input type="hidden" name="calculation_method" value={method} />
      <input type="hidden" name="madhab" value={madhab} />
      {redirectTo && <input type="hidden" name="redirect_to" value={redirectTo} />}

      {/* Name ---------------------------------------------------------- */}
      <div className="card p-5">
        <label htmlFor="display_name" className="block text-sm font-medium">
          Your name
        </label>
        <p className="mt-1 text-xs text-muted">This is what your group sees on the leaderboard.</p>
        <input
          id="display_name"
          name="display_name"
          defaultValue={initial.displayName}
          required
          maxLength={40}
          className="mt-2.5 w-full rounded-xl border border-line bg-night px-3.5 py-2.5 text-sm outline-none transition focus:border-gold/60"
        />
      </div>

      {/* Location ------------------------------------------------------ */}
      <div className="card p-5">
        <h2 className="text-sm font-medium">Where do you pray?</h2>
        <p className="mt-1 text-xs text-muted">
          Fajr and sunrise are computed from this, for every day of the year.
        </p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a city…"
              aria-label="Search for your city"
              className="w-full rounded-xl border border-line bg-night px-3.5 py-2.5 text-sm outline-none transition focus:border-gold/60"
            />
            {results.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-line bg-surface-2 shadow-2xl">
                {results.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => pickCity(c)}
                      className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-line"
                    >
                      <span>
                        {c.name}
                        <span className="ml-2 text-xs text-dim">{c.country}</span>
                      </span>
                      <span className="ar text-sm text-muted">{c.ar}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={useMyLocation}
            className="rounded-xl border border-line bg-surface-2/60 px-4 py-2.5 text-sm font-medium transition hover:bg-surface-2"
          >
            📍 Use my location
          </button>
        </div>

        {!coords && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {popular.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => pickCity(c)}
                className="rounded-full border border-line bg-surface-2/60 px-3 py-1 text-xs text-muted transition hover:text-ink"
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {geoError && <p className="mt-2 text-xs text-danger">{geoError}</p>}

        {coords && (
          <div className="mt-4 rounded-xl border border-line bg-night/60 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{cityLabel || "Custom location"}</p>
                <p className="tabular mt-0.5 text-xs text-dim">
                  {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)} · {timezone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCoords(null);
                  setCityLabel("");
                  setTimezone("");
                }}
                className="text-xs text-muted underline underline-offset-2 hover:text-ink"
              >
                Change
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Method -------------------------------------------------------- */}
      <div className="card p-5">
        <label htmlFor="method" className="block text-sm font-medium">
          Calculation method
        </label>
        <p className="mt-1 text-xs text-muted">
          Authorities differ on the sun&rsquo;s angle at Fajr. Match your local mosque.
        </p>
        <select
          id="method"
          value={method}
          onChange={(e) => setMethod(e.target.value as MethodId)}
          className="mt-2.5 w-full rounded-xl border border-line bg-night px-3.5 py-2.5 text-sm outline-none transition focus:border-gold/60"
        >
          {CALCULATION_METHODS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label} — {m.note}
            </option>
          ))}
        </select>

        <fieldset className="mt-4">
          <legend className="text-sm font-medium">Madhab</legend>
          <p className="mt-1 text-xs text-muted">
            Affects Asr only — it will not change your Fajr window.
          </p>
          <div className="mt-2 flex gap-2">
            {(["Shafi", "Hanafi"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMadhab(m)}
                className={`rounded-xl border px-4 py-2 text-sm transition ${
                  madhab === m
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-line bg-surface-2/60 text-muted hover:text-ink"
                }`}
              >
                {m === "Shafi" ? "Shafi'i / Maliki / Hanbali" : "Hanafi"}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      {/* Preview ------------------------------------------------------- */}
      {preview && (
        <div className="card border-gold/20 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-dim">Your window today</p>
          <div className="mt-2.5 flex items-baseline gap-6">
            <div>
              <p className="tabular text-3xl font-bold text-gold">{preview.fajr}</p>
              <p className="text-xs text-muted">Fajr adhan</p>
            </div>
            <span className="text-dim">→</span>
            <div>
              <p className="tabular text-3xl font-bold text-muted">{preview.sunrise}</p>
              <p className="text-xs text-muted">
                Sunrise <span className="ar">· الشروق</span>
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-dim">
            {preview.date} — check-in is open only between these two times.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <SubmitButton disabled={!coords} pendingLabel="Saving…">
          {submitLabel}
        </SubmitButton>
        {!coords && <p className="text-xs text-muted">Pick a city to continue.</p>}
      </div>

      <Notice result={state} />
    </form>
  );
}
