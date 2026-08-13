"use client";

import { useActionState, useState } from "react";
import { logForMember, type ActionResult } from "@/app/actions";
import { Notice, SubmitButton } from "./ui";
import { getDict, type Locale } from "@/lib/i18n";
import { addDays } from "@/lib/prayer";
import { ADMIN_LOG_LOOKBACK_DAYS } from "@/lib/scoring";

/**
 * Owner-only. Records a prayer for a member who could not log it themselves.
 *
 * The owner enters *when* they prayed rather than what it was worth — the tier
 * and points are derived server-side from that member's own window, so the
 * scoring rule is identical to pressing the button at the time.
 *
 * Collapsed by default: it is a rare repair, not part of the daily loop.
 */
export function AdminLogCard({
  locale,
  groupId,
  today,
  members,
}: {
  locale: Locale;
  groupId: string;
  today: string;
  members: Array<{ id: string; name: string }>;
}) {
  const t = getDict(locale);
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<ActionResult | null, FormData>(logForMember, null);

  if (members.length === 0) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-dashed border-line px-4 py-3 text-sm text-muted transition hover:border-gold/40 hover:text-ink"
      >
        + {t.adminLog.title}
      </button>
    );
  }

  const field =
    "mt-1.5 w-full rounded-xl border border-line bg-night px-3.5 py-2.5 text-sm outline-none transition focus:border-gold/60";

  return (
    <form action={action} className="card space-y-4 p-5">
      <input type="hidden" name="group_id" value={groupId} />

      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{t.adminLog.title}</h2>
          <p className="mt-1 text-xs text-muted">{t.adminLog.help}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="shrink-0 text-xs text-muted underline underline-offset-2 hover:text-ink"
        >
          {t.groupForms.close}
        </button>
      </div>

      <div>
        <label htmlFor="admin-member" className="block text-sm font-medium">
          {t.adminLog.member}
        </label>
        <select id="admin-member" name="user_id" required className={field}>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="admin-date" className="block text-sm font-medium">
            {t.adminLog.date}
          </label>
          <input
            id="admin-date"
            name="prayer_date"
            type="date"
            required
            defaultValue={today}
            min={addDays(today, -ADMIN_LOG_LOOKBACK_DAYS)}
            max={today}
            dir="ltr"
            className={`tabular ${field}`}
          />
        </div>

        <div>
          <label htmlFor="admin-time" className="block text-sm font-medium">
            {t.adminLog.time}
          </label>
          <input
            id="admin-time"
            name="prayer_time"
            type="time"
            required
            dir="ltr"
            className={`tabular ${field}`}
          />
          <p className="mt-1 text-xs text-dim">{t.adminLog.timeHelp}</p>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-surface-2/50 px-4 py-3 text-sm hover:bg-surface-2">
        <input type="checkbox" name="in_congregation" className="size-4 accent-[var(--color-teal)]" />
        <span>{t.adminLog.congregation}</span>
        <span className="tabular ms-auto text-xs font-semibold text-teal">+2</span>
      </label>

      <SubmitButton pendingLabel={t.adminLog.submitting}>{t.adminLog.submit}</SubmitButton>

      <Notice result={state} />
    </form>
  );
}
