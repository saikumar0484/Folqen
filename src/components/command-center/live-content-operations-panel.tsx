"use client";

import { useMemo, useState } from "react";
import { Activity, FileText, Loader2, PlayCircle, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mutationFetch } from "@/lib/client/mutation-fetch";
import { contentPlatformTargets, liveContentWorkflowKinds, liveContentWorkflowLabels, type ContentOperationalOutput, type ContentPlatformTarget, type LiveContentWorkflowKind } from "@/lib/live-execution/content-operations";
import type { ControlledLiveExecutionResult, LiveExecutionDashboard } from "@/lib/live-execution/types";
import { toHonestStatus } from "@/lib/status-semantics";
import { cn } from "@/lib/utils";

type LiveContentOperationsPanelProps = {
  liveExecution: LiveExecutionDashboard;
};

type LiveContentResponse = {
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

export function LiveContentOperationsPanel({ liveExecution }: LiveContentOperationsPanelProps) {
  const [workflowKind, setWorkflowKind] = useState<LiveContentWorkflowKind>("hook_generation");
  const [objective, setObjective] = useState("Create source-aware short-form content drafts for an India-focused mystery folklore topic.");
  const [approvalId, setApprovalId] = useState("");
  const [topics, setTopics] = useState("haunted stepwell legend, cursed fort rumor, unsolved folklore mystery");
  const [audienceNotes, setAudienceNotes] = useState("Use a sharp cold open, avoid fake certainty, keep a documentary mystery tone, and mark legend versus verified history.");
  const [sources, setSources] = useState("");
  const [platformTargetsState, setPlatformTargetsState] = useState<ContentPlatformTarget[]>(["YOUTUBE_SHORTS", "INSTAGRAM_REELS", "THREADS"]);
  const [pending, setPending] = useState(false);
  const [response, setResponse] = useState<LiveContentResponse | null>(null);

  const structured = response?.result?.structuredOutput as ContentOperationalOutput | undefined;
  const selectedLabel = useMemo(() => liveContentWorkflowLabels[workflowKind], [workflowKind]);

  function togglePlatform(platform: ContentPlatformTarget) {
    setPlatformTargetsState((current) => (current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform]));
  }

  async function runLiveContent() {
    setPending(true);
    setResponse(null);
    const request = await mutationFetch("/api/live-execution/content/workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contentWorkflowKind: workflowKind,
        objective,
        approvalId: approvalId || undefined,
        seedTopics: splitLines(topics),
        audienceNotes: splitLines(audienceNotes),
        sourceReferences: splitLines(sources),
        platformTargets: platformTargetsState.length ? platformTargetsState : ["YOUTUBE_SHORTS"],
        maxOutputTokens: 700,
      }),
    });
    const payload = (await request.json().catch(() => ({ error: "Invalid live Content response." }))) as LiveContentResponse;
    setResponse(payload);
    setPending(false);
  }

  return (
    <Card className="border-neon/20 bg-black/30">
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="premium">
            <Sparkles className="h-3.5 w-3.5" />
            Governed Live Content
          </Badge>
          <Badge variant="warning">Gemini only</Badge>
          <Badge variant="safe">No publishing</Badge>
          <Badge variant="info">No rendering</Badge>
        </div>
        <CardTitle className="mt-3">Content Intelligence Workflows</CardTitle>
        <CardDescription>Approval-gated Content Department workflows for hooks, scripts, captions, metadata, thumbnail strategy, platform adaptation, reflection, and scoring.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <label className="block space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Content workflow</span>
              <select value={workflowKind} onChange={(event) => setWorkflowKind(event.target.value as LiveContentWorkflowKind)} className="h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-neon/60">
                {liveContentWorkflowKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {liveContentWorkflowLabels[kind]}
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
            {contentPlatformTargets.map((platform) => (
              <button key={platform} type="button" onClick={() => togglePlatform(platform)} className={cn("rounded-full border px-3 py-1.5 text-xs transition", platformTargetsState.includes(platform) ? "border-neon/40 bg-neon/10 text-neon" : "border-white/10 bg-white/[0.03] text-muted-foreground")}>
                {platform.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <textarea aria-label="Content topics" value={topics} onChange={(event) => setTopics(event.target.value)} className="min-h-24 rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
            <textarea aria-label="Audience and style notes" value={audienceNotes} onChange={(event) => setAudienceNotes(event.target.value)} className="min-h-24 rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
            <textarea aria-label="Source references" value={sources} onChange={(event) => setSources(event.target.value)} placeholder="Manual sources, files, URLs, research run IDs" className="min-h-24 rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={runLiveContent} disabled={pending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              Run governed content workflow
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
              <div className="text-sm font-medium">Gated Drafts</div>
              <p className="mt-1 text-xs text-muted-foreground">Every request keeps publishing, platform execution, rendering, and media generation blocked.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <Activity className="mb-2 h-4 w-4 text-neon" />
              <div className="text-sm font-medium">Content Trace</div>
              <p className="mt-1 text-xs text-muted-foreground">Captures generation trace, token use, latency, memory utilization, score, and approval state.</p>
            </div>
          </div>

          {response ? (
            <div className={cn("rounded-2xl border p-4", statusClass(toHonestStatus(response.result?.status ?? "blocked")))}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{response.error ? "Workflow blocked" : selectedLabel}</span>
                <Badge className={statusClass(toHonestStatus(response.result?.status ?? "blocked"))}>{toHonestStatus(response.result?.status ?? "blocked")}</Badge>
                {response.result?.contentScore ? <Badge className={statusClass(response.result.contentScore.acceptance)}>score {response.result.contentScore.qualityScore}</Badge> : null}
              </div>
              <p className="mt-2 text-sm leading-6 opacity-85">{response.error ?? response.message ?? response.result?.validation.warnings[0] ?? structured?.contentBrief.angle}</p>
              {structured ? (
                <div className="mt-3 space-y-2">
                  {structured.drafts.slice(0, 3).map((item) => (
                    <div key={`${item.type}-${item.platform}-${item.text.slice(0, 24)}`} className="rounded-xl border border-white/10 bg-black/25 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <FileText className="h-3.5 w-3.5 text-neon" />
                          {item.type.replace("_", " ")} / {item.platform.replace("_", " ")}
                        </span>
                        <span className="font-mono text-xs text-neon">{item.confidence}</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 opacity-80">{item.text}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">Run a governed workflow to inspect draft content, platform adaptation, scoring, and trace output.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
