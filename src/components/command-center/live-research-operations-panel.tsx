"use client";

import { useMemo, useState } from "react";
import { Activity, BrainCircuit, Loader2, PlayCircle, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mutationFetch } from "@/lib/client/mutation-fetch";
import { liveResearchWorkflowKinds, liveResearchWorkflowLabels, type LiveResearchWorkflowKind, type ResearchOperationalOutput } from "@/lib/live-execution/research-operations";
import { toHonestStatus } from "@/lib/status-semantics";
import type { ControlledLiveExecutionResult, LiveExecutionDashboard } from "@/lib/live-execution/types";
import { cn } from "@/lib/utils";

type LiveResearchOperationsPanelProps = {
  liveExecution: LiveExecutionDashboard;
};

type LiveResearchResponse = {
  ok?: boolean;
  result?: ControlledLiveExecutionResult;
  error?: string;
  message?: string;
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

export function LiveResearchOperationsPanel({ liveExecution }: LiveResearchOperationsPanelProps) {
  const [workflowKind, setWorkflowKind] = useState<LiveResearchWorkflowKind>("trend_analysis");
  const [objective, setObjective] = useState("Analyze India-relevant urban legend and mystery trends for safe short-form content strategy.");
  const [approvalId, setApprovalId] = useState("");
  const [topics, setTopics] = useState("haunted forts in India, cursed objects folklore, mystery documentary shorts");
  const [competitors, setCompetitors] = useState("");
  const [audienceNotes, setAudienceNotes] = useState("Audience prefers source-aware local mystery, short cold opens, clear fact-vs-legend framing.");
  const [sources, setSources] = useState("");
  const [pending, setPending] = useState(false);
  const [response, setResponse] = useState<LiveResearchResponse | null>(null);

  const structured = response?.result?.structuredOutput as ResearchOperationalOutput | undefined;
  const selectedLabel = useMemo(() => liveResearchWorkflowLabels[workflowKind], [workflowKind]);

  async function runLiveResearch() {
    setPending(true);
    setResponse(null);
    const request = await mutationFetch("/api/live-execution/research/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        researchWorkflowKind: workflowKind,
        objective,
        approvalId: approvalId || undefined,
        seedTopics: splitLines(topics),
        competitors: splitLines(competitors),
        audienceNotes: splitLines(audienceNotes),
        sourceReferences: splitLines(sources),
        maxOutputTokens: 650,
      }),
    });
    const payload = (await request.json().catch(() => ({ error: "Invalid live Research response." }))) as LiveResearchResponse;
    setResponse(payload);
    setPending(false);
  }

  return (
    <Card className="border-neon/20 bg-black/30">
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="premium">
            <BrainCircuit className="h-3.5 w-3.5" />
            Governed Live Research
          </Badge>
          <Badge variant="warning">Gemini only</Badge>
          <Badge variant="safe">No publishing</Badge>
          <Badge variant="info">Memory-aware</Badge>
        </div>
        <CardTitle className="mt-3">Operational Intelligence Workflows</CardTitle>
        <CardDescription>Approved Research Department workflows with structured outputs, memory retrieval, scoring, execution traces, and strict rollback controls.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <label className="block space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Research workflow</span>
              <select value={workflowKind} onChange={(event) => setWorkflowKind(event.target.value as LiveResearchWorkflowKind)} className="h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-neon/60">
                {liveResearchWorkflowKinds.filter((kind) => kind !== "content_ideation").map((kind) => (
                  <option key={kind} value={kind}>
                    {liveResearchWorkflowLabels[kind]}
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

          <div className="grid gap-3 md:grid-cols-2">
            <textarea aria-label="Seed topics" value={topics} onChange={(event) => setTopics(event.target.value)} className="min-h-20 rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
            <textarea aria-label="Competitors" value={competitors} onChange={(event) => setCompetitors(event.target.value)} placeholder="Competitors or creator references" className="min-h-20 rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
            <textarea aria-label="Audience notes" value={audienceNotes} onChange={(event) => setAudienceNotes(event.target.value)} className="min-h-20 rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
            <textarea aria-label="Source references" value={sources} onChange={(event) => setSources(event.target.value)} placeholder="Manual sources, URLs, files, or notes" className="min-h-20 rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={runLiveResearch} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              Run governed workflow
            </Button>
            <div className={cn("rounded-2xl border px-3 py-2 text-xs", statusClass(toHonestStatus(liveExecution.readiness.status)))}>
              {toHonestStatus(liveExecution.readiness.status)}: {liveExecution.readiness.reasons[0] ?? "All gates ready."}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <ShieldCheck className="mb-2 h-4 w-4 text-neon" />
              <div className="text-sm font-medium">Governance</div>
              <p className="mt-1 text-xs text-muted-foreground">Approval, budget, provider, and kill-switch checks run before every request.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <Activity className="mb-2 h-4 w-4 text-neon" />
              <div className="text-sm font-medium">Observability</div>
              <p className="mt-1 text-xs text-muted-foreground">Tracks trace, latency, token use, memory utilization, quality, and duplicate signals.</p>
            </div>
          </div>

          {response ? (
            <div className={cn("rounded-2xl border p-4", statusClass(toHonestStatus(response.result?.status ?? "blocked")))}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{response.error ? "Workflow blocked" : selectedLabel}</span>
                <Badge className={statusClass(toHonestStatus(response.result?.status ?? "blocked"))}>{toHonestStatus(response.result?.status ?? "blocked")}</Badge>
                {response.result?.researchScore ? <Badge className={statusClass(response.result.researchScore.acceptance)}>score {response.result.researchScore.qualityScore}</Badge> : null}
              </div>
              <p className="mt-2 text-sm leading-6 opacity-85">{response.error ?? response.message ?? response.result?.validation.warnings[0] ?? structured?.summary}</p>
              {structured ? (
                <div className="mt-3 space-y-2">
                  {structured.insights.slice(0, 3).map((item) => (
                    <div key={item.title} className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium">{item.title}</span>
                        <span className="font-mono text-xs text-neon">{item.confidence}</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 opacity-80">{item.evidence}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">Run a governed workflow to inspect structured intelligence, memory usage, and quality scoring.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
