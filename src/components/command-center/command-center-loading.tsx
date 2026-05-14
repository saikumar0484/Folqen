import { Loader2, Sparkles } from "lucide-react";

export function CommandCenterLoading() {
  return (
    <div className="section-space pb-24">
      <section className="panel relative overflow-hidden rounded-3xl p-8">
        <div className="absolute inset-0 bg-[radial-gradient(58%_60%_at_84%_0%,rgba(118,243,162,.16),transparent_75%)]" />
        <div className="relative z-[1]">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neon/35 bg-neon/10 text-neon">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Booting operational view</span>
            <span className="app-loader">
              <Loader2 className="h-4 w-4 text-neon" />
            </span>
          </div>
          <div className="mt-6 h-12 max-w-[760px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.05]" />
          <div className="mt-3 h-5 max-w-[620px] animate-pulse rounded-xl bg-white/[0.05]" />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={index} className="panel-soft rounded-2xl p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-white/[0.08]" />
            <div className="mt-4 h-9 w-20 animate-pulse rounded bg-white/[0.08]" />
            <div className="mt-4 h-2 animate-pulse rounded-full bg-white/[0.08]" />
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="panel rounded-2xl p-5">
          <div className="h-4 w-52 animate-pulse rounded bg-white/[0.08]" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
            ))}
          </div>
        </article>
        <article className="panel rounded-2xl p-5">
          <div className="h-4 w-44 animate-pulse rounded bg-white/[0.08]" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]" />
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

