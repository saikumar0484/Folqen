"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { mutationFetch } from "@/lib/client/mutation-fetch";

export function JoinBetaForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await mutationFetch("/api/auth/request-beta-access", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, focus }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
    setLoading(false);

    if (!response.ok) {
      setError(body.error ?? "We couldn't submit your beta request right now. Please try again.");
      return;
    }

    setMessage(body.message ?? "Thanks. Your request is in and we'll follow up with invite details.");
    setName("");
    setEmail("");
    setFocus("");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-card backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neon text-primary-foreground shadow-glow">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-2xl font-semibold">Join the creator beta</h2>
          <p className="text-sm text-muted-foreground">Tell us what you are building and we will prepare your invite</p>
        </div>
      </div>

      <label className="mt-6 block text-sm font-medium" htmlFor="name">
        Name
      </label>
      <input
        id="name"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm outline-none ring-neon/30 transition focus:ring-2"
        required
      />

      <label className="mt-4 block text-sm font-medium" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm outline-none ring-neon/30 transition focus:ring-2"
        required
      />

      <label className="mt-4 block text-sm font-medium" htmlFor="focus">
        Creator focus
      </label>
      <input
        id="focus"
        type="text"
        value={focus}
        onChange={(event) => setFocus(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm outline-none ring-neon/30 transition focus:ring-2"
        placeholder="Horror shorts, mystery explainers, folklore stories..."
        required
      />

      {error ? (
        <div role="alert" className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      {message ? <div className="mt-4 rounded-2xl border border-neon/20 bg-neon/10 px-4 py-3 text-sm text-neon">{message}</div> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-neon px-5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Sending request..." : "Request beta access"}
      </button>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Already invited?{" "}
        <Link href="/login" className="text-neon hover:brightness-110">
          Sign in
        </Link>
      </p>
    </form>
  );
}
