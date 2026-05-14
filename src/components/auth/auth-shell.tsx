import type { ReactNode } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-70" />
      <div
        className="pointer-events-none fixed left-1/2 top-[-200px] h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background: "radial-gradient(ellipse at center, color-mix(in oklab, var(--neon) 20%, transparent), transparent 70%)",
        }}
      />

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-6 lg:grid-cols-[1fr_430px]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-neon/20 bg-neon/[0.08] px-3 py-1.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-neon text-black">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-base font-semibold">Folqen</span>
          </Link>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </div>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-none sm:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
        </div>

        {children}
      </section>
    </main>
  );
}
