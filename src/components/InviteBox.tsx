"use client";

import { useState } from "react";

export function InviteBox({ code, url }: { code: string; url: string }) {
  const [copied, setCopied] = useState<"link" | "code" | null>(null);

  async function copy(value: string, which: "link" | "code") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // Clipboard can be blocked (insecure context, permissions). The code is
      // shown in full below, so there is always a manual fallback.
    }
  }

  return (
    <section className="card p-5">
      <h2 className="text-sm font-semibold">Invite people</h2>
      <p className="mt-1 text-xs text-muted">
        Anyone with this link can join. Share it in the family group chat.
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <code className="tabular flex-1 truncate rounded-xl border border-line bg-night px-3.5 py-2.5 text-sm text-muted">
          {url}
        </code>
        <button
          type="button"
          onClick={() => copy(url, "link")}
          className="rounded-xl bg-gradient-to-r from-gold to-rose px-4 py-2.5 text-sm font-semibold text-night transition hover:brightness-110"
        >
          {copied === "link" ? "Copied ✓" : "Copy link"}
        </button>
      </div>

      <button
        type="button"
        onClick={() => copy(code, "code")}
        className="mt-3 flex w-full items-center justify-between rounded-xl border border-line bg-night/60 px-3.5 py-2.5 text-left transition hover:bg-surface-2"
      >
        <span className="text-xs text-dim">Or share the code</span>
        <span className="tabular text-sm font-semibold tracking-[0.25em]">
          {copied === "code" ? "Copied ✓" : code}
        </span>
      </button>
    </section>
  );
}
