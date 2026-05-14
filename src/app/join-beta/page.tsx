import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function JoinBetaPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-60" />
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 sm:px-6">
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-card backdrop-blur-xl sm:p-10">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-neon text-black shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Join Folqen Beta</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            Folqen is currently invite-only. We’re onboarding creators in focused cohorts so every workspace launches with guided setup and stable workflow support.
          </p>

          <div className="mt-7 space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
            <p>To get access, share your creator niche and use case with your Folqen admin.</p>
            <p>Once approved, you’ll receive your login details and can open your workspace immediately.</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-neon px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Back to Login
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold transition hover:bg-white/[0.08]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

