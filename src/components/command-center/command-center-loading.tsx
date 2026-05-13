import { Activity, BrainCircuit, Gauge, Radar, Sparkles, Workflow } from "lucide-react";

const cards = [
  { id: "agents", label: "Agents online", value: "12", icon: BrainCircuit },
  { id: "workflows", label: "Workflow lanes", value: "8", icon: Workflow },
  { id: "signals", label: "Signal streams", value: "24", icon: Radar },
  { id: "health", label: "Runtime health", value: "Stable", icon: Gauge },
];

export function CommandCenterLoading() {
  return (
    <div className="space-y-5 pb-24">
      <section className="command-panel relative overflow-hidden rounded-3xl p-6 md:p-7">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon/70 to-transparent" />
        <div className="absolute right-[-12%] top-[-22%] h-80 w-80 rounded-full bg-neon/10 blur-3xl" />
        <div className="relative z-[1] flex flex-wrap items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-neon/25 bg-neon/10 text-neon shadow-glow">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="inline-flex h-6 animate-pulse rounded-full border border-neon/25 bg-neon/10 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-neon">
            preparing command center
          </span>
        </div>
        <div className="mt-5 h-11 w-full max-w-[720px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.05]" />
        <div className="mt-3 h-5 w-full max-w-[640px] animate-pulse rounded-xl bg-white/[0.05]" />
        <div className="mt-2 h-5 w-full max-w-[520px] animate-pulse rounded-xl bg-white/[0.04]" />
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.id} className="command-panel rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{card.label}</span>
              <card.icon className="h-4 w-4 text-neon/80" />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Activity className="h-4 w-4 animate-pulse text-neon" />
              <span className="font-display text-3xl font-semibold tracking-[-0.02em] text-foreground">{card.value}</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-neon/70" />
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="command-panel rounded-2xl p-5">
          <div className="h-4 w-52 animate-pulse rounded-lg bg-white/[0.08]" />
          <div className="mt-4 space-y-2">
            <div className="h-12 animate-pulse rounded-xl border border-white/10 bg-white/[0.035]" />
            <div className="h-12 animate-pulse rounded-xl border border-white/10 bg-white/[0.035]" />
            <div className="h-12 animate-pulse rounded-xl border border-white/10 bg-white/[0.035]" />
          </div>
        </div>
        <div className="command-panel rounded-2xl p-5">
          <div className="h-4 w-40 animate-pulse rounded-lg bg-white/[0.08]" />
          <div className="mt-4 space-y-3">
            <div className="h-16 animate-pulse rounded-xl border border-white/10 bg-white/[0.035]" />
            <div className="h-16 animate-pulse rounded-xl border border-white/10 bg-white/[0.035]" />
          </div>
        </div>
      </section>
    </div>
  );
}

