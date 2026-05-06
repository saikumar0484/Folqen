import {
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock3,
  FileText,
  Gauge,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Workflow,
  Wrench,
} from "lucide-react";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { PageHeader } from "@/components/app/page-header";
import { RiskBadge } from "@/components/app/risk-badge";
import { StatCard } from "@/components/app/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { routeById } from "@/lib/app-routes";

const dashboardStats = [
  { label: "Active jobs", value: "3", hint: "Draft-only content operations", tone: "premium" as const },
  { label: "Pending approvals", value: "4", hint: "Publishing and upgrades blocked", tone: "warning" as const },
  { label: "Connected platforms", value: "0", hint: "Manual packages only", tone: "safe" as const },
];

const activeJobs = [
  {
    title: "Haunted fort short package",
    stage: "Script review",
    progress: "68%",
    status: "Mock",
    detail: "Hook, outline, and caption draft are ready for review.",
  },
  {
    title: "Cursed object carousel",
    stage: "Storyboard",
    progress: "44%",
    status: "Mock",
    detail: "Panel prompts are prepared; image generation remains Not connected.",
  },
  {
    title: "Weekly mystery newsletter",
    stage: "Research",
    progress: "31%",
    status: "Mock",
    detail: "Sources need fact review before the draft can move forward.",
  },
];

const approvalItems = [
  "Public publishing request blocked",
  "Paid video tool request blocked",
  "Upgrade proposal needs review",
  "Copyright uncertainty needs decision",
];

const platformStatuses = ["YouTube", "Instagram", "Facebook", "Snapchat", "Threads"];

const toolStatuses = [
  { name: "n8n", note: "Webhook missing", icon: Workflow },
  { name: "ComfyUI", note: "Base URL missing", icon: Sparkles },
  { name: "FFmpeg", note: "Path missing", icon: Wrench },
  { name: "Analytics", note: "No API connected", icon: BarChart3 },
];

const timeline = [
  { time: "09:10", title: "Safety gates checked", icon: ShieldCheck },
  { time: "09:24", title: "Draft package prepared", icon: FileText },
  { time: "09:41", title: "Publishing blocked by default", icon: AlertTriangle },
  { time: "10:05", title: "Upgrade proposal saved as mock", icon: Sparkles },
];

function ProgressBar({ value }: { value: string }) {
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
      <div className="h-full rounded-full bg-neon shadow-glow" style={{ width: value }} />
    </div>
  );
}

export function DashboardScreen() {
  return (
    <div className="space-y-5 pb-24">
      <PageHeader route={routeById.dashboard} />

      <section className="grid gap-3 md:grid-cols-3">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Active pipeline</div>
              <h2 className="mt-1 font-display text-xl font-semibold">Creator jobs in progress</h2>
            </div>
            <StatusBadge tone="premium">Mock data</StatusBadge>
          </div>

          <div className="mt-4 grid gap-3">
            {activeJobs.map((job) => (
              <article key={job.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-semibold">{job.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{job.detail}</p>
                  </div>
                  <StatusBadge tone="neutral">{job.status}</StatusBadge>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{job.stage}</span>
                  <span className="font-mono text-neon">{job.progress}</span>
                </div>
                <ProgressBar value={job.progress} />
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-neon/20 bg-neon/[0.06] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Approvals</div>
                <h2 className="mt-1 font-display text-xl font-semibold">Human gates</h2>
              </div>
              <RiskBadge level="medium" />
            </div>
            <div className="mt-4 space-y-2">
              {approvalItems.map((item) => (
                <div key={item} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <span className="text-sm text-muted-foreground">{item}</span>
                  <StatusBadge tone="safe">Needs approval</StatusBadge>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Mini agent</div>
            <div className="mt-3 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neon/10 text-neon">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-base font-semibold">Safe assistant mode</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  The agent can prepare work and explain blockers, but it cannot publish, spend, connect accounts, or upgrade itself.
                </p>
              </div>
            </div>
            <div className="mt-3">
              <ConfirmDialog label="Dashboard risky-action preview" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 lg:col-span-1">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-neon" />
            <h2 className="font-display text-lg font-semibold">Platform status</h2>
          </div>
          <div className="mt-4 space-y-2">
            {platformStatuses.map((platform) => (
              <div key={platform} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <span className="text-sm">{platform}</span>
                <StatusBadge tone="warning">Not connected</StatusBadge>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 lg:col-span-1">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-neon" />
            <h2 className="font-display text-lg font-semibold">Tool limits</h2>
          </div>
          <div className="mt-4 space-y-2">
            {toolStatuses.map((tool) => (
              <div key={tool.name} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon/10 text-neon">
                  <tool.icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-medium">{tool.name}</div>
                  <div className="text-xs text-muted-foreground">{tool.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 lg:col-span-1">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-neon" />
            <h2 className="font-display text-lg font-semibold">Recent activity</h2>
          </div>
          <div className="mt-4 space-y-3">
            {timeline.map((item) => (
              <div key={`${item.time}-${item.title}`} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neon/10 text-neon">
                  <item.icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="font-mono text-[10px] text-muted-foreground">{item.time}</div>
                  <div className="text-sm text-foreground">{item.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Next phase started</div>
            <h2 className="mt-2 font-display text-2xl font-semibold">Dashboard moved beyond a placeholder</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This screen now shows the structure the real app will use: jobs, approvals, platform health, tool limits, activity, and safety status.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Build auth", "Next major risk"],
              ["Seed data", "Database phase"],
              ["Route polish", "Current phase"],
            ].map(([title, note]) => (
              <div key={title} className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4">
                <CheckCircle2 className="h-4 w-4 text-neon" />
                <div className="mt-3 text-sm font-medium">{title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
