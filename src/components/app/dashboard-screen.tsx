import { BarChart3, Bot, CheckCircle2, Clock3, FileText, Gauge, Megaphone, Sparkles, Workflow, Wrench } from "lucide-react";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { PageHeader } from "@/components/app/page-header";
import { RiskBadge } from "@/components/app/risk-badge";
import { StatCard } from "@/components/app/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { routeById } from "@/lib/app-routes";
import type { getDashboardData } from "@/lib/dashboard-data";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

const toolIcons = [Workflow, Sparkles, Wrench, BarChart3];

function ProgressBar({ value }: { value: string }) {
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
      <div className="h-full rounded-full bg-neon shadow-glow" style={{ width: value }} />
    </div>
  );
}

function formatPlatformName(name: string) {
  return name.charAt(0) + name.slice(1).toLowerCase();
}

export function DashboardScreen({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-5 pb-24">
      <PageHeader route={routeById.dashboard} />

      <section className="grid gap-3 md:grid-cols-3">
        {data.stats.map((stat) => (
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
            <StatusBadge tone="premium">Live database</StatusBadge>
          </div>

          <div className="mt-4 grid gap-3">
            {data.jobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-5 text-sm text-muted-foreground">No active jobs yet. The agent can create draft tasks after the workflow layer is expanded.</div>
            ) : null}
            {data.jobs.map((job) => (
              <article key={job.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-semibold">{job.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{job.detail}</p>
                  </div>
                  <StatusBadge tone={job.status === "FAILED" ? "danger" : job.status === "COMPLETED" ? "safe" : "neutral"}>{job.status}</StatusBadge>
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
              <RiskBadge level={data.approvals.length > 0 ? "medium" : "low"} />
            </div>
            <div className="mt-4 space-y-2">
              {data.approvals.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-muted-foreground">No pending approvals.</div>
              ) : null}
              {data.approvals.map((approval) => (
                <div key={approval.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <span className="text-sm text-muted-foreground">{approval.title}</span>
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
                  The agent can save chat messages and prepare work, but it cannot publish, spend, connect accounts, or upgrade itself.
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
            {data.platforms.map((platform) => (
              <div key={platform.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <span className="text-sm">{formatPlatformName(platform.name)}</span>
                <StatusBadge tone={platform.status === "LIVE" || platform.status === "CONFIGURED" ? "safe" : "warning"}>{platform.status.replaceAll("_", " ")}</StatusBadge>
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
            {data.tools.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-muted-foreground">No tool limits configured yet.</div>
            ) : null}
            {data.tools.map((tool, index) => {
              const Icon = toolIcons[index % toolIcons.length];
              return (
                <div key={tool.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon/10 text-neon">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-medium">{tool.name}</div>
                    <div className="text-xs text-muted-foreground">{tool.note}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 lg:col-span-1">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-neon" />
            <h2 className="font-display text-lg font-semibold">Recent activity</h2>
          </div>
          <div className="mt-4 space-y-3">
            {data.activity.map((item) => (
              <div key={item.id} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neon/10 text-neon">
                  <FileText className="h-4 w-4" />
                </span>
                <div>
                  <div className="font-mono text-[10px] text-muted-foreground">{item.time}</div>
                  <div className="text-sm text-foreground">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.actor}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-center">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Dashboard upgraded</div>
            <h2 className="mt-2 font-display text-2xl font-semibold">Now powered by Supabase records</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The dashboard uses real jobs, approvals, platforms, tool limits, and audit events while keeping integrations honest and safe.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Database", "Live"],
              ["Publishing", "Blocked"],
              ["Paid tools", "Blocked"],
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
