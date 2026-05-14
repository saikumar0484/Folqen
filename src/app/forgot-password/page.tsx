import Link from "next/link";
import { ArrowRight, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-60" />
      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 sm:px-6">
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-card backdrop-blur-xl sm:p-10">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-neon text-black shadow-glow">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">Reset Access</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            Password reset is available through your workspace admin during this beta phase. If your invite is active, your admin can issue a secure temporary password.
          </p>

          <div className="mt-7 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
            This keeps account recovery safe while we complete full self-service reset rollout for public beta.
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
              href="/join-beta"
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold transition hover:bg-white/[0.08]"
            >
              Join Beta
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

