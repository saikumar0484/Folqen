"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";

import { mutationFetch } from "@/lib/client/mutation-fetch";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [previewLink, setPreviewLink] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setPreviewLink(null);

    const response = await mutationFetch("/api/auth/request-reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string; message?: string; previewLink?: string };

    setLoading(false);
    if (!response.ok) {
      setError(body.error ?? "We couldn't process your request right now. Please try again.");
      return;
    }

    setMessage(body.message ?? "If that email is in Folqen, reset instructions are on the way.");
    setPreviewLink(body.previewLink ?? null);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-card backdrop-blur-xl">
      <h2 className="font-display text-2xl font-semibold">Reset your password</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Enter your email and we will help you get back into your creator workspace.</p>

      <label className="mt-6 block text-sm font-medium" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm outline-none ring-neon/30 transition focus:ring-2"
        autoComplete="email"
        required
      />

      {error ? (
        <div role="alert" className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      {message ? <div className="mt-4 rounded-2xl border border-neon/20 bg-neon/10 px-4 py-3 text-sm text-neon">{message}</div> : null}
      {previewLink ? (
        <div className="mt-3 rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3 text-xs text-muted-foreground">
          Local preview link:{" "}
          <Link className="text-neon hover:brightness-110" href={previewLink}>
            continue to reset
          </Link>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-neon px-5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Sending..." : "Send reset instructions"}
      </button>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="text-neon hover:brightness-110">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
