import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  Brain,
  Building2,
  CheckCircle2,
  Clock3,
  Compass,
  Globe2,
  Layers3,
  LockKeyhole,
  MessageSquare,
  Radar,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

const coreSurfaces = [
  "Dashboard",
  "Agents",
  "Departments",
  "Workflows",
  "Research Intelligence",
  "Content Studio",
  "Analytics",
  "Audit",
  "Browser Operations",
  "Infrastructure",
  "Approvals",
  "Settings",
];

const capabilities = [
  { title: "Research Intelligence", text: "Trend analysis, competitor insight, and audience cognition with structured strategic outputs.", icon: Search },
  { title: "Content Intelligence", text: "Hooks, scripts, captions, metadata, and platform adaptation with governance constraints.", icon: Layers3 },
  { title: "Analytics Cognition", text: "Performance interpretation, confidence scoring, and recommendation traces.", icon: Activity },
  { title: "Operational Memory", text: "Institutional memory, reflection loops, and decision-aware retrieval.", icon: Brain },
  { title: "Governance Layer", text: "Approval queues, policy checks, rollback controls, and incident escalation.", icon: ShieldCheck },
  { title: "Browser Operations", text: "Dry-run controlled browser workflows with allowlist policy enforcement.", icon: Globe2 },
];

const timeline = [
  { time: "09:12", step: "Research trend workflow started", state: "Mock-safe execution" },
  { time: "09:20", step: "Hook and script options generated", state: "Needs approval" },
  { time: "09:27", step: "Analytics reasoning linked to memory", state: "Trace captured" },
  { time: "09:33", step: "Governance check blocked publish path", state: "Safety maintained" },
];

function SectionTitle({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] md:text-5xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">{body}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080d14]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neon text-black">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <div className="font-display text-lg font-semibold tracking-[-0.02em]">Folqen</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Autonomous Creator OS</div>
            </div>
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {["Workforce", "Workflows", "Governance", "Intelligence"].map((item) => (
              <span key={item} className="rounded-lg px-3 py-2 text-sm text-muted-foreground">
                {item}
              </span>
            ))}
          </div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-neon px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110">
            Open App
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(58%_45%_at_22%_0%,rgba(118,243,162,.16),transparent_68%),radial-gradient(48%_40%_at_82%_8%,rgba(94,203,255,.14),transparent_72%)]" />
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-16 sm:px-6 md:pt-24 lg:grid-cols-[1.06fr_0.94fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1.5">
              <span className="pulse-dot" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Preview public mode / dry-run runtime</span>
            </div>
            <h1 className="mt-6 max-w-[16ch] font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Run your AI creator organization from one governed command center.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              Folqen coordinates research, content, analytics, governance, traces, and memory like a real media operations HQ while keeping risky execution blocked by default.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <StatusBadge tone="safe">Governance active</StatusBadge>
              <StatusBadge tone="warning">Execution restricted</StatusBadge>
              <StatusBadge tone="premium">Demo-ready UX</StatusBadge>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-neon px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110">
                Enter Folqen
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/browser-operations" className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold transition hover:bg-white/[0.08]">
                Browser Ops
              </Link>
            </div>
          </div>

          <div className="panel relative overflow-hidden rounded-3xl p-6">
            <div className="absolute right-[-14%] top-[-20%] h-56 w-56 rounded-full bg-neon/[0.12] blur-3xl" />
            <div className="relative z-[1]">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon">Live command snapshot</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Active agents", value: "12" },
                  { label: "Workflows", value: "8 running" },
                  { label: "Pending approvals", value: "7" },
                  { label: "Blocked unsafe actions", value: "100%" },
                ].map((item) => (
                  <article key={item.label} className="panel-soft rounded-xl p-4">
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{item.label}</div>
                    <div className="mt-2 text-xl font-semibold">{item.value}</div>
                  </article>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-white/12 bg-white/[0.04] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <LockKeyhole className="h-4 w-4 text-neon" />
                  High automation, hard safety boundaries
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Publishing, paid providers, rendering workers, and unrestricted browser actions stay locked unless approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionTitle
          title="Every Folqen surface rebuilt for operational clarity."
          body="Futuristic, premium, and highly scannable layouts across every command-center route."
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {coreSurfaces.map((surface) => (
            <article key={surface} className="panel-soft rounded-xl p-4 text-sm">
              <div className="flex items-center gap-2 text-neon">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-semibold text-foreground">{surface}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel-soft py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle title="AI-native department intelligence" body="Folqen behaves like an autonomous organization, not a single chat interface." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {capabilities.map((capability) => (
              <article key={capability.title} className="panel rounded-2xl p-6">
                <capability.icon className="h-5 w-5 text-neon" />
                <h3 className="mt-4 text-xl font-semibold">{capability.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{capability.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr]">
          <div className="panel rounded-3xl p-6 md:p-7">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Workflow className="h-4 w-4 text-neon" />
              Autonomous workflow showcase
            </div>
            <h3 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em]">Research to Content to Analytics with governance checkpoints.</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Each phase emits traceable events, confidence scores, and approval checkpoints while preserving dry-run safety controls.
            </p>
            <div className="mt-5 space-y-2">
              {timeline.map((entry) => (
                <div key={entry.time} className="panel-soft flex items-start justify-between gap-3 rounded-xl p-3.5">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-neon">{entry.time}</div>
                    <div className="mt-1 text-sm font-semibold">{entry.step}</div>
                  </div>
                  <StatusBadge tone="neutral">{entry.state}</StatusBadge>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <article className="panel rounded-2xl p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Compass className="h-4 w-4 text-neon" />
                Operational intelligence
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Strategic memory, reflection loops, and analytics cognition improve recommendations without autonomous mutation.
              </p>
            </article>

            <article className="panel rounded-2xl p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="h-4 w-4 text-neon" />
                Conversational command center
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Users issue commands through chat, files, and media context while agents execute within policy constraints.
              </p>
            </article>

            <article className="panel rounded-2xl p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Server className="h-4 w-4 text-neon" />
                Infrastructure observability
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Queue, provider, governance, and deployment diagnostics remain visible for internal testing and investor demos.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="panel-soft py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle title="Governed by design" body="Folqen enforces operational safeguards before any risky action can run." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: ShieldCheck, text: "Approval gates for dangerous actions" },
              { icon: LockKeyhole, text: "Provider execution disabled by default" },
              { icon: Radar, text: "Trace and audit visibility everywhere" },
              { icon: Zap, text: "Rollback and kill switch readiness" },
            ].map((item) => (
              <article key={item.text} className="panel rounded-2xl p-5">
                <item.icon className="h-5 w-5 text-neon" />
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="panel rounded-2xl p-6">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h3 className="font-display text-3xl font-semibold tracking-[-0.03em]">
                <span className="title-gradient">Folqen</span> is ready for demo-quality preview operations.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                Experience the complete command center directly from dashboard routes while keeping all unsafe execution paths disabled.
              </p>
            </div>
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl bg-neon px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110">
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/10 pt-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-neon" />
              Multi-agent organization
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 text-neon" />
              Governed preview runtime
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-neon" />
              AI-native command experience
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

