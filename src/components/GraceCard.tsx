"use client";

import { useActionState } from "react";
import { useGraceDay, type ActionResult } from "@/app/actions";
import { Notice, SubmitButton } from "./ui";

/**
 * Offered whenever the previous day is unaccounted for and the monthly budget
 * still has room — independent of today's window, because the moment someone
 * wants to protect a streak is rarely the moment the window happens to be open.
 */
export function GraceCard({
  targetDate,
  remaining,
  streakAtStake,
}: {
  targetDate: string;
  remaining: number;
  streakAtStake: number;
}) {
  const [state, action] = useActionState<ActionResult | null, FormData>(useGraceDay, null);

  return (
    <form action={action} className="card border-violet/25 p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🛡️</span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">
            You missed {targetDate} <span className="ar text-muted">· يوم سماح</span>
          </h2>
          <p className="mt-1 text-sm text-muted">
            {streakAtStake > 0 ? (
              <>
                A grace day keeps your <strong className="text-ink">{streakAtStake}-day streak</strong>{" "}
                alive. It scores zero points and never counts as a prayer — it only stops one miss
                from resetting you to nothing.
              </>
            ) : (
              <>
                A grace day covers the gap so a fresh streak can build through it. It scores zero
                points and never counts as a prayer.
              </>
            )}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <SubmitButton variant="ghost" pendingLabel="Applying…">
              Use a grace day
            </SubmitButton>
            <span className="text-xs text-dim">
              {remaining} of 2 left this month · resets on the 1st
            </span>
          </div>

          <div className="mt-3">
            <Notice result={state} />
          </div>
        </div>
      </div>
    </form>
  );
}
