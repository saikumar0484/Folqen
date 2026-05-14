"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Sparkles } from "lucide-react";

import { mutationFetch } from "@/lib/client/mutation-fetch";

function mapLoginError(message: string | undefined) {
  if (!message) return "We couldn't sign you in right now. Please try again.";
  if (message.toLowerCase().includes("invalid email or password")) return "That email or password doesn't match. Please try again.";
  if (message.toLowerCase().includes("disabled")) return "This invite is currently paused. Please contact your workspace admin.";
  if (message.toLowerCase().includes("too many requests")) return "Too many attempts for now. Please wait a moment and try again.";
  return "Sign-in is temporarily unavailable. Please try again in a moment.";
}

function safeNextPath(nextPath?: string) {
  if (!nextPath) return "/dashboard";
  if (nextPath.startsWith("/") && !nextPath.startsWith("//")) return nextPath;
  return "/dashboard";
}

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const destination = useMemo(() => safeNextPath(nextPath), [nextPath]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const response = await mutationFetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };

    setLoading(false);

    if (!response.ok) {
      setError(mapLoginError(body.error));
      return;
    }

    router.push(destination);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-card backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neon text-primary-foreground shadow-glow">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-2xl font-semibold">Welcome back</h2>
          <p className="text-sm text-muted-foreground">Sign in to your creator workspace</p>
        </div>
      </div>

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

      <label className="mt-4 block text-sm font-medium" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm outline-none ring-neon/30 transition focus:ring-2"
        autoComplete="current-password"
        placeholder="Enter your password"
        required
      />

      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        <Link href="/forgot-password" className="text-muted-foreground transition hover:text-foreground">
          Forgot password?
        </Link>
        <Link href="/join-beta" className="text-neon transition hover:brightness-110">
          Need beta access?
        </Link>
      </div>

      {error ? (
        <div role="alert" className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-neon px-5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        {loading ? "Signing you in..." : "Open workspace"}
      </button>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">Invite-only beta. Your workspace invite includes your sign-in details.</p>
    </form>
  );
}
