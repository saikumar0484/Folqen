"use client";

import { useMemo, useState } from "react";
import { Activity, BarChart3, BrainCircuit, Loader2, PlayCircle, ShieldCheck, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mutationFetch } from "@/lib/client/mutation-fetch";
import { analyticsDataSourceKinds, liveAnalyticsWorkflowKinds, liveAnalyticsWorkflowLabels, type AnalyticsDataSourceKind, type AnalyticsOperationalOutput, type LiveAnalyticsWorkflowKind } from "@/lib/live-execution/analytics-operations";
import type { ControlledLiveExecutionResult, LiveExecutionDashboard } from "@/lib/live-execution/types";
import { cn } from "@/lib/utils";

type LiveAnalyticsOperationsPanelProps = {
  liveExecution: LiveExecutionDashboard;
};

type LiveAnalyticsResponse = {
  ok?: boolean;
  result?: ControlledLiveExecutionResult;
  error?: string;
  message?: string;
};

const sourceLabels: Record<AnalyticsDataSourceKind, string> = {
  mock_ingestion: "Mock ingestion",
  future_youtube_hook: "YouTube future hook",
  future_instagram_hook: "Instagram future hook",
  workflow_analytics: "Workflow analytics",
  internal_execution_metrics: "Internal execution metrics",
};

function statusClass(status: string) {
  if (status === "completed_live" || status === "passed" || status === "accepted") return "border-neon/25 bg-neon/10 text-neon";
  if (status === "waiting_for_approval" || status === "warning" || status === "Needs approval") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  if (status === "failed" || status === "blocked" || status === "rejected") return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  return "border-white/10 bg-white/[0.04] text-muted-foreground";
}

function splitLines(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function LiveAnalyticsOperationsPanel({ liveExecution }: LiveAnalyticsOperationsPanelProps) {
  const [workflowKind, setWorkflowKind] = useState<LiveAnalyticsWorkflowKind>("content_performance_analysis");
  const [objective, setObjective] = useState("Interpret recent mock/internal performance signals and produce governed optimization recommendations for mystery folklore shorts.");
  const [approvalId, setApprovalId] = useState("");
  const [signals, setSignals] = useState("CTR 4.8 percent on folklore hook test, retention drop at 18 seconds, comments mention wanting source context, render workflow failed twice last week");
  const [sources, setSources] = useState("Manual analytics note, workflow telemetry snapshot, previous content package review");
  const [platforms, setPlatforms] = useState("YOUTUBE_SHORTS, INSTAGRAM_REELS, THREADS");
  const [dataSources, setDataSources] = useState<AnalyticsDataSourceKind[]>(["mock_ingestion", "workflow_analytics", "internal_execution_metrics"]);
  const [pending, setPending] = useState(false);
  const [response, setResponse] = useState<LiveAnalyticsResponse | null>(null);

  const structured = response?.result?.structuredOutput as AnalyticsOperationalOutput | undefined;
  const selectedLabel = useMemo(() => liveAnalyticsWorkflowLabels[workflowKind], [workflowKind]);

  function toggleSource(source: AnalyticsDataSourceKind) {
    setDataSources((current) => (current.includes(source) ? current.filter((item) => item !== source) : [...current, source]));
  }

  async function runLiveAnalytics() {
    setPending(true);
    setResponse(null);
    const request = await mutationFetch("/api/live-execution/analytics/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analyticsWorkflowKind: workflowKind,
        objective,
        approvalId: approvalId || undefined,
        analyticsSignals: splitLines(signals),
        sourceReferences: splitLines(sources),
        platformTargets: splitLines(platforms),
        analyticsDataSources: dataSources.length ? dataSources : ["mock_ingestion"],
        maxOutputTokens: 720,
      }),
    });
    const payload = (await request.json().catch(() => ({ error: "Invalid live Analytics response." }))) as LiveAnalyticsResponse;
    setResponse(payload);
    setPending(false);
  }

  return (
    <Card className="border-neon/20 bg-black/30">
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="premium">
            <BarChart3 className="h-3.5 w-3.5" />
            Governed Live Analytics
          </Badge>
          <Badge variant="warning">Gemini only</Badge>
          <Badge variant="info">Mock/internal data</Badge>
          <Badge variant="safe">No autonomous optimization</Badge>
        </div>
        <CardTitle className="mt-3">Analytics Intelligence & Feedback Loop</CardTitle>
        <CardDescription>Approval-gated Analytics Department workflows for performance interpretation, memory-aware recommendations, reflection, and confidence scoring.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <label className="block space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Analytics workflow</span>
              <select value={workflowKind} onChange={(event) => setWorkflowKind(event.target.value as LiveAnalyticsWorkflowKind)} className="h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-neon/60">
                {liveAnalyticsWorkflowKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {liveAnalyticsWorkflowLabels[kind]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Approval ID</span>
              <input value={approvalId} onChange={(event) => setApprovalId(event.target.value)} placeholder="Approved activation ID" className="h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-neon/60" />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Objective</span>
            <textarea value={objective} onChange={(event) => setObjective(event.target.value)} className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
          </label>

          <div className="flex flex-wrap gap-2">
            {analyticsDataSourceKinds.map((source) => (
              <button key={source} type="button" onClick={() => toggleSource(source)} className={cn("rounded-full border px-3 py-1.5 text-xs transition", dataSources.includes(source) ? "border-neon/40 bg-neon/10 text-neon" : "border-white/10 bg-white/[0.03] text-muted-foreground")}>
                {sourceLabels[source]}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <textarea aria-label="Analytics signals" value={signals} onChange={(event) => setSignals(event.target.value)} className="min-h-28 rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
            <textarea aria-label="Analytics source references" value={sources} onChange={(event) => setSources(event.target.value)} className="min-h-28 rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
            <textarea aria-label="Analytics platform scope" value={platforms} onChange={(event) => setPlatforms(event.target.value)} className="min-h-28 rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={runLiveAnalytics} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              Run governed analytics workflow
            </Button>
            <div className={cn("rounded-2xl border px-3 py-2 text-xs", statusClass(liveExecution.readiness.status))}>
              {liveExecution.readiness.status}: {liveExecution.readiness.reasons[0] ?? "All gates ready."}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <ShieldCheck className="mb-2 h-4 w-4 text-neon" />
              <div className="text-sm font-medium">Recommendation Only</div>
              <p className="mt-1 text-xs text-muted-foreground">Publishing, prompt mutation, workflow mutation, platform APIs, and autonomous optimization stay blocked.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <Activity className="mb-2 h-4 w-4 text-neon" />
              <div className="text-sm font-medium">Feedback Trace</div>
              <p className="mt-1 text-xs text-muted-foreground">Captures retrieval usage, confidence, latency class, quality scores, and approval state.</p>
            </div>
          </div>

          {response ? (
            <div className={cn("rounded-2xl border p-4", statusClass(response.result?.status ?? "blocked"))}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{response.error ? "Workflow blocked" : selectedLabel}</span>
                <Badge className={statusClass(response.result?.status ?? "blocked")}>{response.result?.status?.replaceAll("_", " ") ?? "blocked"}</Badge>
                {response.result?.analyticsScore ? <Badge className={statusClass(response.result.analyticsScore.acceptance)}>score {response.result.analyticsScore.qualityScore}</Badge> : null}
              </div>
              <p className="mt-2 text-sm leading-6 opacity-85">{response.error ?? response.message ?? response.result?.validation.warnings[0] ?? structured?.report.summary}</p>
              {structured ? (
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <TrendingUp className="mb-2 h-3.5 w-3.5 text-neon" />
                      <div className="font-mono text-lg text-neon">{structured.scoring.analyticsQualityScore}</div>
                      <div className="text-[11px] text-muted-foreground">quality</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <BrainCircuit className="mb-2 h-3.5 w-3.5 text-neon" />
                      <div className="font-mono text-lg text-neon">{structured.scoring.optimizationConfidenceScore}</div>
                      <div className="text-[11px] text-muted-foreground">optimization</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <Activity className="mb-2 h-3.5 w-3.5 text-neon" />
                      <div className="font-mono text-lg text-neon">{structured.observability.memoryItemsUsed}</div>
                      <div className="text-[11px] text-muted-foreground">memory items</div>
                    </div>
                  </div>
                  {structured.optimizationRecommendations.slice(0, 3).map((item) => (
                    <div key={`${item.recommendation.slice(0, 32)}-${item.confidence}`} className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium">{item.recommendation}</span>
                        <span className="font-mono text-xs text-neon">{item.confidence}</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 opacity-80">{item.rationale}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">Run a governed workflow to inspect analytics reasoning, feedback-loop scoring, recommendations, and trace output.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
