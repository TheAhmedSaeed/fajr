"use client";

import { useActionState } from "react";
import { useGraceDay, type ActionResult } from "@/app/actions";
import { Notice, SubmitButton } from "./ui";
import { getDict, type Locale } from "@/lib/i18n";

/**
 * Offered whenever the previous day is unaccounted for and the monthly budget
 * still has room — independent of today's window, because the moment someone
 * wants to protect a streak is rarely the moment the window happens to be open.
 */
export function GraceCard({
  locale,
  targetDate,
  remaining,
  streakAtStake,
}: {
  locale: Locale;
  targetDate: string;
  remaining: number;
  streakAtStake: number;
}) {
  const t = getDict(locale);
  const [state, action] = useActionState<ActionResult | null, FormData>(useGraceDay, null);

  return (
    <form action={action} className="card border-violet/25 p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🛡️</span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">{t.grace.title(targetDate)}</h2>
          <p className="mt-1 text-sm text-muted">
            {streakAtStake > 0 ? t.grace.withStreak(streakAtStake) : t.grace.withoutStreak}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <SubmitButton variant="ghost" pendingLabel={t.grace.submitting}>
              {t.grace.submit}
            </SubmitButton>
            <span className="text-xs text-dim">{t.grace.remaining(remaining)}</span>
          </div>

          <div className="mt-3">
            <Notice result={state} />
          </div>
        </div>
      </div>
    </form>
  );
}
