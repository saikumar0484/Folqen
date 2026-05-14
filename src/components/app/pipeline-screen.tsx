import { AlertTriangle, CheckCircle2, Clock3, GitBranch, ShieldCheck, Workflow } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { RiskBadge } from "@/components/app/risk-badge";
import { StatCard } from "@/components/app/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { routeById } from "@/lib/app-routes";
import type { getPipelineData } from "@/lib/pipeline-data";

type PipelineData = Awaited<ReturnType<typeof getPipelineData>>;

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
      <div className="h-full rounded-full bg-neon shadow-glow" style={{ width: `${value}%` }} />
    </div>
  );
}

function riskLevel(level: string) {
  if (level === "HIGH" || level === "CRITICAL") return "high" as const;
  if (level === "MEDIUM") return "medium" as const;
  return "low" as const;
}

export function PipelineScreen({ data }: { data: PipelineData }) {
  return (
    <div className="space-y-5 pb-24">
      <PageHeader route={routeById.pipeline} />

      <section className="grid gap-3 md:grid-cols-3">
        {data.stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Live pipeline</div>
              <h2 className="mt-1 font-display text-xl font-semibold">Agent tasks from Supabase</h2>
            </div>
            <StatusBadge tone="premium">Live database</StatusBadge>
          </div>

          <div className="mt-4 grid gap-3">
            {data.tasks.length === 0 ? (
              <EmptyState title="No pipeline jobs yet" description="The agent can create workflow tasks after the service layer expands." />
            ) : null}
            {data.tasks.map((task) => (
              <article key={task.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={task.statusTone}>{task.status}</StatusBadge>
                      <RiskBadge level={riskLevel(task.riskLevel)} />
                    </div>
                    <h3 className="mt-3 font-display text-lg font-semibold">{task.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{task.description}</p>
                    <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                      <span>Content: <span className="text-foreground">{task.contentTitle}</span></span>
                      <span>Format: <span className="text-foreground">{task.contentFormat}</span></span>
                      <span>Updated: <span className="text-foreground">{task.updatedAt}</span></span>
                      <span>Targets: <span className="text-foreground">{task.platformTargets.length ? task.platformTargets.join(", ") : "None"}</span></span>
                    </div>
                  </div>
                  <div className="min-w-44 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock3 className="h-4 w-4 text-neon" />
                      Progress
                    </div>
                    <div className="mt-2 font-mono text-xl text-neon">{task.progress}%</div>
                    <ProgressBar value={task.progress} />
                  </div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="text-xs text-muted-foreground">Review</div>
                    <div className="mt-1 text-sm">{task.reviewStatus ?? "Pending"}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="text-xs text-muted-foreground">Safety</div>
                    <div className="mt-1 text-sm">{task.safetyStatus ?? "Pending"}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="text-xs text-muted-foreground">Copyright</div>
                    <div className="mt-1 text-sm">{task.copyrightStatus ?? "Pending"}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-neon/20 bg-neon/[0.06] p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-neon" />
              <h2 className="font-display text-lg font-semibold">Publishing guard</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Jobs can move through planning and drafting, but public posting remains blocked until approval, safety, copyright, and review all pass.
            </p>
            <div className="mt-4 grid gap-2">
              {["Public publishing blocked", "Paid tools blocked", "Browser automation blocked"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-neon" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-neon" />
              <h2 className="font-display text-lg font-semibold">Workflow runs</h2>
            </div>
            <div className="mt-4 space-y-2">
              {data.workflowRuns.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm leading-6 text-muted-foreground">
                  n8n is Not connected, so no real workflow runs exist yet.
                </div>
              ) : null}
              {data.workflowRuns.map((run) => (
                <div key={run.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{run.workflowId}</span>
                    <StatusBadge tone={run.statusTone}>{run.status}</StatusBadge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{run.logs}</p>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{run.providerId} - {run.updatedAt}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-neon" />
              <h2 className="font-display text-lg font-semibold">Attention queue</h2>
            </div>
            <div className="mt-4 space-y-2">
              {data.approvals.map((approval) => (
                <div key={approval.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="text-sm">{approval.title}</div>
                  <div className="mt-2">
                    <RiskBadge level={riskLevel(approval.riskLevel)} />
                  </div>
                </div>
              ))}
              {data.errors.map((error) => (
                <div key={error.id} className="rounded-xl border border-rose-300/20 bg-rose-300/[0.06] p-3">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-rose-200">{error.source}</div>
                  <div className="mt-1 text-sm">{error.message}</div>
                </div>
              ))}
              {data.approvals.length === 0 && data.errors.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground">No pending approvals or unresolved errors.</div>
              ) : null}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-neon" />
              <h2 className="font-display text-lg font-semibold">Provider mode</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Pipeline controls are read-only until service adapters are implemented. n8n, ComfyUI, FFmpeg, and platforms remain Not connected.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
