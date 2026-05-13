"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { mutationFetch } from "@/lib/client/mutation-fetch";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      setError(body.error ?? "Login failed.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-70" />
      <div
        className="pointer-events-none fixed left-1/2 top-[-200px] h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background: "radial-gradient(ellipse at center, color-mix(in oklab, var(--neon) 20%, transparent), transparent 70%)",
        }}
      />

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-10 lg:grid-cols-[1fr_430px]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-neon/20 bg-neon/[0.08] px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-neon">
            <ShieldCheck className="h-4 w-4" />
            Approval gates stay active
          </div>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-none sm:text-6xl">
            Enter the Folqen command center.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Login unlocks the private creator workspace. Public publishing, paid tools, browser automation, and upgrades remain blocked until explicit human approval.
          </p>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {["Public publishing disabled", "Paid tools disabled", "Human approval required"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                <LockKeyhole className="mb-3 h-4 w-4 text-neon" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-card backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neon text-primary-foreground shadow-glow">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-semibold">Folqen Login</h2>
              <p className="text-sm text-muted-foreground">Admin access for the MVP workspace</p>
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
            placeholder="ChangeMe123! after seed"
          />

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-neon px-5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <KeyRound className="h-4 w-4" />
            {loading ? "Checking access..." : "Login"}
          </button>

          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Production login requires `DATABASE_URL`, `AUTH_SECRET`, and `npm run db:seed`. Safe Vercel previews may use demo auth only when dry-run mode is forced and execution flags stay disabled.
          </p>
        </form>
      </section>
    </main>
  );
}
