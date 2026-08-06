"use client";

import { useActionState } from "react";
import { signIn, type ActionResult } from "@/app/actions";
import { Notice, SubmitButton } from "@/components/ui";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState<ActionResult | null, FormData>(signIn, null);

  return (
    <form action={action} className="card mt-6 space-y-4 p-6">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="mt-1.5 w-full rounded-xl border border-line bg-night px-3.5 py-2.5 text-sm outline-none transition focus:border-gold/60"
        />
      </div>

      <SubmitButton className="w-full" pendingLabel="Sending…">
        Email me a sign-in link
      </SubmitButton>

      <Notice result={state} />

      {state?.ok && (
        <p className="text-xs text-dim">
          The link expires shortly. If it doesn&rsquo;t arrive, check your spam folder.
        </p>
      )}
    </form>
  );
}
