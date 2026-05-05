import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock3,
  FileText,
  FolderKanban,
  Inbox,
  LayoutGrid,
  LockKeyhole,
  Play,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Workflow,
  Zap,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

const sidebar = [
  { icon: LayoutGrid, label: "Dashboard", active: true },
  { icon: Bot, label: "Agent" },
  { icon: FolderKanban, label: "Pipeline" },
  { icon: FileText, label: "Library" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Settings, label: "Settings" },
];

const tiles = [
  { icon: Workflow, title: "3 active jobs", hint: "Scripts, thumbnails, metadata" },
  { icon: Inbox, title: "7 drafts ready", hint: "Waiting for review" },
  { icon: ShieldCheck, title: "4 approvals", hint: "Publishing remains blocked" },
  { icon: WandSparkles, title: "2 upgrades", hint: "Research proposals only" },
];

const pillars = [
  {
    title: "Approval-gated automation",
    description: "Research, draft, storyboard, package, and review content while publishing and paid actions stay locked.",
    icon: ShieldCheck,
  },
  {
    title: "Creator command center",
    description: "Dashboard, agent chat, pipeline, library, tools, platforms, analytics, upgrades, audit logs, and files.",
    icon: Workflow,
  },
  {
    title: "Future-proof providers",
    description: "Replaceable adapters for AI, workflow, rendering, storage, publishing, analytics, voice, and video tools.",
    icon: WandSparkles,
  },
];

function DashboardPreview() {
  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-20" id="workspace">
      <div
        className="pointer-events-none absolute -inset-12 -z-10 animate-glow opacity-70"
        style={{ background: "radial-gradient(50% 50% at 50% 50%, color-mix(in oklab, var(--neon) 22%, transparent), transparent 70%)" }}
      />
      <div className="glass-strong overflow-hidden rounded-2xl shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-neon/70" />
          </div>
          <div className="ml-3 flex max-w-sm flex-1 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Search content, approvals, tools, analytics...</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="font-mono text-[10px] tracking-wider text-muted-foreground">FOLQEN v0.1</span>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
          </div>
        </div>

        <div className="grid grid-cols-12">
          <aside className="col-span-3 hidden border-r border-white/10 p-3 sm:block">
            <div className="px-2 pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Command Center</div>
            <nav className="flex flex-col gap-0.5">
              {sidebar.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition ${
                      item.active
                        ? "bg-neon/10 text-foreground ring-1 ring-neon/30"
                        : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="mt-4 rounded-lg border border-dashed border-white/10 p-3">
              <div className="text-[11px] text-muted-foreground">Automation is safe</div>
              <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-neon">
                <LockKeyhole className="h-3 w-3" /> Approval gates active
              </div>
            </div>
          </aside>

          <section className="col-span-12 p-4 sm:col-span-9 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Overview</div>
                <h3 className="mt-1 font-display text-base font-semibold text-foreground sm:text-lg">Urban legends content system</h3>
              </div>
              <button className="hidden items-center gap-1.5 rounded-lg bg-neon px-3 py-1.5 text-xs font-medium text-primary-foreground sm:inline-flex">
                <Plus className="h-3.5 w-3.5" /> Create package
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {tiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <div key={tile.title} className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon/10 text-neon">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="text-sm font-medium text-foreground">{tile.title}</div>
                        <div className="text-xs text-muted-foreground">{tile.hint}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 grid grid-cols-12 gap-2.5">
              <div className="col-span-12 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:col-span-7">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-neon" />
                    <span className="text-xs font-medium text-foreground">Quick commands</span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">⌘ K</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {["Create content package", "Review latest draft", "Show tool limits", "Pause automation"].map((item) => (
                    <button key={item} className="rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-left text-[11px] text-muted-foreground transition hover:bg-white/[0.04] hover:text-foreground">
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative col-span-12 overflow-hidden rounded-xl border border-neon/25 bg-gradient-to-br from-neon/[0.08] to-transparent p-4 sm:col-span-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-neon" />
                  <span className="text-xs font-medium text-foreground">Mini Agent</span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  I can research folklore topics, draft scripts, build posting packages, and explain why risky actions are blocked.
                </p>
                <button className="mt-3 inline-flex items-center gap-1 rounded-md border border-neon/30 bg-neon/15 px-2.5 py-1 text-[11px] font-medium text-neon">
                  Ask Folqen
                </button>
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-neon/20 blur-2xl" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground antialiased">
      <section className="relative overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-0 -z-10" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 animate-glow rounded-full"
          style={{ background: "radial-gradient(ellipse at center, color-mix(in oklab, var(--neon) 20%, transparent), transparent 70%)" }}
        />

        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon text-primary-foreground shadow-glow">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">Folqen</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#workspace" className="hover:text-foreground">Preview</a>
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#safety" className="hover:text-foreground">Safety</a>
          </nav>
          <Link href="/dashboard" className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium transition hover:bg-white/[0.06]">
            Open app
          </Link>
        </header>

        <div className="mx-auto max-w-6xl px-4 pb-12 pt-14 text-center md:pb-20 md:pt-20">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-neon" />
            </span>
            <span className="font-mono uppercase tracking-widest text-muted-foreground">AI creator command center for mystery content</span>
          </div>

          <h1 className="mx-auto mt-6 max-w-5xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-7xl">
            <span className="text-foreground">Plan, create, review,</span>
            <br className="hidden sm:block" />
            <span className="text-foreground"> and package legends with </span>
            <span className="text-gradient-neon">one safe AI agent</span>
            <span className="text-neon">.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Folqen controls a professional content agent for urban legends, folklore, mystery stories, scripts, thumbnails, metadata, approvals, and platform-ready posting packages.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <StatusBadge tone="premium">High automation</StatusBadge>
            <StatusBadge tone="safe">Approval gates active</StatusBadge>
            <StatusBadge tone="warning">Live integrations not connected</StatusBadge>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/dashboard" className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neon px-5 py-3 text-sm font-medium text-primary-foreground shadow-glow transition hover:brightness-110 sm:w-auto">
              Start building dashboard
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link href="/agent" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-foreground transition hover:bg-white/[0.06] sm:w-auto">
              <Play className="h-4 w-4 text-neon" />
              Talk to agent
            </Link>
          </div>
        </div>

        <DashboardPreview />
      </section>

      <section id="features" className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 md:grid-cols-3">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <article key={pillar.title} className="glass rounded-3xl p-5 transition hover:bg-white/[0.05]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neon/10 text-neon">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{pillar.description}</p>
            </article>
          );
        })}
      </section>

      <section id="safety" className="mx-auto max-w-6xl px-4 pb-24">
        <div className="neon-border relative overflow-hidden rounded-4xl bg-gradient-to-br from-neon/[0.08] to-white/[0.02] p-6 md:p-8">
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-neon">Safety First</div>
              <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">Automation without reckless publishing.</h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Folqen can prepare work automatically, but public posts, paid tools, credentials, account connections, security changes, and real upgrades stay behind approval gates.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["Public publishing disabled", "Paid tools disabled", "Browser automation disabled", "Human approval required"].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <CheckCircle2 className="h-4 w-4 text-neon" />
                  <div className="mt-3 text-sm font-medium">{item}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-neon/20 blur-3xl" />
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
        Folqen MVP foundation · Neon cyber UI template applied · Safe defaults enabled
      </footer>
    </main>
  );
}
