"use client";

import { useActionState, useMemo, useState } from "react";
import { saveProfile, type ActionResult } from "@/app/actions";
import { Notice, SubmitButton } from "./ui";
import { CITIES, cityForTimezone, cityName, searchCities, type City } from "@/lib/cities";
import { getDict, type Locale } from "@/lib/i18n";
import {
  CALCULATION_METHODS,
  DEFAULT_METHOD,
  formatTime,
  isValidWindow,
  localDate,
  todayView,
  type MethodId,
} from "@/lib/prayer";

type Props = {
  locale: Locale;
  initial: {
    displayName: string;
    cityId: string | null;
    cityLabel: string | null;
    latitude: number | null;
    longitude: number | null;
    timezone: string | null;
    method: string;
  };
  submitLabel: string;
  /** Where to send the user after a successful save. Omit to stay on the page. */
  redirectTo?: string;
  /**
   * Number the two cards and mark them required. Onboarding uses this so the
   * page reads as a checklist you must finish; settings does not, because there
   * the same fields are just editable values.
   */
  numbered?: boolean;
};

export function LocationPicker({ locale, initial, submitLabel, redirectTo, numbered }: Props) {
  const t = getDict(locale);
  const [state, action] = useActionState<ActionResult | null, FormData>(saveProfile, null);

  const [query, setQuery] = useState("");
  const [cityId, setCityId] = useState(initial.cityId ?? "");
  const [cityLabel, setCityLabel] = useState(initial.cityLabel ?? "");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initial.latitude !== null && initial.longitude !== null
      ? { lat: initial.latitude, lng: initial.longitude }
      : null,
  );
  const [timezone, setTimezone] = useState(initial.timezone ?? "");
  // Not user-facing: each bundled city carries the convention its own local
  // authority uses, so picking a city picks the method. A dropped pin falls back
  // to the default.
  const [method, setMethod] = useState<MethodId>(
    (CALCULATION_METHODS.find((m) => m.id === initial.method)?.id ?? DEFAULT_METHOD) as MethodId,
  );
  const [geoError, setGeoError] = useState<string | null>(null);

  const results = useMemo(() => searchCities(query), [query]);

  function pickCity(city: City) {
    setCoords({ lat: city.latitude, lng: city.longitude });
    setTimezone(city.timezone);
    setCityId(city.id);
    setCityLabel(cityName(city, locale));
    setMethod(city.method);
    setQuery("");
  }

  function useMyLocation() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError(t.picker.geoUnsupported);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setTimezone(tz);
        // Only borrow the name and method — the pinned coordinates stay exact,
        // so this is not the same as having picked that city.
        const near = cityForTimezone(tz);
        setCityId("");
        setCityLabel(
          near ? cityName(near, locale) : (tz.split("/").pop()?.replace(/_/g, " ") ?? tz),
        );
        setMethod(near ? near.method : DEFAULT_METHOD);
      },
      () => setGeoError(t.picker.geoBlocked),
    );
  }

  // Preview the real window so the choice is verifiable before saving.
  const preview = useMemo(() => {
    if (!coords || !timezone) return null;
    try {
      const view = todayView(
        { latitude: coords.lat, longitude: coords.lng, timezone, method },
        new Date(),
      );
      if (!isValidWindow(view.window)) return null;
      return {
        date: localDate(new Date(), timezone),
        fajr: formatTime(view.window.fajr, timezone),
        sunrise: formatTime(view.window.sunrise, timezone),
      };
    } catch {
      return null;
    }
  }, [coords, timezone, method]);

  const popular = CITIES.slice(0, 6);

  const step = (n: number) =>
    numbered ? (
      <span className="tabular flex size-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-bold text-gold">
        {n}
      </span>
    ) : null;

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="latitude" value={coords?.lat ?? ""} />
      <input type="hidden" name="longitude" value={coords?.lng ?? ""} />
      <input type="hidden" name="timezone" value={timezone} />
      <input type="hidden" name="city_label" value={cityLabel} />
      <input type="hidden" name="city_id" value={cityId} />
      <input type="hidden" name="calculation_method" value={method} />
      {redirectTo && <input type="hidden" name="redirect_to" value={redirectTo} />}

      {/* Name ---------------------------------------------------------- */}
      <div className="card p-5">
        <div className="flex items-center gap-2.5">
          {step(1)}
          <label htmlFor="display_name" className="text-sm font-medium">
            {t.picker.nameLabel}
          </label>
          {numbered && (
            <span className="rounded-full border border-line px-2 py-0.5 text-[10px] text-dim">
              {t.picker.required}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted">{t.picker.nameHelp}</p>
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
        <div className="flex items-center gap-2.5">
          {step(2)}
          <h2 className="text-sm font-medium">{t.picker.whereLabel}</h2>
          {numbered && (
            <span className="rounded-full border border-line px-2 py-0.5 text-[10px] text-dim">
              {t.picker.required}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted">{t.picker.whereHelp}</p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.picker.searchPlaceholder}
              aria-label={t.picker.searchAria}
              className="w-full rounded-xl border border-line bg-night px-3.5 py-2.5 text-sm outline-none transition focus:border-gold/60"
            />
            {results.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-line bg-surface-2 shadow-2xl">
                {results.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => pickCity(c)}
                      className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-start text-sm hover:bg-line"
                    >
                      <span>{locale === "ar" ? c.ar : c.name}</span>
                      <span className="text-xs text-dim">
                        {locale === "ar" ? c.name : c.country}
                      </span>
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
            {t.picker.useLocation}
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
                {locale === "ar" ? c.ar : c.name}
              </button>
            ))}
          </div>
        )}

        {geoError && <p className="mt-2 text-xs text-danger">{geoError}</p>}

        {coords && (
          <div className="mt-4 rounded-xl border border-line bg-night/60 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {cityLabel || t.picker.customLocation}
                </p>
                <p className="tabular mt-0.5 truncate text-xs text-dim">
                  {coords.lat.toFixed(3)}, {coords.lng.toFixed(3)} · {timezone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCoords(null);
                  setCityLabel("");
                  setCityId("");
                  setTimezone("");
                }}
                className="shrink-0 text-xs text-muted underline underline-offset-2 hover:text-ink"
              >
                {t.picker.change}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview ------------------------------------------------------- */}
      {preview && (
        <div className="card border-gold/20 p-5">
          <p className="text-xs uppercase text-dim">{t.picker.previewTitle}</p>
          <div className="mt-2.5 flex items-baseline gap-6">
            <div>
              <p className="tabular text-3xl font-bold text-gold">{preview.fajr}</p>
              <p className="text-xs text-muted">{t.picker.previewFajr}</p>
            </div>
            <span className="text-dim">→</span>
            <div>
              <p className="tabular text-3xl font-bold text-muted">{preview.sunrise}</p>
              <p className="text-xs text-muted">{t.picker.previewSunrise}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-dim">
            <span className="tabular">{preview.date}</span> — {t.picker.previewNote}
          </p>
          <p className="mt-1 text-xs text-dim">{t.picker.methodInUse(t.methods[method].label)}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton disabled={!coords} pendingLabel={t.picker.saving}>
          {submitLabel}
        </SubmitButton>
        {!coords && <p className="text-xs text-muted">{t.picker.pickCityFirst}</p>}
      </div>

      <Notice result={state} />
    </form>
  );
}
