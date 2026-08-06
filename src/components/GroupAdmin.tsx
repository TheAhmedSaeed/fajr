"use client";

import { useActionState, useState } from "react";
import { deleteGroup, leaveGroup, type ActionResult } from "@/app/actions";
import { Notice, SubmitButton } from "./ui";

export function GroupAdmin({
  groupId,
  isOwner,
  groupName,
}: {
  groupId: string;
  isOwner: boolean;
  groupName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [leaveState, leaveAction] = useActionState<ActionResult | null, FormData>(leaveGroup, null);
  const [deleteState, deleteAction] = useActionState<ActionResult | null, FormData>(
    deleteGroup,
    null,
  );

  if (!isOwner) {
    return (
      <form action={leaveAction} className="space-y-2 pt-2">
        <input type="hidden" name="group_id" value={groupId} />
        <SubmitButton variant="danger" pendingLabel="Leaving…">
          Leave group
        </SubmitButton>
        <Notice result={leaveState} />
      </form>
    );
  }

  return (
    <div className="space-y-2 pt-2">
      {confirming ? (
        <form action={deleteAction} className="card border-danger/30 space-y-3 p-4">
          <input type="hidden" name="group_id" value={groupId} />
          <p className="text-sm">
            Delete <strong>{groupName}</strong>? Every member loses the group and its history. Their
            personal streaks are unaffected.
          </p>
          <div className="flex gap-2">
            <SubmitButton variant="danger" pendingLabel="Deleting…">
              Yes, delete it
            </SubmitButton>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-xl border border-line px-4 py-2.5 text-sm text-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>
          <Notice result={deleteState} />
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-xl border border-danger/40 px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/10"
        >
          Delete group
        </button>
      )}
    </div>
  );
}
