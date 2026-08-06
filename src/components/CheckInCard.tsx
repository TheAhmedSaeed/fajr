"use client";

import { useActionState, useEffect, useState } from "react";
import { checkIn, type ActionResult } from "@/app/actions";
import { Notice, SubmitButton } from "./ui";
import type { Tier } from "@/lib/prayer";

type Logged = { tier: Tier | null; points: number; inCongregation: boolean; kind: "prayed" | "grace" };

export type CheckInCardProps = {
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

const TIER_COPY: Record<Tier, { label: string; ar: string; points: number; tone: string }> = {
  early: { label: "First light", ar: "الوقت المختار", points: 3, tone: "text-gold" },
  middle: { label: "On time", ar: "في الوقت", points: 2, tone: "text-rose" },
  late: { label: "Just in time", ar: "قبل الشروق", points: 1, tone: "text-muted" },
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

  // Which third of the window we're in right now.
  const progress = state === "open" ? (now - fajr) / (sunrise - fajr) : 0;
  const liveTier: Tier = progress < 1 / 3 ? "early" : progress < 2 / 3 ? "middle" : "late";

  return (
    <section className="card overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-dim">Today&rsquo;s Fajr</p>
          <p className="mt-0.5 text-sm text-muted">{props.cityLabel}</p>
        </div>
        <div className="flex gap-5 text-right">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-dim">Adhan</p>
            <p className="tabular text-lg font-semibold text-gold">{props.fajrLabel}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-dim">Sunrise</p>
            <p className="tabular text-lg font-semibold text-muted">{props.sunriseLabel}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-6">
        {props.logged ? (
          <LoggedState logged={props.logged} streak={props.streak} sunriseLabel={props.sunriseLabel} />
        ) : state === "before" ? (
          <BeforeState msLeft={fajr - now} fajrLabel={props.fajrLabel} />
        ) : state === "open" ? (
          <OpenState
            msLeft={sunrise - now}
            progress={progress}
            tier={liveTier}
            action={checkInAction}
            result={checkInState}
          />
        ) : (
          <ClosedState
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
  logged,
  streak,
  sunriseLabel,
}: {
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
        <p className="mt-4 text-lg font-semibold">Grace day applied</p>
        <p className="mt-1 text-sm text-muted">
          Your streak is protected. It doesn&rsquo;t count as a prayer — tomorrow does.
        </p>
      </div>
    );
  }

  const tier = logged.tier ? TIER_COPY[logged.tier] : null;

  return (
    <div className="text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-teal/15 text-3xl">
        ✓
      </div>
      <p className="mt-4 text-lg font-semibold">
        Fajr logged <span className="ar text-muted">· صليت الفجر</span>
      </p>

      {tier && (
        <p className={`mt-1 text-sm ${tier.tone}`}>
          {tier.label} <span className="ar">· {tier.ar}</span>
        </p>
      )}

      <div className="mt-5 flex items-center justify-center gap-3 text-sm">
        <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-semibold text-gold">
          +{logged.points} points
        </span>
        {logged.inCongregation && (
          <span className="rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-teal">
            🕌 In congregation
          </span>
        )}
        {streak > 0 && (
          <span className="rounded-full border border-line bg-surface-2 px-3 py-1">
            🔥 {streak}-day streak
          </span>
        )}
      </div>

      <p className="mt-5 text-xs text-dim">
        The window closed at {sunriseLabel}. Come back tomorrow.
      </p>
    </div>
  );
}

function BeforeState({ msLeft, fajrLabel }: { msLeft: number; fajrLabel: string }) {
  return (
    <div className="text-center">
      <p className="text-xs uppercase tracking-[0.16em] text-dim">Fajr begins in</p>
      <p className="tabular mt-2 text-5xl font-bold sm:text-6xl dawn-text">{duration(msLeft)}</p>
      <p className="mt-3 text-sm text-muted">
        Check-in unlocks at the adhan ({fajrLabel}) and closes at sunrise.
      </p>
      <button
        disabled
        className="mt-6 w-full cursor-not-allowed rounded-xl border border-line bg-surface-2/50 px-4 py-3.5 text-sm font-semibold text-dim"
      >
        🔒 Locked until Fajr
      </button>
    </div>
  );
}

function OpenState({
  msLeft,
  progress,
  tier,
  action,
  result,
}: {
  msLeft: number;
  progress: number;
  tier: Tier;
  action: (payload: FormData) => void;
  result: ActionResult | null;
}) {
  const copy = TIER_COPY[tier];

  return (
    <div>
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.16em] text-dim">Window closes in</p>
        <p className="tabular mt-2 text-5xl font-bold sm:text-6xl dawn-text">{duration(msLeft)}</p>
        <p className={`mt-3 text-sm font-medium ${copy.tone}`}>
          Log now for <strong>{copy.points} points</strong> — {copy.label}{" "}
          <span className="ar">· {copy.ar}</span>
        </p>
      </div>

      <ThirdsBar progress={progress} />

      <form action={action} className="mt-6 space-y-3">
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface-2/50 px-4 py-3 text-sm hover:bg-surface-2">
          <input
            type="checkbox"
            name="in_congregation"
            className="size-4 accent-[var(--color-teal)]"
          />
          <span>
            I prayed in congregation <span className="ar text-muted">· في جماعة</span>
          </span>
          <span className="ml-auto text-xs font-semibold text-teal">+2</span>
        </label>

        <SubmitButton className="w-full py-3.5 text-base pulse" pendingLabel="Logging…">
          I prayed Fajr <span className="ar">· صليت الفجر</span>
        </SubmitButton>

        <Notice result={result} />
      </form>
    </div>
  );
}

/** Visual of the three scoring bands, with a marker for where "now" sits. */
function ThirdsBar({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <div className="mt-6">
      <div className="relative h-2 overflow-hidden rounded-full bg-surface-2">
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gold/35" />
        <div className="absolute inset-y-0 left-1/3 w-1/3 bg-rose/30" />
        <div className="absolute inset-y-0 left-2/3 w-1/3 bg-muted/15" />
        <div
          className="absolute -top-1 size-4 -translate-x-1/2 rounded-full border-2 border-night bg-ink shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-wider text-dim">
        <span className="text-gold">3 pts</span>
        <span className="text-rose">2 pts</span>
        <span>1 pt</span>
      </div>
    </div>
  );
}

function ClosedState({
  msLeft,
  nextFajrLabel,
  sunriseLabel,
}: {
  msLeft: number;
  nextFajrLabel: string;
  sunriseLabel: string;
}) {
  return (
    <div className="text-center">
      <p className="text-sm text-muted">
        The sun rose at {sunriseLabel}. Today&rsquo;s window has closed.
      </p>
      <p className="mt-4 text-xs uppercase tracking-[0.16em] text-dim">Next Fajr in</p>
      <p className="tabular mt-1 text-4xl font-bold sm:text-5xl">{duration(msLeft)}</p>
      <p className="mt-2 text-sm text-muted">Tomorrow at {nextFajrLabel}</p>
    </div>
  );
}
