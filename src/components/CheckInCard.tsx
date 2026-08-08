"use client";

import { useActionState, useEffect, useState } from "react";
import { checkIn, type ActionResult } from "@/app/actions";
import { Notice, SubmitButton } from "./ui";
import type { Tier } from "@/lib/prayer";
import { getDict, type Dict, type Locale } from "@/lib/i18n";
import { TIER_POINTS } from "@/lib/scoring";

type Logged = { tier: Tier | null; points: number; inCongregation: boolean; kind: "prayed" | "grace" };

export type CheckInCardProps = {
  locale: Locale;
  cityLabel: string;
  /** ISO instants; all display strings are pre-formatted server-side in the user's zone. */
  fajrISO: string;
  sunriseISO: string;
  nextFajrISO: string;
  fajrLabel: string;
  sunriseLabel: string;
  nextFajrLabel: string;
  /** Server clock at render time, so SSR and the first client paint agree. */
  serverNowISO: string;
  logged: Logged | null;
  streak: number;
};

const TONES: Record<Tier, string> = {
  early: "text-gold",
  middle: "text-rose",
  late: "text-muted",
};

function duration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function CheckInCard(props: CheckInCardProps) {
  const t = getDict(props.locale);
  const isRtl = props.locale === "ar";

  const fajr = new Date(props.fajrISO).getTime();
  const sunrise = new Date(props.sunriseISO).getTime();
  const nextFajr = new Date(props.nextFajrISO).getTime();

  // Seed from the server clock so the first client render matches the HTML.
  const [now, setNow] = useState(() => new Date(props.serverNowISO).getTime());
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const [checkInState, checkInAction] = useActionState<ActionResult | null, FormData>(checkIn, null);

  const state = now < fajr ? "before" : now < sunrise ? "open" : "closed";
  const progress = state === "open" ? (now - fajr) / (sunrise - fajr) : 0;
  const liveTier: Tier = progress < 1 / 3 ? "early" : progress < 2 / 3 ? "middle" : "late";

  return (
    <section className="card overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
        <div>
          <p className="text-xs uppercase text-dim">{t.checkIn.heading}</p>
          <p className="mt-0.5 text-sm text-muted">{props.cityLabel}</p>
        </div>
        <div className="flex gap-5 text-end">
          <div>
            <p className="text-[10px] uppercase text-dim">{t.checkIn.adhan}</p>
            <p className="tabular text-lg font-semibold text-gold">{props.fajrLabel}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-dim">{t.checkIn.sunrise}</p>
            <p className="tabular text-lg font-semibold text-muted">{props.sunriseLabel}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-6">
        {props.logged ? (
          <LoggedState
            t={t}
            logged={props.logged}
            streak={props.streak}
            sunriseLabel={props.sunriseLabel}
          />
        ) : state === "before" ? (
          <BeforeState t={t} msLeft={fajr - now} fajrLabel={props.fajrLabel} />
        ) : state === "open" ? (
          <OpenState
            t={t}
            isRtl={isRtl}
            msLeft={sunrise - now}
            progress={progress}
            tier={liveTier}
            action={checkInAction}
            result={checkInState}
          />
        ) : (
          <ClosedState
            t={t}
            msLeft={nextFajr - now}
            nextFajrLabel={props.nextFajrLabel}
            sunriseLabel={props.sunriseLabel}
          />
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function LoggedState({
  t,
  logged,
  streak,
  sunriseLabel,
}: {
  t: Dict;
  logged: Logged;
  streak: number;
  sunriseLabel: string;
}) {
  if (logged.kind === "grace") {
    return (
      <div className="text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-violet/15 text-3xl">
          🛡️
        </div>
        <p className="mt-4 text-lg font-semibold">{t.checkIn.graceTitle}</p>
        <p className="mt-1 text-sm text-muted">{t.checkIn.graceBody}</p>
      </div>
    );
  }

  const tier = logged.tier;

  return (
    <div className="text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-teal/15 text-3xl">
        ✓
      </div>
      <p className="mt-4 text-lg font-semibold">{t.checkIn.loggedTitle}</p>

      {tier && <p className={`mt-1 text-sm ${TONES[tier]}`}>{t.tiers[tier].name}</p>}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm">
        <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-semibold text-gold">
          {t.checkIn.loggedPoints(logged.points)}
        </span>
        {logged.inCongregation && (
          <span className="rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-teal">
            {t.checkIn.loggedJamaah}
          </span>
        )}
        {streak > 0 && (
          <span className="rounded-full border border-line bg-surface-2 px-3 py-1">
            {t.checkIn.loggedStreak(streak)}
          </span>
        )}
      </div>

      <p className="mt-5 text-xs text-dim">{t.checkIn.loggedClosed(sunriseLabel)}</p>
    </div>
  );
}

function BeforeState({ t, msLeft, fajrLabel }: { t: Dict; msLeft: number; fajrLabel: string }) {
  return (
    <div className="text-center">
      <p className="text-xs uppercase text-dim">{t.checkIn.beforeLabel}</p>
      <p className="tabular mx-auto mt-2 text-5xl font-bold sm:text-6xl dawn-text">
        {duration(msLeft)}
      </p>
      <p className="mt-3 text-sm text-muted">{t.checkIn.beforeHelp(fajrLabel)}</p>
      <button
        disabled
        className="mt-6 w-full cursor-not-allowed rounded-xl border border-line bg-surface-2/50 px-4 py-3.5 text-sm font-semibold text-dim"
      >
        {t.checkIn.locked}
      </button>
    </div>
  );
}

function OpenState({
  t,
  isRtl,
  msLeft,
  progress,
  tier,
  action,
  result,
}: {
  t: Dict;
  isRtl: boolean;
  msLeft: number;
  progress: number;
  tier: Tier;
  action: (payload: FormData) => void;
  result: ActionResult | null;
}) {
  return (
    <div>
      <div className="text-center">
        <p className="text-xs uppercase text-dim">{t.checkIn.openLabel}</p>
        <p className="tabular mx-auto mt-2 text-5xl font-bold sm:text-6xl dawn-text">
          {duration(msLeft)}
        </p>
        <p className={`mt-3 text-sm font-medium ${TONES[tier]}`}>
          {t.checkIn.openPrompt(TIER_POINTS[tier], t.tiers[tier].name)}
        </p>
      </div>

      <ThirdsBar t={t} progress={progress} isRtl={isRtl} />

      <form action={action} className="mt-6 space-y-3">
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface-2/50 px-4 py-3 text-sm hover:bg-surface-2">
          <input
            type="checkbox"
            name="in_congregation"
            className="size-4 accent-[var(--color-teal)]"
          />
          <span>{t.checkIn.congregation}</span>
          <span className="tabular ms-auto text-xs font-semibold text-teal">+2</span>
        </label>

        <SubmitButton className="w-full py-3.5 text-base pulse" pendingLabel={t.checkIn.submitting}>
          {t.checkIn.submit}
        </SubmitButton>

        <Notice result={result} />
      </form>
    </div>
  );
}

/**
 * The three scoring bands with a marker for "now". Built on logical inset so it
 * mirrors under RTL; the marker's own centring translate has to flip by hand
 * because `transform` is physical, not direction-aware.
 */
function ThirdsBar({ t, progress, isRtl }: { t: Dict; progress: number; isRtl: boolean }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <div className="mt-6">
      <div className="relative h-2 overflow-hidden rounded-full bg-surface-2">
        <div className="absolute inset-y-0 start-0 w-1/3 bg-gold/35" />
        <div className="absolute inset-y-0 start-1/3 w-1/3 bg-rose/30" />
        <div className="absolute inset-y-0 start-2/3 w-1/3 bg-muted/15" />
        <div
          className="absolute -top-1 size-4 rounded-full border-2 border-night bg-ink shadow"
          style={{
            insetInlineStart: `${pct}%`,
            transform: `translateX(${isRtl ? "50%" : "-50%"})`,
          }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] uppercase text-dim">
        <span className="text-gold">
          {TIER_POINTS.early} {t.checkIn.pts}
        </span>
        <span className="text-rose">
          {TIER_POINTS.middle} {t.checkIn.pts}
        </span>
        <span>
          {TIER_POINTS.late} {t.checkIn.pts}
        </span>
      </div>
    </div>
  );
}

function ClosedState({
  t,
  msLeft,
  nextFajrLabel,
  sunriseLabel,
}: {
  t: Dict;
  msLeft: number;
  nextFajrLabel: string;
  sunriseLabel: string;
}) {
  return (
    <div className="text-center">
      <p className="text-sm text-muted">{t.checkIn.closedBody(sunriseLabel)}</p>
      <p className="mt-4 text-xs uppercase text-dim">{t.checkIn.nextLabel}</p>
      <p className="tabular mx-auto mt-1 text-4xl font-bold sm:text-5xl">{duration(msLeft)}</p>
      <p className="mt-2 text-sm text-muted">{t.checkIn.nextAt(nextFajrLabel)}</p>
    </div>
  );
}
