"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  className = "",
  disabled,
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary:
      "bg-gradient-to-r from-gold to-rose text-night hover:brightness-110 shadow-lg shadow-gold/10",
    ghost: "border border-line bg-surface-2/60 text-ink hover:bg-surface-2",
    danger: "border border-danger/40 text-danger hover:bg-danger/10",
  }[variant];

  return (
    <button type="submit" disabled={pending || disabled} className={`${base} ${styles} ${className}`}>
      {pending && (
        <span
          aria-hidden
          className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {pending ? (pendingLabel ?? "Working…") : children}
    </button>
  );
}

export function Notice({ result }: { result: { ok: boolean; message?: string; error?: string } | null }) {
  if (!result) return null;
  const text = result.ok ? result.message : result.error;
  if (!text) return null;

  return (
    <p
      role="status"
      className={`rounded-lg border px-3 py-2 text-sm ${
        result.ok
          ? "border-teal/30 bg-teal/10 text-teal"
          : "border-danger/30 bg-danger/10 text-danger"
      }`}
    >
      {text}
    </p>
  );
}

export function Progress({ value, className = "" }: { value: number; className?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-line ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-gold to-rose transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
