import Link from "next/link";
import { ShieldCheck, Sparkles, Workflow, WandSparkles } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

const pillars = [
  {
    title: "Approval-gated automation",
    description: "The agent can research, draft, plan, and package content, while public publishing and paid actions stay blocked by default.",
    icon: ShieldCheck,
  },
  {
    title: "Creator command center",
    description: "Dashboard, pipeline, library, tools, platforms, analytics, upgrades, audit logs, and agent chat are planned as first-class areas.",
    icon: Workflow,
  },
  {
    title: "Future-proof providers",
    description: "AI, rendering, workflow, storage, publishing, and analytics tools will use replaceable provider adapters.",
    icon: WandSparkles,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-8 text-slate-50">
      <section className="mx-auto flex max-w-6xl flex-col gap-10 py-10">
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="premium">Folqen MVP Foundation</StatusBadge>
          <StatusBadge tone="safe">Public publishing disabled</StatusBadge>
          <StatusBadge tone="warning">Integrations not connected</StatusBadge>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              AI Creator Command Center
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
              Build urban legends content with a secure AI agent.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Folqen is being built as a premium, approval-gated, modular platform for planning, creating, reviewing, and preparing folklore and mystery content across social platforms.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard" className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:bg-slate-200">
                Open dashboard
              </Link>
              <Link href="/agent" className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                Talk to agent
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">System mode</p>
              <h2 className="mt-3 text-2xl font-semibold">High Automation</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Safe defaults are active: human approval required, paid tools disabled, browser automation disabled, public publishing disabled, and uploads private by default.
              </p>
              <div className="mt-6 grid gap-3 text-sm">
                {['Research topics', 'Draft scripts', 'Prepare posting packages', 'Create upgrade proposals'].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <article key={pillar.title} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                <Icon className="h-6 w-6 text-cyan-200" />
                <h3 className="mt-4 text-lg font-semibold">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{pillar.description}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
