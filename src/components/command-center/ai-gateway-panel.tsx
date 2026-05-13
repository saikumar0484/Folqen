"use client";

import { useState } from "react";
import { Activity, AlertTriangle, BrainCircuit, Coins, Cpu, Loader2, PauseCircle, PlayCircle, RotateCcw, ShieldCheck, Siren, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mutationFetch } from "@/lib/client/mutation-fetch";
import type { AiGatewayDashboard, AiRuntimeResult } from "@/lib/ai-gateway/types";
import type { ControlledLiveExecutionResult, LiveExecutionDashboard } from "@/lib/live-execution/types";
import { cn } from "@/lib/utils";

type AiGatewayPanelProps = {
  dashboard: AiGatewayDashboard;
  liveExecution: LiveExecutionDashboard;
};

type ExecuteResponse = {
  ok?: boolean;
  result?: AiRuntimeResult;
  retryRun?: AiRuntimeResult;
  error?: string;
  message?: string;
};

type LiveResponse = {
  ok?: boolean;
  result?: ControlledLiveExecutionResult;
  readiness?: LiveExecutionDashboard["readiness"];
  record?: unknown;
  registry?: unknown;
  approvalId?: string;
  error?: string;
  message?: string;
};

function statusClass(status: string) {
  if (status === "Blocked" || status === "blocked" || status === "failed_validation") return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  if (status === "Needs approval" || status === "waiting_for_approval") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  if (status === "Configured" || status === "completed_mock") return "border-neon/25 bg-neon/10 text-neon";
  return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
}

function getTopicSuggestions(output: ControlledLiveExecutionResult["structuredOutput"]) {
  if (!output || typeof output !== "object" || !("topicSuggestions" in output) || !Array.isArray(output.topicSuggestions)) return [];
  return output.topicSuggestions as Array<{ topic?: string; hook?: string; confidence?: number }>;
}

export function AiGatewayPanel({ dashboard, liveExecution }: AiGatewayPanelProps) {
  const [objective, setObjective] = useState("Generate a source-aware mystery content strategy outline without using paid providers.");
  const [provider, setProvider] = useState("mock");
  const [activationApprovalId, setActivationApprovalId] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [response, setResponse] = useState<ExecuteResponse | null>(null);
  const [liveResponse, setLiveResponse] = useState<LiveResponse | null>(null);
  const [liveRuns, setLiveRuns] = useState(liveExecution.recentRuns);
  const [executions, setExecutions] = useState(dashboard.recentExecutions);

  async function executeDryRun() {
    setPending("execute");
    setResponse(null);
    const request = await mutationFetch("/api/ai-gateway/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflowKind: "structured_generation",
        objective,
        taskType: "structured_output",
        preferredProviders: [provider],
        fallbackProviders: ["mock", "ollama_local", "gemini", "openrouter", "claude", "openai_compatible"],
        expectedOutput: "json",
        responseSchema: { required: ["objective", "workflowKind", "providerId", "recommendations", "safety"] },
        budgetInr: 50,
        monthlyBudgetInr: 1000,
        approvalStatus: "pending",
        dryRun: true,
        sandbox: true,
      }),
    });
    const payload = (await request.json().catch(() => ({ error: "Invalid AI gateway response." }))) as ExecuteResponse;
    setPending(null);
    setResponse(payload);
    if (payload.result) setExecutions((items) => [payload.result!, ...items].slice(0, 8));
  }

  async function retryLatest() {
    const latest = executions[0];
    if (!latest) return;
    setPending("retry");
    setResponse(null);
    const request = await mutationFetch("/api/ai-gateway/retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: latest.runId,
        reason: "Retry through the fallback recovery planner after a dry-run review.",
        preferredProviders: ["mock"],
      }),
    });
    const payload = (await request.json().catch(() => ({ error: "Invalid AI retry response." }))) as ExecuteResponse;
    setPending(null);
    setResponse(payload);
    if (payload.retryRun) setExecutions((items) => [payload.retryRun!, ...items].slice(0, 8));
  }

  async function requestActivation() {
    setPending("request-activation");
    setLiveResponse(null);
    const request = await mutationFetch("/api/live-execution/activation/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        providerId: "gemini",
        requestedStage: 1,
        reason: "Request Stage 1 controlled Gemini activation for Research Department content ideation with strict budget and rollback gates.",
      }),
    });
    const payload = (await request.json().catch(() => ({ error: "Invalid activation response." }))) as LiveResponse;
    setPending(null);
    setLiveResponse(payload);
  }

  async function promoteSandbox() {
    setPending("promote");
    setLiveResponse(null);
    const request = await mutationFetch("/api/live-execution/promote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objective,
        providerId: "gemini",
        departmentId: "research",
        workflowKind: "structured_generation",
        taskType: "planning",
        approvalId: activationApprovalId || undefined,
        maxOutputTokens: 400,
      }),
    });
    const payload = (await request.json().catch(() => ({ error: "Invalid promotion response." }))) as LiveResponse;
    setPending(null);
    setLiveResponse(payload);
  }

  async function executeControlledLive() {
    setPending("controlled-live");
    setLiveResponse(null);
    const request = await mutationFetch("/api/live-execution/research/ideation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objective,
        approvalId: activationApprovalId || undefined,
        maxOutputTokens: 400,
      }),
    });
    const payload = (await request.json().catch(() => ({ error: "Invalid controlled execution response." }))) as LiveResponse;
    setPending(null);
    setLiveResponse(payload);
    if (payload.result) setLiveRuns((items) => [payload.result!, ...items].slice(0, 8));
  }

  async function emergencyStop() {
    setPending("emergency-stop");
    setLiveResponse(null);
    const request = await mutationFetch("/api/live-execution/emergency-stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Operator engaged emergency stop from the AI gateway control panel." }),
    });
    const payload = (await request.json().catch(() => ({ error: "Invalid emergency stop response." }))) as LiveResponse;
    setPending(null);
    setLiveResponse(payload);
  }

  return (
    <section className="space-y-4">
      <Card className="border-neon/20 bg-black/30">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="premium">AI Provider Gateway</Badge>
                <Badge variant="info">Mock runtime default</Badge>
                <Badge variant="warning">Providers gated</Badge>
                <Badge variant="safe">Budget-aware</Badge>
              </div>
              <CardTitle className="mt-3 flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-neon" />
                AI Execution Runtime
              </CardTitle>
              <CardDescription>Unified provider routing, fallback planning, token and cost estimates, response validation, queue observability, and governance enforcement.</CardDescription>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              {dashboard.controls.slice(0, 4).map((control) => (
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
            <CardTitle>Runtime simulator</CardTitle>
            <CardDescription>Plan an AI execution without calling providers, spending money, or using credentials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <label className="block space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Objective</span>
                <textarea value={objective} onChange={(event) => setObjective(event.target.value)} className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
              </label>
              <label className="block space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Preferred provider</span>
                <select value={provider} onChange={(event) => setProvider(event.target.value)} className="h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-neon/60">
                  {dashboard.providers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-muted-foreground">
                  External providers stay blocked. The runtime routes to mock unless a future approval, budget gate, and provider adapter explicitly allow live execution.
                </div>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={executeDryRun} disabled={Boolean(pending)}>
                {pending === "execute" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                Run dry-run
              </Button>
              <Button type="button" variant="secondary" onClick={retryLatest} disabled={Boolean(pending) || executions.length === 0}>
                {pending === "retry" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                Retry latest
              </Button>
            </div>
            {response ? (
              <div className={cn("rounded-2xl border p-4", statusClass(response.error ? "Blocked" : response.result?.status ?? response.retryRun?.status ?? "Mock"))}>
                <div className="font-medium">{response.error ? "Runtime request blocked" : "Runtime trace captured"}</div>
                <p className="mt-1 text-sm leading-6 opacity-85">
                  {response.error ?? response.message ?? response.result?.mockResponse.content ?? response.retryRun?.mockResponse.content}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Provider health</CardTitle>
            <CardDescription>Status-aware adapters for cloud, compatible, and local providers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.providers.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{item.category}</div>
                    <div className="mt-1 text-sm font-medium">{item.label}</div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.notes[0]}</p>
                  </div>
                  <Badge className={statusClass(item.status)}>{item.status}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-2">
                    <div className="text-muted-foreground">Latency</div>
                    <div className="font-mono text-neon">{item.health.latencyMs}ms</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-2">
                    <div className="text-muted-foreground">Concurrency</div>
                    <div className="font-mono text-neon">{item.maxConcurrency}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-2">
                    <div className="text-muted-foreground">Live</div>
                    <div className="font-mono text-rose-100">{item.liveExecutionEnabled ? "on" : "off"}</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-300/20 bg-amber-300/[0.04]">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="warning">Controlled Live Activation</Badge>
                <Badge variant="info">Sandbox-first</Badge>
                <Badge variant="safe">Rollback ready</Badge>
                <Badge variant="warning">Gemini / Research only</Badge>
              </div>
              <CardTitle className="mt-3 flex items-center gap-2">
                <Siren className="h-5 w-5 text-amber-200" />
                Live Execution Activation Layer
              </CardTitle>
              <CardDescription>Stage-gated activation for exactly one provider, one department, and one workflow. Defaults stay blocked until approval, budget, credential, kill-switch, and sandbox checks pass.</CardDescription>
            </div>
            <div className={cn("rounded-2xl border px-4 py-3 text-sm", statusClass(liveExecution.firstTarget.status))}>
              <div className="font-mono text-[10px] uppercase tracking-widest">First target</div>
              <div className="mt-1 font-medium">
                {liveExecution.firstTarget.providerId} / {liveExecution.firstTarget.departmentId}
              </div>
              <div className="mt-1 text-xs opacity-80">{liveExecution.firstTarget.status}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-5">
            {liveExecution.activationStages.map((stage) => (
              <div key={stage.stage} className={cn("rounded-2xl border p-3", statusClass(stage.status))}>
                <div className="font-mono text-[10px] uppercase tracking-widest">Stage {stage.stage}</div>
                <div className="mt-1 text-sm font-medium">{stage.label}</div>
                <p className="mt-2 text-xs leading-5 opacity-80">{stage.description}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
            <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <label className="mb-3 block space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Approved activation ID</span>
                <input
                  value={activationApprovalId}
                  onChange={(event) => setActivationApprovalId(event.target.value)}
                  placeholder="Paste an approved live_execution.provider_activation approval ID"
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-neon/60"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={requestActivation} disabled={Boolean(pending)}>
                  {pending === "request-activation" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Request activation
                </Button>
                <Button type="button" variant="ghost" onClick={promoteSandbox} disabled={Boolean(pending)}>
                  {pending === "promote" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                  Promote sandbox
                </Button>
                <Button type="button" onClick={executeControlledLive} disabled={Boolean(pending)}>
                  {pending === "controlled-live" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Gated live test
                </Button>
                <Button type="button" variant="danger" onClick={emergencyStop} disabled={Boolean(pending)}>
                  {pending === "emergency-stop" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PauseCircle className="h-4 w-4" />}
                  Emergency stop
                </Button>
              </div>
              {liveResponse ? (
                <div className={cn("mt-4 rounded-2xl border p-4", statusClass(liveResponse.error ? "Blocked" : liveResponse.result?.status ?? liveResponse.readiness?.status ?? "Needs approval"))}>
                  <div className="font-medium">{liveResponse.error ? "Live control blocked" : "Live control recorded"}</div>
                  <p className="mt-1 text-sm leading-6 opacity-85">
                    {liveResponse.error ?? liveResponse.message ?? liveResponse.result?.validation.warnings[0] ?? liveResponse.readiness?.reasons[0] ?? "Activation control updated."}
                  </p>
                  {getTopicSuggestions(liveResponse.result?.structuredOutput).length ? (
                    <div className="mt-3 grid gap-2">
                      {getTopicSuggestions(liveResponse.result?.structuredOutput).slice(0, 3).map((item, index) => (
                        <div key={`${item.topic ?? "topic"}-${index}`} className="rounded-xl border border-white/10 bg-black/25 p-3 text-xs">
                          <div className="font-medium text-sm">{item.topic ?? "Untitled topic"}</div>
                          <div className="mt-1 opacity-85">{item.hook ?? "No hook returned."}</div>
                          <div className="mt-1 font-mono text-neon">confidence {item.confidence ?? 0}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-muted-foreground">
                Readiness: {liveExecution.readiness.status}. {liveExecution.readiness.reasons[0] ?? "All live activation gates are currently satisfied."}
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-neon" />
                  <div className="text-sm font-medium">Live budget guard</div>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Today INR {liveExecution.budget.estimatedCostTodayInr} / {liveExecution.budget.maxDailyCostInr}; month INR {liveExecution.budget.estimatedCostThisMonthInr} / {liveExecution.budget.maxMonthlyCostInr}; requests {liveExecution.budget.requestsToday} / {liveExecution.budget.maxRequestsPerDay}.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-200" />
                  <div className="text-sm font-medium">Rollback controls</div>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Kill switch {liveExecution.rollback.killSwitch}; emergency stop {liveExecution.rollback.emergencyStop}; queue drain {liveExecution.rollback.queueDrain}; quarantine {liveExecution.rollback.providerQuarantine}.
                </p>
              </div>
              {liveRuns.slice(0, 3).map((run) => (
                <div key={run.runId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{run.providerId} controlled run</span>
                    <Badge className={statusClass(run.status)}>{run.status.replaceAll("_", " ")}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{run.readiness.reasons[0] ?? "Execution completed under controls."}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-neon" />
              Budget monitor
            </CardTitle>
            <CardDescription>Token and cost estimates before any provider can run.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="font-mono text-3xl text-neon">INR {dashboard.budget.estimatedCostInr}</div>
              <p className="mt-1 text-xs text-muted-foreground">Estimated for current mock health check</p>
            </div>
            {dashboard.budget.quotas.map((quota) => (
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
              <Activity className="h-4 w-4 text-neon" />
              Execution traces
            </CardTitle>
            <CardDescription>Latency, fallback, retry, validation, and cost events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {executions.length ? (
              executions.map((run) => (
                <div key={run.runId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{run.provider.label}</div>
                      <div className="mt-1 text-sm font-medium">{run.workflowKind.replaceAll("_", " ")}</div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {run.observability.estimatedTokens.total} tokens estimated | INR {run.observability.estimatedCostInr}
                      </p>
                    </div>
                    <Badge className={statusClass(run.status)}>{run.status.replaceAll("_", " ")}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">No AI runtime traces yet. Run a dry-run simulation to create one.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-neon" />
              Runtime controls
            </CardTitle>
            <CardDescription>Execution policy, sandbox, fallback routing, and queue state.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-neon/20 bg-neon/[0.04] p-3">
                <Cpu className="mb-2 h-4 w-4 text-neon" />
                <div className="text-sm font-medium">Sandbox</div>
                <p className="text-xs text-muted-foreground">{dashboard.observability.sandboxExecution}</p>
              </div>
              <div className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.04] p-3">
                <Zap className="mb-2 h-4 w-4 text-rose-100" />
                <div className="text-sm font-medium">Live providers</div>
                <p className="text-xs text-muted-foreground">{dashboard.observability.liveProviderExecution}</p>
              </div>
            </div>
            {dashboard.queueHealth.map((queue) => (
              <div key={queue.name} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{queue.name}</span>
                  <Badge className={statusClass(queue.status)}>{queue.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  waiting {queue.waiting} | active {queue.active} | failed {queue.failed}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
