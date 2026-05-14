"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";

import { mutationFetch } from "@/lib/client/mutation-fetch";

export function ResetPasswordForm({ token, expired }: { token?: string; expired?: boolean }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(expired ? "This reset link has expired. Request a fresh one to continue." : null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setError("This reset link is invalid. Request a new one to continue.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match yet. Please re-check and try again.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await mutationFetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string; message?: string };

    setLoading(false);
    if (!response.ok) {
      setError(body.error ?? "That reset link is no longer active. Request a new one.");
      return;
    }

    setMessage(body.message ?? "Your password was updated. You can sign in now.");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-card backdrop-blur-xl">
      <h2 className="font-display text-2xl font-semibold">Choose a new password</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Create a fresh password and return to your creator workspace.</p>

      <label className="mt-6 block text-sm font-medium" htmlFor="newPassword">
        New password
      </label>
      <input
        id="newPassword"
        type="password"
        minLength={12}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm outline-none ring-neon/30 transition focus:ring-2"
        autoComplete="new-password"
        required
        disabled={!token || expired}
      />

      <label className="mt-4 block text-sm font-medium" htmlFor="confirmPassword">
        Confirm password
      </label>
      <input
        id="confirmPassword"
        type="password"
        minLength={12}
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm outline-none ring-neon/30 transition focus:ring-2"
        autoComplete="new-password"
        required
        disabled={!token || expired}
      />

      {error ? (
        <div role="alert" className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      {message ? <div className="mt-4 rounded-2xl border border-neon/20 bg-neon/10 px-4 py-3 text-sm text-neon">{message}</div> : null}

      <button
        type="submit"
        disabled={loading || !token || !!expired}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-neon px-5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Updating password..." : "Save new password"}
      </button>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Need a new link?{" "}
        <Link href="/forgot-password" className="text-neon hover:brightness-110">
          Request reset instructions
        </Link>
      </p>
    </form>
  );
}
