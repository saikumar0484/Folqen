import type { ReactNode } from "react";
import { AlertTriangle, BarChart3, Bell, CheckCircle2, LockKeyhole, Search, Workflow, Zap } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { routeById } from "@/lib/app-routes";
import type { getAnalyticsData, getErrorsData, getNotificationsData, getUpgradesData, getWorkflowsData } from "@/lib/operations-data";

type NotificationsData = Awaited<ReturnType<typeof getNotificationsData>>;
type AnalyticsData = Awaited<ReturnType<typeof getAnalyticsData>>;
type ErrorsData = Awaited<ReturnType<typeof getErrorsData>>;
type WorkflowsData = Awaited<ReturnType<typeof getWorkflowsData>>;
type UpgradesData = Awaited<ReturnType<typeof getUpgradesData>>;

function SafetyCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-neon/20 bg-neon/[0.06] p-4">
      <div className="flex items-center gap-2">
        <LockKeyhole className="h-4 w-4 text-neon" />
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{children}</p>
    </div>
  );
}

export function NotificationsScreen({ data }: { data: NotificationsData }) {
  return (
    <div className="space-y-5 pb-24">
      <PageHeader route={routeById.notifications} />
      <section className="grid gap-3 md:grid-cols-3">{data.stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Signal center</div>
              <h2 className="mt-1 font-display text-xl font-semibold">Notifications from Supabase</h2>
            </div>
            <StatusBadge tone="premium">Live database</StatusBadge>
          </div>
          <div className="mt-4 space-y-3">
            {data.notifications.length === 0 ? <EmptyState title="No notifications yet" description="Approval alerts, blocked actions, and upgrade reports will appear here." /> : null}
            {data.notifications.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{item.createdAt}</div>
                    <h3 className="mt-1 font-display text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone={item.read ? "neutral" : "warning"}>{item.read ? "Read" : "Unread"}</StatusBadge>
                    <StatusBadge tone={item.riskTone}>{item.riskLevel}</StatusBadge>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <SafetyCard title="Notification safety">Notifications are read-only for now. Muting, marking read, push notifications, and external channels should be added with audit logs and role checks.</SafetyCard>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-neon" /><h2 className="font-display text-lg font-semibold">Expected alerts</h2></div>
            <div className="mt-4 grid gap-2">
              {["Approval needed", "Publishing blocked", "Tool not connected", "Upgrade proposal ready"].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">{item}</div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export function AnalyticsScreen({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-5 pb-24">
      <PageHeader route={routeById.analytics} />
      <section className="grid gap-3 md:grid-cols-3">{data.stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Performance records</div>
              <h2 className="mt-1 font-display text-xl font-semibold">Analytics from Supabase</h2>
            </div>
            <StatusBadge tone="premium">Live database</StatusBadge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {data.records.length === 0 ? <EmptyState title="No analytics records yet" description="Live platform analytics are Not connected, so only seeded/manual records appear here." /> : null}
            {data.records.map((record) => (
              <article key={record.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{record.platform}</div>
                    <h3 className="mt-1 font-display text-lg font-semibold">{record.metric}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{record.period} - {record.createdAt}</p>
                  </div>
                  <div className="font-mono text-2xl text-neon">{record.value}</div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <SafetyCard title="Analytics honesty">No social platform analytics API is connected yet. Folqen must not claim live views, revenue, CTR, or retention unless a real provider is configured.</SafetyCard>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-neon" /><h2 className="font-display text-lg font-semibold">Useful next metrics</h2></div>
            <div className="mt-4 grid gap-2">
              {["Views and watch time", "Retention and CTR", "Best hooks", "Topic/platform comparison"].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">{item}</div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export function ErrorsScreen({ data }: { data: ErrorsData }) {
  return (
    <div className="space-y-5 pb-24">
      <PageHeader route={routeById.errors} />
      <section className="grid gap-3 md:grid-cols-3">{data.stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Failure recovery</div>
              <h2 className="mt-1 font-display text-xl font-semibold">Errors from Supabase</h2>
            </div>
            <StatusBadge tone="premium">Live database</StatusBadge>
          </div>
          <div className="mt-4 space-y-3">
            {data.errors.length === 0 ? <EmptyState title="No errors recorded" description="Failed providers, validation problems, and recovery notes will appear here." /> : null}
            {data.errors.map((error) => (
              <article key={error.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{error.source}</div>
                    <h3 className="mt-1 font-display text-lg font-semibold">{error.message}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Created {error.createdAt} - Updated {error.updatedAt}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone={error.resolved ? "safe" : "warning"}>{error.resolved ? "Resolved" : "Open"}</StatusBadge>
                    <StatusBadge tone={error.severityTone}>{error.severity}</StatusBadge>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <SafetyCard title="Recovery rule">When a serious error appears, stop expanding scope, fix safe issues, document blockers, and ask before destructive recovery.</SafetyCard>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-neon" /><h2 className="font-display text-lg font-semibold">Recovery checklist</h2></div>
            <div className="mt-4 grid gap-2">
              {["Capture command output", "Identify changed files", "Fix or isolate safely", "Update risk log"].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">{item}</div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export function WorkflowsScreen({ data }: { data: WorkflowsData }) {
  return (
    <div className="space-y-5 pb-24">
      <PageHeader route={routeById.workflows} />
      <section className="grid gap-3 md:grid-cols-3">{data.stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Workflow hub</div>
              <h2 className="mt-1 font-display text-xl font-semibold">Workflow runs from Supabase</h2>
            </div>
            <StatusBadge tone="premium">Live database</StatusBadge>
          </div>
          <div className="mt-4 space-y-3">
            {data.runs.length === 0 ? <EmptyState title="No workflow runs yet" description="n8n is Not connected, so there are no live workflow executions." /> : null}
            {data.runs.map((run) => (
              <article key={run.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{run.providerId}</div>
                    <h3 className="mt-1 font-display text-lg font-semibold">{run.workflowId}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{run.logs}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{run.updatedAt}</p>
                  </div>
                  <StatusBadge tone={run.statusTone}>{run.status}</StatusBadge>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <SafetyCard title="n8n remains gated">The n8n webhook is only configured when secrets exist. Real workflows must not publish, spend, or automate browsers without explicit approval.</SafetyCard>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2"><Workflow className="h-4 w-4 text-neon" /><h2 className="font-display text-lg font-semibold">Workflow providers</h2></div>
            <div className="mt-4 space-y-2">
              {data.providers.map((provider) => (
                <div key={provider.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{provider.name}</span>
                    <StatusBadge tone="warning">{provider.status.replaceAll("_", " ")}</StatusBadge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{provider.costModel} - {provider.commercialUse}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export function UpgradesScreen({ data }: { data: UpgradesData }) {
  return (
    <div className="space-y-5 pb-24">
      <PageHeader route={routeById.upgrades} />
      <section className="grid gap-3 md:grid-cols-3">{data.stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Self-improvement</div>
              <h2 className="mt-1 font-display text-xl font-semibold">Upgrade proposals from Supabase</h2>
            </div>
            <StatusBadge tone="premium">Live database</StatusBadge>
          </div>
          <div className="mt-4 space-y-3">
            {data.proposals.length === 0 ? <EmptyState title="No upgrade proposals yet" description="The research agent can draft proposals, but execution must remain approval-gated." /> : null}
            {data.proposals.map((proposal) => (
              <article key={proposal.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{proposal.category}</div>
                    <h3 className="mt-1 font-display text-lg font-semibold">{proposal.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{proposal.summary}</p>
                  </div>
                  <StatusBadge tone={proposal.statusTone}>{proposal.status.replaceAll("_", " ")}</StatusBadge>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">Risk {proposal.riskScore}/10</div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">Cost {proposal.costScore}/10</div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">Benefit {proposal.benefitScore}/10</div>
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="text-xs text-muted-foreground">Testing plan</div>
                    <p className="mt-1 text-sm leading-6">{proposal.testingPlan}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="text-xs text-muted-foreground">Rollback plan</div>
                    <p className="mt-1 text-sm leading-6">{proposal.rollbackPlan}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {proposal.findings.map((finding) => (
                    <div key={finding.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium">{finding.title}</span>
                        <StatusBadge tone="neutral">{finding.confidence}% confidence</StatusBadge>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{finding.summary}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <SafetyCard title="Never self-execute">Research and proposal drafting are allowed. Installing packages, changing production code, migrations, paid tools, credentials, and public publishing require approval.</SafetyCard>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2"><Search className="h-4 w-4 text-neon" /><h2 className="font-display text-lg font-semibold">Research rules</h2></div>
            <div className="mt-4 grid gap-2">
              {["Prefer official docs", "Show free/local alternatives", "Include test and rollback plans", "Create approval records before execution"].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">{item}</div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-neon" /><h2 className="font-display text-lg font-semibold">Execution state</h2></div>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-neon" />
              Auto-execute upgrades is off
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
