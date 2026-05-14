"use client";

import { useState, useTransition } from "react";
import { Activity, Camera, Eye, Globe2, LockKeyhole, MousePointerClick, RotateCcw, ShieldAlert, TerminalSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toHonestStatus } from "@/lib/status-semantics";
import type { BrowserOpsDashboard, BrowserWorkflowResult } from "@/lib/browser-ops/types";

type BrowserOperationsPanelProps = {
  dashboard: BrowserOpsDashboard;
};

function statusClass(status: string) {
  if (status === "Configured") return "border-neon/25 bg-neon/10 text-neon";
  if (status === "Needs approval") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  if (status === "Blocked") return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  return "border-white/10 bg-white/[0.04] text-muted-foreground";
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Folqen-Mutation": "true",
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload?.error ?? "Browser operation failed.");
  }
  return payload;
}

export function BrowserOperationsPanel({ dashboard }: BrowserOperationsPanelProps) {
  const [startUrl, setStartUrl] = useState("https://folqen.vercel.app/dashboard");
  const [approvalId, setApprovalId] = useState("");
  const [result, setResult] = useState<BrowserWorkflowResult | null>(dashboard.recentRuns[0] ?? null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runDryWorkflow() {
    setMessage(null);
    startTransition(async () => {
      try {
        const payload = await postJson<{ result: BrowserWorkflowResult; message: string }>("/api/browser-ops/workflow", {
          workflowKind: "dom_inspection",
          objective: "Preview Folqen command-center route and capture dry-run browser traces.",
          startUrl,
          approvalId: approvalId || undefined,
          approvalRequired: true,
          actions: [
            { action: "open_page", target: startUrl },
            { action: "inspect_dom", target: "main" },
            { action: "capture_screenshot", target: "viewport" },
            { action: "extract_structured_data", target: "status badges" },
          ],
        });
        setResult(payload.result);
        setMessage(payload.message);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Browser workflow failed.");
      }
    });
  }

  function runControl(action: "rollback_to_dry_run" | "kill_switch" | "quarantine_session") {
    setMessage(null);
    startTransition(async () => {
      try {
        const payload = await postJson<{ message: string }>("/api/browser-ops/control", {
          action,
          reason: `Operator requested ${action} from Browser Operations dashboard.`,
          sessionId: action === "quarantine_session" ? result?.sessionId : undefined,
        });
        setMessage(payload.message);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Browser control action failed.");
      }
    });
  }

  return (
    <section className="space-y-4">
      <Card className="border-neon/20 bg-black/30">
        <CardHeader>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="premium">
                  <Globe2 className="h-3.5 w-3.5" />
                  Browser Operations
                </Badge>
                <Badge className={statusClass(toHonestStatus(dashboard.department.status))}>{toHonestStatus(dashboard.department.status)}</Badge>
                <Badge variant="safe">Dry-run only</Badge>
                <Badge variant="safe">No account sessions</Badge>
              </div>
              <CardTitle className="mt-3">Governed Browser Operations Department</CardTitle>
              <CardDescription>{dashboard.department.mission}</CardDescription>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {dashboard.provider.package} / {dashboard.mode} / live off
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["Sessions", dashboard.sessions.length, "Dry-run session plans"],
            ["Traces", dashboard.observability.traces, "Simulated trace steps"],
            ["Screenshots", dashboard.observability.screenshotsAudited, "Redacted placeholders"],
            ["Quarantine", dashboard.observability.quarantinedSessions, "Isolated sessions"],
            ["Queue", dashboard.queue.mode, "BullMQ adapter state"],
          ].map(([label, value, hint]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="font-mono text-2xl text-neon">{value}</div>
              <div className="mt-1 text-sm font-medium">{label}</div>
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-neon" />
              Dry-run workflow console
            </CardTitle>
            <CardDescription>Plan an isolated Playwright observation without launching a browser, touching cookies, scraping, or interacting with accounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="block text-xs font-medium text-muted-foreground" htmlFor="browser-start-url">
              Target URL
            </label>
            <input
              id="browser-start-url"
              value={startUrl}
              onChange={(event) => setStartUrl(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none transition focus:border-neon/50"
            />
            <label className="block text-xs font-medium text-muted-foreground" htmlFor="browser-approval-id">
              Approval ID
            </label>
            <input
              id="browser-approval-id"
              value={approvalId}
              onChange={(event) => setApprovalId(event.target.value)}
              placeholder="Required to move beyond planning"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-neon/50"
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={runDryWorkflow} disabled={isPending}>
                <Eye className="h-4 w-4" />
                Run dry trace
              </Button>
              <Button type="button" variant="secondary" onClick={() => runControl("rollback_to_dry_run")} disabled={isPending}>
                <RotateCcw className="h-4 w-4" />
                Rollback dry-run
              </Button>
              <Button type="button" variant="secondary" onClick={() => runControl("quarantine_session")} disabled={isPending || !result}>
                <ShieldAlert className="h-4 w-4" />
                Quarantine
              </Button>
            </div>
            {message ? <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-muted-foreground">{message}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-neon" />
              Screenshot and trace preview
            </CardTitle>
            <CardDescription>Redacted preview artifacts. No pixels are captured from a live page in this phase.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="aspect-video rounded-2xl border border-neon/20 bg-[radial-gradient(circle_at_30%_20%,rgba(151,255,77,0.2),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-4">
              <div className="flex h-full flex-col justify-between rounded-xl border border-white/10 bg-black/35 p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge className={statusClass(result?.status === "simulated" ? "Configured" : result?.status === "blocked" ? "Blocked" : "Needs approval")}>{result?.status ?? "No run"}</Badge>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">redacted screenshot</span>
                </div>
                <div>
                  <div className="font-display text-2xl font-semibold">Browser trace preview</div>
                  <p className="mt-2 max-w-md text-xs leading-5 text-muted-foreground">Simulated browser observation for governed workflow preview. Live browsing remains disabled.</p>
                </div>
              </div>
            </div>
            {result ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Run</div>
                  <p className="mt-2 break-all text-xs text-muted-foreground">{result.runId}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Queue</div>
                  <p className="mt-2 break-all text-xs text-muted-foreground">{result.queueJobId}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-neon" />
              Browser traces
            </CardTitle>
            <CardDescription>Action-level validation, secret masking, domain policy, and dry-run evidence.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(result?.actions ?? []).length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-muted-foreground">No dry-run trace yet. Run a workflow to populate simulated browser steps.</p>
            ) : (
              result?.actions.map((step) => (
                <div key={step.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{step.action}</div>
                    <Badge className={statusClass(step.status === "blocked" ? "Blocked" : step.status === "needs_approval" ? "Needs approval" : "Configured")}>{step.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6">{step.summary}</p>
                  <p className="mt-1 break-all text-xs text-muted-foreground">{step.target}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {step.evidence.slice(0, 4).map((item) => (
                      <Badge key={item} variant="neutral">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-neon" />
              Governance policy
            </CardTitle>
            <CardDescription>Allowed domains, blocked domains, approval gates, timeout limits, and restricted browser actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex flex-wrap gap-2">
                <Badge className={statusClass(dashboard.governance.status)}>{dashboard.governance.status}</Badge>
                <Badge variant="safe">Sandbox {String(dashboard.governance.sandboxMode)}</Badge>
                <Badge variant="safe">{dashboard.governance.maxSessionSeconds}s max</Badge>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">Live browser execution is hard-disabled. Approval IDs only allow richer dry-run planning, not real browsing.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Allowed domains</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {dashboard.governance.allowedDomains.map((domain) => (
                  <Badge key={domain} variant="safe">
                    {domain}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Blocked domains</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {dashboard.governance.blockedDomains.slice(0, 8).map((domain) => (
                  <Badge key={domain} variant="warning">
                    {domain}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {dashboard.governance.policies.map((policy) => (
                <div key={policy.action} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-neon">{policy.action}</span>
                    <Badge className={statusClass(toHonestStatus(policy.status))}>{toHonestStatus(policy.status)}</Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{policy.summary}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TerminalSquare className="h-4 w-4 text-neon" />
            Safety notes
          </CardTitle>
          <CardDescription>Explicit execution boundaries for preview and internal testing.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-2">
          {dashboard.notes.map((note) => (
            <div key={note} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-muted-foreground">
              {note}
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
