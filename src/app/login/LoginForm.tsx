"use client";

import { useActionState, useState } from "react";
import { signIn, type ActionResult } from "@/app/actions";
import { Notice, SubmitButton } from "@/components/ui";
import { getDict, type Locale } from "@/lib/i18n";

export function LoginForm({ next, locale }: { next: string; locale: Locale }) {
  const t = getDict(locale);
  const [state, action] = useActionState<ActionResult | null, FormData>(signIn, null);
  const [email, setEmail] = useState("");

  // Comparing against the state object itself, rather than a boolean, is what
  // lets "use a different email" dismiss one result without also suppressing
  // the next one: a fresh submit produces a new object that is never equal to
  // the dismissed one.
  const [dismissed, setDismissed] = useState<ActionResult | null>(null);
  const sent = Boolean(state?.ok) && state !== dismissed;

  if (sent) {
    return (
      <div className="card mt-6 p-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-gold/10 text-3xl">
          📬
        </div>

        <h2 className="mt-4 text-lg font-semibold">{t.login.sentTitle}</h2>
        <p className="mt-1 text-sm text-muted">
          <span className="ltr font-medium text-ink">{email}</span>
        </p>

        <p className="mt-4 text-sm text-muted">{t.login.sentStep}</p>

        <div className="mt-5 space-y-2 border-t border-line pt-4 text-start">
          <p className="flex gap-2 text-xs text-muted">
            <span aria-hidden>📂</span>
            <span>{t.login.sentJunk}</span>
          </p>
          <p className="flex gap-2 text-xs text-dim">
            <span aria-hidden>⏳</span>
            <span>{t.login.sentPatience}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(state)}
          className="mt-5 text-xs text-muted underline underline-offset-2 hover:text-ink"
        >
          {t.login.sentOther}
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="card mt-6 space-y-4 p-6">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          {t.login.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1.5 w-full rounded-xl border border-line bg-night px-3.5 py-2.5 text-sm outline-none transition focus:border-gold/60"
        />
      </div>

      <SubmitButton className="w-full" pendingLabel={t.login.sending}>
        {t.login.submit}
      </SubmitButton>

      {/* Only failures surface here; success replaces the whole form above. */}
      {state && !state.ok && <Notice result={state} />}
    </form>
  );
}
