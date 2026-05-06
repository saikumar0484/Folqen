"use client";

import { useState, useTransition } from "react";
import { KeyRound } from "lucide-react";

export function PasswordChangeForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="rounded-3xl border border-white/10 bg-white/[0.03] p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        setError(null);
        setMessage(null);

        startTransition(async () => {
          const response = await fetch("/api/auth/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              currentPassword: data.get("currentPassword"),
              newPassword: data.get("newPassword"),
            }),
          });
          const body = (await response.json().catch(() => ({}))) as { error?: string };

          if (!response.ok) {
            setError(body.error ?? "Password update failed.");
            return;
          }

          form.reset();
          setMessage("Password changed. Use the new password next time you login.");
        });
      }}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon/10 text-neon">
          <KeyRound className="h-4 w-4" />
        </span>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Security</div>
          <h2 className="mt-1 font-display text-xl font-semibold">Change admin password</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Replace the seeded first-run password. This action is written to the audit log.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Current password</span>
          <input
            name="currentPassword"
            type="password"
            required
            minLength={8}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-neon/40"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">New password</span>
          <input
            name="newPassword"
            type="password"
            required
            minLength={12}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-neon/40"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={isPending} className="rounded-xl bg-neon px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-60">
          {isPending ? "Saving..." : "Change password"}
        </button>
        {message ? <span className="text-sm text-neon">{message}</span> : null}
        {error ? <span className="text-sm text-rose-200">{error}</span> : null}
      </div>
    </form>
  );
}
