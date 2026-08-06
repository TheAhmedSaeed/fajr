"use client";

import { useActionState, useState } from "react";
import { createGroup, joinGroup, type ActionResult } from "@/app/actions";
import { Notice, SubmitButton } from "./ui";

export function GroupForms() {
  const [tab, setTab] = useState<"create" | "join">("create");
  const [createState, createAction] = useActionState<ActionResult | null, FormData>(
    createGroup,
    null,
  );
  const [joinState, joinAction] = useActionState<ActionResult | null, FormData>(joinGroup, null);

  return (
    <section className="card p-5">
      <div className="flex gap-1 rounded-xl border border-line bg-night/60 p-1">
        {(["create", "join"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === t ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {t === "create" ? "Create a group" : "Join with a code"}
          </button>
        ))}
      </div>

      {tab === "create" ? (
        <form action={createAction} className="mt-4 space-y-3">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Group name
            </label>
            <input
              id="name"
              name="name"
              required
              maxLength={60}
              placeholder="The Dawn Club"
              className="mt-1.5 w-full rounded-xl border border-line bg-night px-3.5 py-2.5 text-sm outline-none transition focus:border-gold/60"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Description <span className="font-normal text-dim">(optional)</span>
            </label>
            <input
              id="description"
              name="description"
              maxLength={280}
              placeholder="Cousins, no excuses"
              className="mt-1.5 w-full rounded-xl border border-line bg-night px-3.5 py-2.5 text-sm outline-none transition focus:border-gold/60"
            />
          </div>
          <SubmitButton pendingLabel="Creating…">Create group</SubmitButton>
          <Notice result={createState} />
        </form>
      ) : (
        <form action={joinAction} className="mt-4 space-y-3">
          <div>
            <label htmlFor="code" className="block text-sm font-medium">
              Invite code
            </label>
            <input
              id="code"
              name="code"
              required
              maxLength={8}
              autoCapitalize="characters"
              placeholder="K7MQ2XVP"
              className="tabular mt-1.5 w-full rounded-xl border border-line bg-night px-3.5 py-2.5 text-sm uppercase tracking-[0.2em] outline-none transition focus:border-gold/60"
            />
          </div>
          <SubmitButton pendingLabel="Joining…">Join group</SubmitButton>
          <Notice result={joinState} />
        </form>
      )}
    </section>
  );
}
