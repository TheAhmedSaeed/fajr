"use client";

import { useState } from "react";
import { getDict, type Locale } from "@/lib/i18n";

export function InviteBox({ code, url, locale }: { code: string; url: string; locale: Locale }) {
  const t = getDict(locale);
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
      <h2 className="text-sm font-semibold">{t.group.inviteTitle}</h2>
      <p className="mt-1 text-xs text-muted">{t.group.inviteHelp}</p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <code className="tabular flex-1 truncate rounded-xl border border-line bg-night px-3.5 py-2.5 text-sm text-muted">
          {url}
        </code>
        <button
          type="button"
          onClick={() => copy(url, "link")}
          className="rounded-xl bg-gradient-to-r from-gold to-rose px-4 py-2.5 text-sm font-semibold text-night transition hover:brightness-110"
        >
          {copied === "link" ? t.group.copied : t.group.copyLink}
        </button>
      </div>

      <button
        type="button"
        onClick={() => copy(code, "code")}
        className="mt-3 flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-night/60 px-3.5 py-2.5 text-start transition hover:bg-surface-2"
      >
        <span className="text-xs text-dim">{t.group.orCode}</span>
        <span className="tabular text-sm font-semibold tracking-[0.25em]">
          {copied === "code" ? t.group.copied : code}
        </span>
      </button>
    </section>
  );
}
