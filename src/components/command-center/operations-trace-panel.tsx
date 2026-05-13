import { Activity, AlertTriangle, Database, GitBranch, LockKeyhole, RadioTower, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OperationsTraceDashboard, OperationsTraceItem, OperationsTraceSeverity, OperationsTraceStatus } from "@/lib/operations-trace/types";

type OperationsTracePanelProps = {
  dashboard: OperationsTraceDashboard;
};

function statusClass(status: OperationsTraceStatus | string) {
  if (status === "Live" || status === "Configured") return "border-neon/25 bg-neon/10 text-neon";
  if (status === "Needs approval" || status === "Mock") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  if (status === "Blocked") return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  return "border-white/10 bg-white/[0.04] text-muted-foreground";
}

function severityVariant(severity: OperationsTraceSeverity): "safe" | "info" | "warning" | "danger" | "neutral" | "premium" {
  if (severity === "critical" || severity === "error") return "danger";
  if (severity === "warning") return "warning";
  return "info";
}

function sourceIcon(source: OperationsTraceItem["source"]) {
  if (source === "workflow") return GitBranch;
  if (source === "error") return AlertTriangle;
  if (source === "approval" || source === "safety") return ShieldCheck;
  if (source === "queue") return RadioTower;
  if (source === "asset" || source === "render") return Database;
  return Activity;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function OperationsTracePanel({ dashboard }: OperationsTracePanelProps) {
  const stats = [
    { label: "Audits", value: dashboard.summary.audits, hint: "AuditLog rows" },
    { label: "Events", value: dashboard.summary.events, hint: "EventLog rows" },
    { label: "Workflows", value: dashboard.summary.workflows, hint: "WorkflowRun rows" },
    { label: "Open errors", value: dashboard.summary.errors, hint: "Unresolved ErrorLog rows" },
    { label: "Approvals", value: dashboard.summary.pendingApprovals, hint: "Pending gates" },
    { label: "Blocked runs", value: dashboard.summary.blockedRuns, hint: "Failed or canceled workflows" },
    { label: "Renders", value: dashboard.summary.renders, hint: "Render rows" },
    { label: "Assets", value: dashboard.summary.assets, hint: "Asset rows" },
  ];

  return (
    <section className="space-y-4">
      <Card className="border-neon/20 bg-black/30">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="premium">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Read-only
                </Badge>
                <Badge className={statusClass(dashboard.databaseStatus)}>Database {dashboard.databaseStatus}</Badge>
                <Badge variant={dashboard.queueMode === "live" ? "safe" : "warning"}>{dashboard.queueMode === "live" ? "Queue Configured" : "Queue Mock"}</Badge>
                <Badge variant="safe">No execution</Badge>
              </div>
              <CardTitle className="mt-3">Governed Operations Trace Center</CardTitle>
              <CardDescription>Unified operational read model for audit logs, workflow runs, events, approvals, queues, errors, renders, assets, and safety posture.</CardDescription>
            </div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Generated {formatDate(dashboard.generatedAt)}</div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="font-mono text-2xl text-neon">{stat.value}</div>
              <div className="mt-1 text-sm font-medium">{stat.label}</div>
              <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Safety posture</CardTitle>
            <CardDescription>Current execution controls as read-only facts. This panel never activates providers, queues, rendering, or publishing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.safetyPosture.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                  </div>
                  <Badge className={statusClass(item.status)}>{item.status}</Badge>
                </div>
              </div>
            ))}
            <div className="rounded-2xl border border-neon/20 bg-neon/[0.04] p-3 text-xs leading-5 text-muted-foreground">
              {dashboard.notes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue observability</CardTitle>
            <CardDescription>BullMQ/Redis status is surfaced without starting workers or draining queues.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {dashboard.queues.slice(0, 8).map((queue) => (
              <div key={queue.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 truncate font-mono text-[11px] text-neon">{queue.name}</div>
                  <Badge variant={queue.mode === "live" ? "safe" : "warning"}>{queue.mode}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2 text-center font-mono text-[11px]">
                  <div>
                    <div className="text-foreground">{queue.waiting}</div>
                    <div className="text-muted-foreground">wait</div>
                  </div>
                  <div>
                    <div className="text-foreground">{queue.active}</div>
                    <div className="text-muted-foreground">active</div>
                  </div>
                  <div>
                    <div className="text-foreground">{queue.delayed}</div>
                    <div className="text-muted-foreground">delay</div>
                  </div>
                  <div>
                    <div className="text-foreground">{queue.failed}</div>
                    <div className="text-muted-foreground">fail</div>
                  </div>
                  <div>
                    <div className="text-foreground">{queue.completed}</div>
                    <div className="text-muted-foreground">done</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unified trace feed</CardTitle>
          <CardDescription>Recent operational facts normalized across Folqen systems. Metadata values stay server-side.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {dashboard.traces.map((trace) => {
            const Icon = sourceIcon(trace.source);

            return (
              <article key={`${trace.source}-${trace.id}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0 text-neon" />
                      <Badge variant={severityVariant(trace.severity)}>{trace.source}</Badge>
                      <Badge className={statusClass(trace.status)}>{trace.status}</Badge>
                      <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{formatDate(trace.createdAt)}</span>
                    </div>
                    <h2 className="mt-2 break-words text-sm font-medium">{trace.title}</h2>
                    <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">{trace.summary}</p>
                    {trace.metadataKeys.length ? <p className="mt-2 text-[11px] text-muted-foreground">Metadata keys: {trace.metadataKeys.join(", ")}</p> : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                    <Badge variant={trace.riskLevel === "HIGH" || trace.riskLevel === "CRITICAL" ? "danger" : trace.riskLevel === "MEDIUM" ? "warning" : "neutral"}>{trace.riskLevel}</Badge>
                    {trace.actor ? <Badge variant="neutral">{trace.actor}</Badge> : null}
                    {trace.target ? <Badge variant="neutral">{trace.target}</Badge> : null}
                  </div>
                </div>
              </article>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}
