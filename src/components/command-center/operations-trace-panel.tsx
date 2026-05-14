"use client";

import { useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Clock3, Database, Filter, GitBranch, Link2, LockKeyhole, RadioTower, RotateCcw, Search, ShieldAlert, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OperationsTraceDashboard, OperationsTraceItem, OperationsTraceSeverity, OperationsTraceSource, OperationsTraceStatus } from "@/lib/operations-trace/types";
import { toHonestStatus } from "@/lib/status-semantics";

type OperationsTracePanelProps = {
  dashboard: OperationsTraceDashboard;
};

function statusClass(status: OperationsTraceStatus | string) {
  if (status === "Live" || status === "Configured") return "border-neon/25 bg-neon/10 text-neon";
  if (status === "Needs approval") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
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
  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<OperationsTraceSource | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<OperationsTraceSeverity | "all">("all");
  const [visibleCount, setVisibleCount] = useState(dashboard.pagination.pageSize);

  const stats = [
    { label: "Audits", value: dashboard.summary.audits, hint: "AuditLog rows" },
    { label: "Events", value: dashboard.summary.events, hint: "EventLog rows" },
    { label: "Workflows", value: dashboard.summary.workflows, hint: "WorkflowRun rows" },
    { label: "Open errors", value: dashboard.summary.errors, hint: "Unresolved ErrorLog rows" },
    { label: "Pending approvals", value: dashboard.summary.pendingApprovals, hint: "Human gates" },
    { label: "Verified approvals", value: dashboard.summary.verifiedApprovals, hint: "Lifecycle correlated" },
    { label: "Integrity issues", value: dashboard.summary.integrityIssues, hint: "Trace checks" },
    { label: "Assets", value: dashboard.summary.assets, hint: "Asset rows" },
  ];

  const sources = useMemo(() => Array.from(new Set(dashboard.traces.map((trace) => trace.source))).sort(), [dashboard.traces]);

  const filteredTraces = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return dashboard.traces.filter((trace) => {
      const matchesQuery = !needle || [trace.title, trace.summary, trace.target, trace.actor, trace.source, trace.status].filter(Boolean).join(" ").toLowerCase().includes(needle);
      const matchesSource = sourceFilter === "all" || trace.source === sourceFilter;
      const matchesSeverity = severityFilter === "all" || trace.severity === severityFilter;
      return matchesQuery && matchesSource && matchesSeverity;
    });
  }, [dashboard.traces, query, severityFilter, sourceFilter]);

  const visibleTraces = filteredTraces.slice(0, visibleCount);
  const openDiagnostics = dashboard.diagnostics.filter((item) => item.status === "Blocked" || item.status === "Needs approval" || item.status === "Not connected");

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
                <Badge className={statusClass(toHonestStatus(dashboard.databaseStatus))}>Database {toHonestStatus(dashboard.databaseStatus)}</Badge>
                <Badge variant={dashboard.queueMode === "live" ? "safe" : "warning"}>{dashboard.queueMode === "live" ? "Queue Configured" : "Queue Not connected"}</Badge>
                <Badge className={statusClass(toHonestStatus(dashboard.integrity.status))}>Integrity {toHonestStatus(dashboard.integrity.status)}</Badge>
                <Badge variant="safe">No execution</Badge>
              </div>
              <CardTitle className="mt-3">Governed Operations Trace Center</CardTitle>
              <CardDescription>Approval read models, trace verification, production diagnostics, correlation views, and searchable operational traces.</CardDescription>
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

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-neon" />
              Approval lifecycle dashboard
            </CardTitle>
            <CardDescription>State transitions, escalation/retry/revoke signals, rollback eligibility, and verification indicators.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.approvals.length ? (
              dashboard.approvals.slice(0, 6).map((approval) => (
                <article key={approval.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={statusClass(toHonestStatus(approval.status))}>{toHonestStatus(approval.rawStatus)}</Badge>
                        <Badge className={statusClass(toHonestStatus(approval.verificationStatus))}>verification {toHonestStatus(approval.verificationStatus)}</Badge>
                        {approval.rollbackAvailable ? (
                          <Badge variant="warning">
                            <RotateCcw className="h-3.5 w-3.5" />
                            rollback-ready
                          </Badge>
                        ) : null}
                      </div>
                      <h2 className="mt-2 break-words text-sm font-medium">{approval.title}</h2>
                      <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">{approval.reasonSummary}</p>
                    </div>
                    <Badge variant={approval.riskLevel === "HIGH" || approval.riskLevel === "CRITICAL" ? "danger" : approval.riskLevel === "MEDIUM" ? "warning" : "neutral"}>{approval.riskLevel}</Badge>
                  </div>

                  <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {approval.lifecycle.map((step) => (
                      <div key={step.id} className="rounded-xl border border-white/10 bg-black/25 p-3">
                        <div className="flex items-start gap-2">
                          <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon" />
                          <div className="min-w-0">
                            <div className="text-xs font-medium">{step.label}</div>
                            <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{formatDate(step.createdAt)}</div>
                          </div>
                        </div>
                        <p className="mt-2 break-words text-[11px] leading-5 text-muted-foreground">{step.summary}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-[11px] leading-5 text-muted-foreground">
                    {approval.verificationReasons.join(" ")}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">No approval records are available in the current trace window.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-200" />
              Trace integrity validation
            </CardTitle>
            <CardDescription>Missing events, orphan workflows, queue mismatches, approval mismatches, and incident correlations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Correlated approvals", dashboard.integrity.checks.correlatedApprovals],
                ["Orphan workflows", dashboard.integrity.checks.orphanWorkflows],
                ["Missing audit links", dashboard.integrity.checks.missingAuditLinks],
                ["Queue mismatches", dashboard.integrity.checks.queueMismatches],
                ["Open incidents", dashboard.integrity.checks.openIncidents],
                ["Total traces", dashboard.integrity.checks.totalTraces],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="font-mono text-xl text-neon">{value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>

            {dashboard.integrity.issues.length ? (
              dashboard.integrity.issues.slice(0, 8).map((issue) => (
                <div key={issue.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={severityVariant(issue.severity)}>{issue.type.replaceAll("_", " ")}</Badge>
                        <Badge className={statusClass(toHonestStatus(issue.status))}>{toHonestStatus(issue.status)}</Badge>
                      </div>
                      <div className="mt-2 text-sm font-medium">{issue.title}</div>
                      <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">{issue.summary}</p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{formatDate(issue.detectedAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-neon/20 bg-neon/[0.04] p-4 text-sm text-muted-foreground">No trace integrity issues detected in the current window.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Production diagnostics</CardTitle>
            <CardDescription>Deployment, auth, environment, provider, queue, database, and governance readiness without secret exposure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.diagnostics.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{item.category}</div>
                    <div className="mt-1 text-sm font-medium">{item.label}</div>
                  </div>
                  <Badge className={statusClass(toHonestStatus(item.status))}>{toHonestStatus(item.status)}</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.evidence.slice(0, 4).map((evidence) => (
                    <Badge key={evidence} variant="neutral">
                      {evidence}
                    </Badge>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-5 text-amber-100/80">{item.safeAction}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operational correlation graph</CardTitle>
            <CardDescription>Read-only links between approvals, audits, workflows, events, incidents, renders, and assets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.correlations.length ? (
              dashboard.correlations.slice(0, 14).map((edge) => (
                <div key={edge.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link2 className="h-3.5 w-3.5 shrink-0 text-neon" />
                        <Badge variant="info">{edge.kind.replaceAll("_", " ")}</Badge>
                        <Badge className={statusClass(toHonestStatus(edge.status))}>{toHonestStatus(edge.status)}</Badge>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted-foreground">{edge.label}</p>
                    </div>
                    <div className="font-mono text-[10px] leading-5 text-muted-foreground">
                      <div className="max-w-52 truncate">{edge.fromId}</div>
                      <div className="max-w-52 truncate">{edge.toId}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">No operational correlations found in the current trace window.</div>
            )}
          </CardContent>
        </Card>
      </div>

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
                  <Badge className={statusClass(toHonestStatus(item.status))}>{toHonestStatus(item.status)}</Badge>
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>Operational trace explorer</CardTitle>
              <CardDescription>Search, filter, paginate, and drill into normalized operational facts. Metadata values stay server-side.</CardDescription>
            </div>
            <Badge variant={openDiagnostics.length ? "warning" : "safe"}>{openDiagnostics.length} diagnostic flags</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
            <label className="block space-y-2">
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <Search className="h-3.5 w-3.5" />
                Search traces
              </span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, summary, actor, target, status" className="h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-neon/60" />
            </label>
            <label className="block space-y-2">
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                Source
              </span>
              <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as OperationsTraceSource | "all")} className="h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-neon/60">
                <option value="all">All sources</option>
                {sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Severity</span>
              <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as OperationsTraceSeverity | "all")} className="h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-neon/60">
                <option value="all">All severities</option>
                {["info", "warning", "error", "critical"].map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs text-muted-foreground">
            Showing {visibleTraces.length} of {filteredTraces.length} filtered traces. Server returned {dashboard.pagination.returned} of {dashboard.pagination.total} trace candidates.
          </div>

          <div className="space-y-3">
            {visibleTraces.map((trace) => {
              const Icon = sourceIcon(trace.source);

              return (
                <article key={`${trace.source}-${trace.id}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Icon className="h-4 w-4 shrink-0 text-neon" />
                        <Badge variant={severityVariant(trace.severity)}>{trace.source}</Badge>
                        <Badge className={statusClass(toHonestStatus(trace.status))}>{toHonestStatus(trace.status)}</Badge>
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
          </div>

          {visibleCount < filteredTraces.length ? (
            <Button type="button" variant="secondary" onClick={() => setVisibleCount((count) => count + dashboard.pagination.pageSize)}>
              <CheckCircle2 className="h-4 w-4" />
              Load more traces
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
