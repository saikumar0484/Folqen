import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  CheckCircle2,
  ClipboardList,
  Database,
  FileText,
  FolderKanban,
  ImageIcon,
  Inbox,
  LayoutGrid,
  LockKeyhole,
  Megaphone,
  Minus,
  Palette,
  Play,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WandSparkles,
  Workflow,
  Zap,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

const previewSidebar = [
  { icon: LayoutGrid, label: "Dashboard", active: true },
  { icon: Bot, label: "Agent" },
  { icon: FolderKanban, label: "Pipeline" },
  { icon: FileText, label: "Library" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Settings, label: "Settings" },
];

const previewTiles = [
  { icon: Workflow, title: "3 active jobs", hint: "Scripts, thumbnails, metadata" },
  { icon: Inbox, title: "7 drafts ready", hint: "Waiting for review" },
  { icon: ShieldCheck, title: "4 approvals", hint: "Publishing remains blocked" },
  { icon: WandSparkles, title: "2 upgrades", hint: "Research proposals only" },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Approval-gated automation",
    desc: "Research, draft, storyboard, package, and review content while publishing and paid actions stay locked.",
  },
  {
    icon: Bot,
    title: "Creator agent control",
    desc: "Talk to one agent for scripts, hooks, metadata, thumbnails, posting packages, and safe task status.",
  },
  {
    icon: Workflow,
    title: "Pipeline visibility",
    desc: "Track content jobs from idea to research, draft, review, render, package, and analytics handoff.",
  },
  {
    icon: Megaphone,
    title: "Platform honesty",
    desc: "YouTube, Instagram, Facebook, Snapchat, Threads, and secondary platforms stay Not connected until configured.",
  },
  {
    icon: Database,
    title: "Future database core",
    desc: "Prisma models are planned for content, assets, approvals, events, providers, analytics, and upgrades.",
  },
  {
    icon: WandSparkles,
    title: "Upgrade proposals",
    desc: "The self-improvement agent may research better tools, but every real upgrade requires approval.",
  },
];

const steps = [
  { n: "01", title: "Create a content package", desc: "Start with a folklore topic, target platform, tone, and safety constraints." },
  { n: "02", title: "Let the agent prepare drafts", desc: "Research, script, storyboard, prompt, caption, and metadata work stays in draft mode." },
  { n: "03", title: "Approve only important actions", desc: "Public posting, paid tools, credentials, risky topics, and upgrades stop for human review." },
];

const emptyStates = [
  { icon: FolderKanban, title: "No live jobs yet", hint: "Create a package when the workflow layer is ready." },
  { icon: Plus, title: "Add your first topic", hint: "Start with a mystery, legend, location, or folklore category." },
  { icon: FileText, title: "No scripts generated", hint: "Drafts appear here after the agent service is wired." },
  { icon: ImageIcon, title: "No assets rendered", hint: "ComfyUI and FFmpeg remain Not connected." },
  { icon: Database, title: "No connected sources", hint: "Credentials are added later through a safe secret flow." },
  { icon: Inbox, title: "No approvals decided", hint: "Important actions wait here before anything goes public." },
];

const useCases = [
  { icon: ClipboardList, title: "Shorts planning", desc: "Prepare hooks, scripts, captions, thumbnails, and platform instructions for short videos." },
  { icon: BookOpen, title: "Mystery research", desc: "Collect folklore sources and keep claims careful instead of presenting rumors as facts." },
  { icon: FolderKanban, title: "Content operations", desc: "Organize content, files, approvals, errors, workflows, and posting packages in one place." },
  { icon: BarChart3, title: "Performance review", desc: "Use mock analytics now, then connect real platform analytics only when configured." },
  { icon: Workflow, title: "Local automation", desc: "Prefer self-hosted n8n, local FFmpeg, and local/free tools before paid services." },
  { icon: Sparkles, title: "System improvement", desc: "Review cost, risk, benefit, testing, and rollback plans before any upgrade executes." },
];

const buildReady = [
  { icon: Palette, title: "Template-matched theme", desc: "Dark cyber UI, neon green accents, glass panels, grid texture, and soft glow effects." },
  { icon: LayoutGrid, title: "Reusable shell", desc: "Sidebar, topbar, route cards, command palette, notifications, and mini agent chat are shared." },
  { icon: Smartphone, title: "Responsive foundation", desc: "Sections use compact grids and stable spacing for desktop and mobile continuation." },
  { icon: LockKeyhole, title: "Safety-first handoff", desc: "README and checkpoint docs explain exactly what is mock, blocked, or next." },
];

const faqs = [
  {
    q: "Is Folqen live yet?",
    a: "No. The current app is a verified foundation with mock pages and Not connected integration states.",
  },
  {
    q: "Can the agent publish automatically?",
    a: "No. Public publishing is blocked by default and requires approval, safety review, copyright clearance, and editorial review.",
  },
  {
    q: "Why use this template style?",
    a: "It gives Folqen a clear dark command-center look: neon green accents, glass panels, grid background, and clean product sections.",
  },
  {
    q: "What can another Codex account do next?",
    a: "Read README and checkpoint docs, run verification, then continue Phase 2 route-specific UI before Phase 3 authentication.",
  },
];

const footerSections = [
  { title: "Product", links: ["Dashboard", "Agent", "Pipeline", "Library"] },
  { title: "Control", links: ["Approvals", "Settings", "Audit", "Errors"] },
  { title: "Build", links: ["README", "Checkpoints", "Risk log", "Handoff"] },
];

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <div className="font-mono text-[11px] uppercase tracking-widest text-neon">{eyebrow}</div>
        <h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-5xl">{title}</h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon text-primary-foreground shadow-glow">
        <Sparkles className="h-4 w-4" />
      </span>
      <span className="font-display text-xl font-semibold">Folqen</span>
    </Link>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto mt-4 max-w-6xl px-4">
        <div className="glass-strong flex items-center justify-between rounded-2xl px-4 py-2.5 md:px-5">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {[
              ["Home", "#home"],
              ["Features", "#features"],
              ["How It Works", "#how"],
              ["Workspace", "#workspace"],
              ["FAQ", "#faq"],
            ].map(([label, href]) => (
              <a key={label} href={href} className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/agent" className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-flex">
              Agent
            </Link>
            <Link href="/dashboard" className="rounded-lg bg-neon px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition hover:brightness-110">
              Open App
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

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
            <span className="font-mono text-[10px] tracking-wider text-muted-foreground">FOLQEN v0.2</span>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
          </div>
        </div>

        <div className="grid grid-cols-12">
          <aside className="col-span-3 hidden border-r border-white/10 p-3 sm:block">
            <div className="px-2 pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Command Center</div>
            <nav className="flex flex-col gap-0.5">
              {previewSidebar.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition ${
                      item.active ? "bg-neon/[0.12] text-foreground ring-1 ring-neon/30" : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
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
              {previewTiles.map((tile) => {
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
                  <span className="font-mono text-[10px] text-muted-foreground">Ctrl K</span>
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
      <Header />

      <section id="home" className="relative overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-0 -z-10" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 animate-glow rounded-full"
          style={{ background: "radial-gradient(ellipse at center, color-mix(in oklab, var(--neon) 20%, transparent), transparent 70%)" }}
        />

        <div className="mx-auto max-w-6xl px-4 pb-12 pt-16 text-center md:pb-20 md:pt-24">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-neon" />
            </span>
            <span className="font-mono uppercase tracking-widest text-muted-foreground">AI creator command center for mystery content</span>
          </div>

          <h1 className="mx-auto mt-6 max-w-5xl font-display text-4xl font-semibold leading-[1.05] sm:text-5xl md:text-7xl">
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
              Open command center
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

      <Section
        id="features"
        eyebrow="Features"
        title="Everything needed for safe creator operations"
        description="The template style is now applied to Folqen-specific product surfaces, not generic workspace copy."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="group relative rounded-2xl p-6 transition hover:-translate-y-0.5 hover:bg-white/[0.04] glass">
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-neon/40 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neon/10 text-neon ring-1 ring-neon/25">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="how"
        eyebrow="How it works"
        title="Start with drafts. Stop at approval gates."
        description="Folqen should do repetitive creator work, while you keep control over anything risky, public, paid, or permanent."
      >
        <div className="relative grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-12 hidden md:block">
            <div className="mx-12 h-px bg-gradient-to-r from-transparent via-neon/40 to-transparent" />
          </div>
          {steps.map((step) => (
            <article key={step.n} className="relative rounded-2xl p-6 glass">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background font-mono text-xs font-semibold text-neon ring-1 ring-neon/40">
                  {step.n}
                </span>
                <span className="font-display text-lg font-semibold text-foreground">{step.title}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Product"
        title="A clean command center before real data arrives"
        description="The app is allowed to look polished while staying honest: route pages show useful structure, but live services remain Mock or Not connected."
      >
        <div className="rounded-2xl p-3 md:p-4 glass-strong">
          <div className="flex flex-wrap gap-1.5 border-b border-white/10 pb-3">
            {previewSidebar.map((tab, index) => (
              <button
                key={tab.label}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition ${
                  index === 0 ? "bg-neon/[0.12] text-foreground ring-1 ring-neon/30" : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-3">
            {["Approvals waiting", "Create your first package", "No connected platforms", "No live analytics", "Add folklore topics", "Nothing published yet"].map((item) => (
              <div key={item} className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Foundation state</div>
                <div className="mt-2 font-display text-base text-foreground">{item}</div>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-neon">
                  <span className="h-1 w-1 rounded-full bg-neon" /> Ready for next phase
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Empty by design"
        title="Clean states instead of fake live integrations"
        description="Before credentials and providers exist, Folqen should guide the next action without pretending anything is connected."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {emptyStates.map((item) => (
            <article key={item.title} className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 transition hover:border-neon/30 hover:bg-white/[0.04]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neon/10 text-neon">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{item.hint}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Use cases"
        title="Built for the Folqen creator workflow"
        description="The generic template sections have been translated into the actual AI creator command center product."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((item) => (
            <article key={item.title} className="group flex items-start gap-4 rounded-2xl p-5 transition hover:bg-white/[0.04] glass">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neon/10 text-neon ring-1 ring-neon/20">
                <item.icon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-display font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Build-ready"
        title="Ready for another Codex account to continue"
        description="The design direction, route map, verification status, and next tasks are captured in README and checkpoint docs."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {buildReady.map((item, index) => (
            <article key={item.title} className="relative rounded-2xl p-6 glass">
              <span className="absolute right-4 top-4 font-mono text-[10px] tracking-widest text-muted-foreground">0{index + 1}</span>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neon/10 text-neon ring-1 ring-neon/25">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </article>
          ))}
        </div>
      </Section>

      <section id="safety" className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="neon-border relative overflow-hidden rounded-3xl bg-gradient-to-br from-neon/[0.08] to-white/[0.02] p-6 md:p-10">
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-neon">Safety First</div>
              <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">Automation without reckless publishing.</h2>
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

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="relative overflow-hidden rounded-3xl p-10 text-center md:p-16 glass-strong">
          <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-40" />
          <div
            className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[300px] w-[600px] -translate-x-1/2 animate-glow rounded-full"
            style={{ background: "radial-gradient(ellipse at center, color-mix(in oklab, var(--neon) 25%, transparent), transparent 70%)" }}
          />
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-neon/25 bg-neon/[0.06] px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-neon">
            <span className="h-1.5 w-1.5 rounded-full bg-neon" /> Foundation verified
          </div>
          <h2 className="mx-auto mt-5 max-w-2xl font-display text-4xl font-semibold md:text-6xl">
            <span className="text-foreground">Continue building </span>
            <span className="text-gradient-neon">Folqen</span>
            <span className="text-neon">.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
            The next practical step is route-specific UI refinement, then authentication, database seed data, settings, and approvals.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/dashboard" className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neon px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition hover:brightness-110 sm:w-auto">
              Open dashboard <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link href="/upgrades" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-foreground transition hover:bg-white/[0.06] sm:w-auto">
              <Play className="h-4 w-4 text-neon" /> View upgrade center
            </Link>
          </div>
        </div>
      </section>

      <Section id="faq" eyebrow="FAQ" title="Questions, answered" description="Important handoff details for you and any future Codex account.">
        <div className="mx-auto max-w-3xl divide-y divide-white/10 rounded-2xl glass">
          {faqs.map((faq, index) => (
            <details key={faq.q} className="group px-5 py-5" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                <span className="font-display text-base font-medium text-foreground md:text-lg">{faq.q}</span>
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-muted-foreground group-open:border-neon/40 group-open:bg-neon/10 group-open:text-neon">
                  <Plus className="h-3.5 w-3.5 group-open:hidden" />
                  <Minus className="hidden h-3.5 w-3.5 group-open:block" />
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{faq.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <footer className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-3xl p-8 md:p-12 glass">
          <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <Logo />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                An AI creator command center for planning, creating, reviewing, and packaging mystery content safely.
              </p>
            </div>
            {footerSections.map((section) => (
              <div key={section.title}>
                <div className="font-mono text-[11px] uppercase tracking-widest text-neon">{section.title}</div>
                <ul className="mt-4 space-y-2.5">
                  {section.links.map((label) => (
                    <li key={label}>
                      <span className="text-sm text-muted-foreground">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
            <div className="font-mono text-xs text-muted-foreground">Folqen MVP foundation. Template style applied.</div>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">v0.2 build-ready</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
