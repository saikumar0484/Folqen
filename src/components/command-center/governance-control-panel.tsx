"use client";

import { useState } from "react";
import { AlertTriangle, Banknote, ClipboardCheck, Gavel, Loader2, LockKeyhole, PlayCircle, ShieldCheck, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mutationFetch } from "@/lib/client/mutation-fetch";
import type { GovernanceActionType, GovernanceApprovalRecord, GovernanceDashboard, GovernancePolicyResult } from "@/lib/governance/types";
import { cn } from "@/lib/utils";

type GovernanceControlPanelProps = {
  dashboard: GovernanceDashboard;
};

type GovernanceResponse = {
  ok?: boolean;
  result?: GovernancePolicyResult;
  policy?: GovernancePolicyResult;
  approval?: GovernanceApprovalRecord;
  queueJobId?: string;
  simulation?: { steps: string[]; liveExecution: boolean; costInr: number };
  error?: string;
  message?: string;
};

const actionOptions: GovernanceActionType[] = [
  "public_publish",
  "provider_execution",
  "live_workflow",
  "account_access",
  "automation_trigger",
  "media_render",
  "paid_tool",
  "provider_activation",
  "queue_live_mode",
  "retry_execution",
  "sandbox_test",
];

function statusClass(status: string) {
  if (status === "Blocked" || status === "blocked") return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  if (status === "Needs approval" || status === "needs_approval") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  if (status === "Configured" || status === "allowed") return "border-neon/25 bg-neon/10 text-neon";
  return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
}

function labelAction(action: string) {
  return action.replaceAll("_", " ");
}

export function GovernanceControlPanel({ dashboard }: GovernanceControlPanelProps) {
  const [actionType, setActionType] = useState<GovernanceActionType>("public_publish");
  const [objective, setObjective] = useState("Evaluate whether Folqen can safely execute this action.");
  const [estimatedCostInr, setEstimatedCostInr] = useState(0);
  const [pending, setPending] = useState<string | null>(null);
  const [response, setResponse] = useState<GovernanceResponse | null>(null);
  const [approvalQueue, setApprovalQueue] = useState(dashboard.approvalQueue);

  async function evaluatePolicy() {
    setPending("policy");
    setResponse(null);
    const result = await mutationFetch("/api/governance/policy/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionType,
        actorRole: "OPERATOR",
        approvalStatus: "pending",
        reviewStatus: "pending",
        safetyStatus: "pending",
        copyrightStatus: "unknown",
        estimatedCostInr,
        dryRun: true,
      }),
    });
    const payload = (await result.json().catch(() => ({ error: "Invalid governance response." }))) as GovernanceResponse;
    setPending(null);
    setResponse(payload);
  }

  async function requestApproval() {
    setPending("approval");
    setResponse(null);
    const result = await mutationFetch("/api/governance/approvals/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionType,
        title: `Governance approval: ${labelAction(actionType)}`,
        reason: objective,
        riskLevel: actionType === "public_publish" || actionType === "provider_activation" || actionType === "account_access" ? "CRITICAL" : "HIGH",
        payload: { estimatedCostInr, source: "approval_center_governance_panel" },
      }),
    });
    const payload = (await result.json().catch(() => ({ error: "Invalid approval response." }))) as GovernanceResponse;
    setPending(null);
    setResponse(payload);
    if (payload.approval) {
      setApprovalQueue((items) => [payload.approval!, ...items].slice(0, 10));
    }
  }

  async function runSandbox() {
    setPending("sandbox");
    setResponse(null);
    const result = await mutationFetch("/api/governance/sandbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionType: "sandbox_test",
        objective,
        providerId: actionType === "provider_execution" ? "openrouter" : undefined,
        estimatedCostInr,
      }),
    });
    const payload = (await result.json().catch(() => ({ error: "Invalid sandbox response." }))) as GovernanceResponse;
    setPending(null);
    setResponse(payload);
  }

  return (
    <section className="space-y-4">
      <Card className="border-neon/20 bg-black/30">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="premium">Governance Department</Badge>
                <Badge variant="warning">Dangerous actions gated</Badge>
                <Badge variant="info">Dry-run default</Badge>
                <Badge variant="safe">Audit-ready</Badge>
              </div>
              <CardTitle className="mt-3 flex items-center gap-2">
                <Gavel className="h-5 w-5 text-neon" />
                Governance, Approval & Safety Control Layer
              </CardTitle>
              <CardDescription>Policy engine, approval queue, role matrix, provider governance, cost controls, sandbox simulation, and compliance monitoring.</CardDescription>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              {dashboard.executionControls.map((control) => (
                <div key={control.id} className={cn("rounded-2xl border px-3 py-2", statusClass(control.status))}>
                  <div className="font-medium">{control.label}</div>
                  <div className="mt-1 opacity-80">{control.status}</div>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Execution policy simulator</CardTitle>
            <CardDescription>Evaluate risky actions before any department attempts live execution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_160px]">
              <label className="block space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Action type</span>
                <select
                  value={actionType}
                  onChange={(event) => setActionType(event.target.value as GovernanceActionType)}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-neon/60"
                >
                  {actionOptions.map((action) => (
                    <option key={action} value={action}>
                      {labelAction(action)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Cost INR</span>
                <input
                  value={estimatedCostInr}
                  onChange={(event) => setEstimatedCostInr(Number(event.target.value))}
                  type="number"
                  min={0}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-neon/60"
                />
              </label>
            </div>
            <label className="block space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Reason / objective</span>
              <textarea value={objective} onChange={(event) => setObjective(event.target.value)} className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={evaluatePolicy} disabled={Boolean(pending)}>
                {pending === "policy" ? <Loader2 className="h-4 w-4 animate-spin" /> : <SlidersHorizontal className="h-4 w-4" />}
                Evaluate policy
              </Button>
              <Button type="button" variant="secondary" onClick={requestApproval} disabled={Boolean(pending)}>
                {pending === "approval" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardCheck className="h-4 w-4" />}
                Request approval
              </Button>
              <Button type="button" variant="ghost" onClick={runSandbox} disabled={Boolean(pending)}>
                {pending === "sandbox" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                Sandbox test
              </Button>
            </div>
            {response ? (
              <div className={cn("rounded-2xl border p-4", statusClass(response.error ? "Blocked" : response.result?.decision ?? response.policy?.decision ?? "Configured"))}>
                <div className="font-medium">{response.error ? "Governance action blocked" : "Governance result captured"}</div>
                <p className="mt-1 text-sm leading-6 opacity-85">
                  {response.error ?? response.message ?? response.result?.reasons[0] ?? response.policy?.reasons[0] ?? `Queue job: ${response.queueJobId ?? "pending"}`}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval queue</CardTitle>
            <CardDescription>Human-in-the-loop gates for provider activation, publishing, paid tools, rendering, and automation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {approvalQueue.length ? (
              approvalQueue.slice(0, 8).map((approval) => (
                <div key={approval.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{approval.type}</div>
                      <div className="mt-1 text-sm font-medium">{approval.title}</div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{approval.reason}</p>
                    </div>
                    <Badge className={statusClass(approval.status === "PENDING" ? "Needs approval" : approval.status)}>{approval.status}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">No pending governance approvals. Requests created here will appear in the real approval table when the database is available.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-neon" />
              Cost governance
            </CardTitle>
            <CardDescription>Budget-aware execution for low-cost Folqen operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="font-mono text-3xl text-neon">₹{dashboard.costGovernance.estimatedUsedInr}</div>
              <p className="mt-1 text-xs text-muted-foreground">Used of ₹{dashboard.costGovernance.monthlyBudgetInr} monthly budget</p>
            </div>
            {dashboard.costGovernance.quotas.map((quota) => (
              <div key={quota.id} className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span>{quota.label}</span>
                  <Badge className={statusClass(quota.status)}>{quota.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {quota.used} / {quota.limit}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-neon" />
              Provider governance
            </CardTitle>
            <CardDescription>Provider access stays blocked until approval and credentials exist.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboard.providerGovernance.map((provider) => (
              <div key={provider.providerId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{provider.providerId}</span>
                  <Badge className={statusClass(provider.status)}>{provider.status}</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">Blocked: {provider.blockedActions.join(", ")}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-neon" />
              Compliance monitor
            </CardTitle>
            <CardDescription>Audit, incident escalation, sandbox, and policy violation visibility.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="font-mono text-2xl text-neon">{dashboard.audit.policyViolations}</div>
                <p className="text-xs text-muted-foreground">Policy blocks</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="font-mono text-2xl text-amber-100">{dashboard.audit.escalations}</div>
                <p className="text-xs text-muted-foreground">Escalations</p>
              </div>
            </div>
            <div className="rounded-2xl border border-neon/20 bg-neon/[0.04] p-3 text-sm">
              Sandbox: {dashboard.sandbox.mode}, providers {dashboard.sandbox.providers}, live execution {dashboard.sandbox.liveExecution}
            </div>
            {dashboard.audit.recentEvents.slice(0, 4).map((event) => (
              <div key={event.id} className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-muted-foreground">
                <span className="text-foreground">{event.action}</span> · {event.riskLevel}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-300/15 bg-amber-300/[0.04]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-200" />
            Role and permission matrix
          </CardTitle>
          <CardDescription>Governance roles define who can request, review, escalate, revoke, and sandbox actions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.roleMatrix.map((role) => (
            <div key={role.role} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{role.role}</div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{role.permissions.join(", ")}</p>
              <p className="mt-2 text-xs leading-5 text-amber-100/80">{role.restrictions[0]}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
