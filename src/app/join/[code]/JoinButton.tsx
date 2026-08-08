"use client";

import { useActionState } from "react";
import { joinGroup, type ActionResult } from "@/app/actions";
import { Notice, SubmitButton } from "@/components/ui";
import { getDict, type Locale } from "@/lib/i18n";

export function JoinButton({ code, locale }: { code: string; locale: Locale }) {
  const t = getDict(locale);
  const [state, action] = useActionState<ActionResult | null, FormData>(joinGroup, null);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="code" value={code} />
      <SubmitButton className="w-full py-3" pendingLabel={t.groupForms.joining}>
        {t.join.joinNow}
      </SubmitButton>
      <Notice result={state} />
    </form>
  );
}
