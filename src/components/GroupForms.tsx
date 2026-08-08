"use client";

import { useActionState, useState } from "react";
import { createGroup, joinGroup, type ActionResult } from "@/app/actions";
import { Notice, SubmitButton } from "./ui";
import { getDict, type Locale } from "@/lib/i18n";

export function GroupForms({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const [tab, setTab] = useState<"create" | "join">("create");
  const [createState, createAction] = useActionState<ActionResult | null, FormData>(createGroup, null);
  const [joinState, joinAction] = useActionState<ActionResult | null, FormData>(joinGroup, null);

  return (
    <section className="card p-5">
      <div className="flex gap-1 rounded-xl border border-line bg-night/60 p-1">
        {(["create", "join"] as const).map((tab_) => (
          <button
            key={tab_}
            type="button"
            onClick={() => setTab(tab_)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === tab_ ? "bg-surface-2 text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {tab_ === "create" ? t.groupForms.createTab : t.groupForms.joinTab}
          </button>
        ))}
      </div>

      {tab === "create" ? (
        <form action={createAction} className="mt-4 space-y-3">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              {t.groupForms.nameLabel}
            </label>
            <input
              id="name"
              name="name"
              required
              maxLength={60}
              placeholder={t.groupForms.namePlaceholder}
              className="mt-1.5 w-full rounded-xl border border-line bg-night px-3.5 py-2.5 text-sm outline-none transition focus:border-gold/60"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              {t.groupForms.descLabel}{" "}
              <span className="font-normal text-dim">{t.groupForms.descOptional}</span>
            </label>
            <input
              id="description"
              name="description"
              maxLength={280}
              placeholder={t.groupForms.descPlaceholder}
              className="mt-1.5 w-full rounded-xl border border-line bg-night px-3.5 py-2.5 text-sm outline-none transition focus:border-gold/60"
            />
          </div>
          <SubmitButton pendingLabel={t.groupForms.creating}>{t.groupForms.create}</SubmitButton>
          <Notice result={createState} />
        </form>
      ) : (
        <form action={joinAction} className="mt-4 space-y-3">
          <div>
            <label htmlFor="code" className="block text-sm font-medium">
              {t.groupForms.codeLabel}
            </label>
            <input
              id="code"
              name="code"
              required
              maxLength={8}
              dir="ltr"
              autoCapitalize="characters"
              placeholder="K7MQ2XVP"
              className="tabular mt-1.5 w-full rounded-xl border border-line bg-night px-3.5 py-2.5 text-sm uppercase tracking-[0.2em] outline-none transition focus:border-gold/60"
            />
          </div>
          <SubmitButton pendingLabel={t.groupForms.joining}>{t.groupForms.join}</SubmitButton>
          <Notice result={joinState} />
        </form>
      )}
    </section>
  );
}
