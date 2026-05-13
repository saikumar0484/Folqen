"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Gauge, ImageIcon, Loader2, PlayCircle, ShieldCheck, Square, WandSparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mutationFetch } from "@/lib/client/mutation-fetch";
import { controlledMediaWorkflowKinds, controlledMediaWorkflowLabels, type ControlledMediaWorkflowKind, type ControlledRenderResult, type MediaDashboard } from "@/lib/media/types";
import { cn } from "@/lib/utils";

type ControlledMediaExecutionPanelProps = {
  dashboard: MediaDashboard;
};

type ControlledRenderResponse = {
  ok?: boolean;
  mode?: string;
  result?: ControlledRenderResult;
  error?: string;
  message?: string;
};

function statusClass(status: string) {
  if (status === "completed_sandbox" || status === "allowed" || status === "accepted" || status === "passed") return "border-neon/25 bg-neon/10 text-neon";
  if (status === "waiting_for_approval" || status === "needs_approval" || status === "needs_review" || status === "warning") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  if (status === "blocked" || status === "failed" || status === "rejected" || status === "kill_switch" || status === "budget_blocked") return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  return "border-white/10 bg-white/[0.04] text-muted-foreground";
}

function splitTags(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ControlledMediaExecutionPanel({ dashboard }: ControlledMediaExecutionPanelProps) {
  const [workflowKind, setWorkflowKind] = useState<ControlledMediaWorkflowKind>("live_thumbnail_rendering");
  const [approvalId, setApprovalId] = useState("");
  const [objective, setObjective] = useState("Render a governed thumbnail execution packet for an India-focused haunted fort mystery episode.");
  const [prompt, setPrompt] = useState("Cinematic mystery documentary thumbnail, strong fort silhouette, bright title space, eerie but non-graphic, no real-person likeness.");
  const [scriptText, setScriptText] = useState("Subtitle beat: This fort is not just abandoned. Locals say the silence begins after sunset.");
  const [tags, setTags] = useState("thumbnail, mystery, folklore, controlled-render");
  const [pending, setPending] = useState(false);
  const [shutdownPending, setShutdownPending] = useState(false);
  const [response, setResponse] = useState<ControlledRenderResponse | null>(null);

  const selectedLabel = useMemo(() => controlledMediaWorkflowLabels[workflowKind], [workflowKind]);
  const governance = response?.result?.governance ?? dashboard.renderGovernance;
  const controlledRuns = response?.result ? [response.result, ...(dashboard.controlledRenders ?? [])].slice(0, 4) : dashboard.controlledRenders ?? [];

  async function runControlledRender() {
    setPending(true);
    setResponse(null);
    const request = await mutationFetch("/api/media/controlled-render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflowKind,
        approvalId: approvalId || undefined,
        objective,
        prompt,
        scriptText,
        providerId: workflowKind === "subtitle_rendering" || workflowKind === "render_recovery" ? "ffmpeg" : "comfyui",
        aspectRatio: workflowKind === "live_thumbnail_rendering" ? "16:9" : "9:16",
        outputFormat: workflowKind === "subtitle_rendering" ? "text/vtt" : "image/png",
        estimatedRenderSeconds: workflowKind === "subtitle_rendering" ? 24 : 45,
        estimatedGpuMinutes: workflowKind === "subtitle_rendering" ? 0 : 0.8,
        tags: splitTags(tags),
      }),
    });
    const payload = (await request.json().catch(() => ({ error: "Invalid controlled media response." }))) as ControlledRenderResponse;
    setResponse(payload);
    setPending(false);
  }

  async function shutdownControlledRendering() {
    setShutdownPending(true);
    const request = await mutationFetch("/api/media/controlled-render/shutdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Operator engaged controlled media render shutdown from Content Studio." }),
    });
    const payload = (await request.json().catch(() => ({ error: "Invalid shutdown response." }))) as ControlledRenderResponse;
    setResponse(payload);
    setShutdownPending(false);
  }

  return (
    <Card className="border-neon/20 bg-black/30">
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="premium">
            <WandSparkles className="h-3.5 w-3.5" />
            Controlled Media Execution
          </Badge>
          <Badge variant="warning">Approval required</Badge>
          <Badge variant="info">Sandbox fallback</Badge>
          <Badge variant="safe">No publishing</Badge>
        </div>
        <CardTitle className="mt-3">Governed Rendering & Asset Production</CardTitle>
        <CardDescription>Controlled ComfyUI/FFmpeg-ready rendering packets with approval gates, GPU budget controls, validation, scoring, observability, and emergency shutdown.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <label className="block space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Controlled workflow</span>
              <select value={workflowKind} onChange={(event) => setWorkflowKind(event.target.value as ControlledMediaWorkflowKind)} className="h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-neon/60">
                {controlledMediaWorkflowKinds.map((kind) => (
                  <option key={kind} value={kind}>
                    {controlledMediaWorkflowLabels[kind]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Approval ID</span>
              <input value={approvalId} onChange={(event) => setApprovalId(event.target.value)} placeholder="Approved media_render ID" className="h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-neon/60" />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Objective</span>
            <textarea value={objective} onChange={(event) => setObjective(event.target.value)} className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <textarea aria-label="Controlled render prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} className="min-h-24 rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
            <textarea aria-label="Subtitle or scene text" value={scriptText} onChange={(event) => setScriptText(event.target.value)} className="min-h-24 rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
          </div>

          <input aria-label="Controlled render tags" value={tags} onChange={(event) => setTags(event.target.value)} className="h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-neon/60" />

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={runControlledRender} disabled={pending || shutdownPending}>
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              Prepare governed render
            </Button>
            <Button type="button" variant="danger" onClick={shutdownControlledRendering} disabled={pending || shutdownPending}>
              {shutdownPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
              Emergency shutdown
            </Button>
            {governance ? <div className={cn("rounded-2xl border px-3 py-2 text-xs", statusClass(governance.status))}>{governance.status}: {governance.reasons[0] ?? "All render gates ready."}</div> : null}
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <Gauge className="mb-2 h-4 w-4 text-neon" />
              <div className="text-sm font-medium">Render Budget</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {governance ? `${governance.quota.runsToday}/${governance.quota.maxDailyRuns} runs, ${governance.quota.activeRuns}/${governance.quota.maxConcurrency} active.` : "Quota snapshot unavailable."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <ShieldCheck className="mb-2 h-4 w-4 text-neon" />
              <div className="text-sm font-medium">Safety Locks</div>
              <p className="mt-1 text-xs text-muted-foreground">No autonomous retries, unrestricted GPU, video generation, workflow mutation, or publishing.</p>
            </div>
          </div>

          {response ? (
            <div className={cn("rounded-2xl border p-4", statusClass(response.result?.status ?? "blocked"))}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{response.error ? "Render blocked" : selectedLabel}</span>
                {response.result ? <Badge className={statusClass(response.result.status)}>{response.result.status.replaceAll("_", " ")}</Badge> : null}
                {response.result?.scoring ? <Badge className={statusClass(response.result.scoring.acceptance)}>score {response.result.scoring.qualityScore}</Badge> : null}
              </div>
              <p className="mt-2 text-sm leading-6 opacity-85">{response.error ?? response.message ?? response.result?.governance.reasons[0] ?? response.result?.validation.warnings[0] ?? "Controlled render packet captured."}</p>
              {response.result ? (
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                    <ImageIcon className="mb-2 h-3.5 w-3.5 text-neon" />
                    <div className="font-mono text-lg text-neon">{response.result.scoring.qualityScore}</div>
                    <div className="text-[11px] text-muted-foreground">quality</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                    <ShieldCheck className="mb-2 h-3.5 w-3.5 text-neon" />
                    <div className="font-mono text-lg text-neon">{response.result.scoring.safetyScore}</div>
                    <div className="text-[11px] text-muted-foreground">safety</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                    <Gauge className="mb-2 h-3.5 w-3.5 text-neon" />
                    <div className="font-mono text-lg text-neon">{response.result.observability.budgetUtilizationPercent}%</div>
                    <div className="text-[11px] text-muted-foreground">GPU budget</div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">Prepare a governed render packet to inspect approval status, queue metadata, render score, validation warnings, and rollback steps.</div>
          )}
        </div>

        <div className="xl:col-span-2">
          <Card className="border-white/10 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-amber-200" />
                Recent controlled render packets
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {controlledRuns.length ? (
                controlledRuns.map((run) => (
                  <div key={run.runId} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                    <Badge className={statusClass(run.status)}>{run.status.replaceAll("_", " ")}</Badge>
                    <div className="mt-2 text-sm font-medium">{controlledMediaWorkflowLabels[run.workflowKind]}</div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{run.asset.title}</p>
                    <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{run.queueJobId}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-muted-foreground md:col-span-2 xl:col-span-4">No controlled render packets captured yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
