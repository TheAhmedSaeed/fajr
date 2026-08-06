"use client";

import { useActionState } from "react";
import { joinGroup, type ActionResult } from "@/app/actions";
import { Notice, SubmitButton } from "@/components/ui";

export function JoinButton({ code }: { code: string }) {
  const [state, action] = useActionState<ActionResult | null, FormData>(joinGroup, null);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="code" value={code} />
      <SubmitButton className="w-full py-3" pendingLabel="Joining…">
        Join this group
      </SubmitButton>
      <Notice result={state} />
    </form>
  );
}
