"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Gauge, ImageIcon, Loader2, PlayCircle, ShieldCheck, Square, WandSparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mutationFetch } from "@/lib/client/mutation-fetch";
import { controlledMediaWorkflowKinds, controlledMediaWorkflowLabels, type ControlledMediaWorkflowKind, type ControlledRenderResult, type MediaDashboard } from "@/lib/media/types";
import { toHonestStatus } from "@/lib/status-semantics";
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
  if (status === "completed_sandbox" || status === "completed_live" || status === "allowed" || status === "accepted" || status === "passed" || status === "Live" || status === "Configured") return "border-neon/25 bg-neon/10 text-neon";
  if (status === "waiting_for_approval" || status === "needs_approval" || status === "needs_review" || status === "warning") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  if (status === "blocked" || status === "failed" || status === "quarantined" || status === "rejected" || status === "kill_switch" || status === "budget_blocked" || status === "Blocked") return "border-rose-300/25 bg-rose-300/10 text-rose-100";
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
  const [livePending, setLivePending] = useState(false);
  const [controlPending, setControlPending] = useState(false);
  const [response, setResponse] = useState<ControlledRenderResponse | null>(null);
  const [liveResponse, setLiveResponse] = useState<ControlledRenderResponse | null>(null);

  const selectedLabel = useMemo(() => controlledMediaWorkflowLabels[workflowKind], [workflowKind]);
  const governance = response?.result?.governance ?? dashboard.renderGovernance;
  const liveThumbnail = dashboard.liveThumbnail;
  const liveRuns = liveResponse?.result ? [liveResponse.result, ...(liveThumbnail?.recentRuns ?? [])].slice(0, 4) : liveThumbnail?.recentRuns ?? [];
  const controlledRuns = response?.result ? [response.result, ...(dashboard.controlledRenders ?? [])].slice(0, 4) : dashboard.controlledRenders ?? [];
  const previewUrl = liveResponse?.result?.liveThumbnail?.previewUrl;
  const canPreview = Boolean(previewUrl?.startsWith("http://") || previewUrl?.startsWith("https://") || previewUrl?.startsWith("/"));

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

  async function runLiveThumbnailRender() {
    setLivePending(true);
    setLiveResponse(null);
    const request = await mutationFetch("/api/media/live-thumbnail-render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approvalId,
        objective,
        prompt,
        aspectRatio: "16:9",
        outputFormat: "image/png",
        estimatedRenderSeconds: 45,
        estimatedGpuMinutes: 0.8,
        tags: splitTags(tags),
      }),
    });
    const payload = (await request.json().catch(() => ({ error: "Invalid live thumbnail render response." }))) as ControlledRenderResponse;
    setLiveResponse(payload);
    setLivePending(false);
  }

  async function controlLiveThumbnail(action: "rollback_to_dry_run" | "quarantine" | "recover_failed_render") {
    setControlPending(true);
    const request = await mutationFetch("/api/media/live-thumbnail-render/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        renderId: liveResponse?.result?.renderPlan.renderId,
        reason: `Operator requested ${action.replaceAll("_", " ")} from Folqen Content Studio.`,
      }),
    });
    const payload = (await request.json().catch(() => ({ error: "Invalid live thumbnail control response." }))) as ControlledRenderResponse;
    setLiveResponse(payload);
    setControlPending(false);
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
            {governance ? <div className={cn("rounded-2xl border px-3 py-2 text-xs", statusClass(toHonestStatus(governance.status)))}>{toHonestStatus(governance.status)}: {governance.reasons[0] ?? "All render gates ready."}</div> : null}
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
            <div className={cn("rounded-2xl border p-4", statusClass(toHonestStatus(response.result?.status ?? "blocked")))}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{response.error ? "Render blocked" : selectedLabel}</span>
                {response.result ? <Badge className={statusClass(toHonestStatus(response.result.status))}>{toHonestStatus(response.result.status)}</Badge> : null}
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
          <Card className="mb-4 border-neon/20 bg-neon/[0.04]">
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <Badge className={statusClass(toHonestStatus(liveThumbnail?.status ?? "Not connected"))}>{toHonestStatus(liveThumbnail?.status ?? "Not connected")}</Badge>
                <Badge variant="premium">Thumbnail only</Badge>
                <Badge variant="warning">Approval mandatory</Badge>
                <Badge variant="safe">Rollback ready</Badge>
              </div>
              <CardTitle className="mt-3 text-base">First Governed Live Thumbnail Rendering</CardTitle>
              <CardDescription>One controlled provider, Content Department only, approved thumbnail workflow only. No video generation, publishing, autonomous retry, unrestricted GPU access, or workflow mutation.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                    <div className="text-xs text-muted-foreground">Provider</div>
                    <div className="mt-1 text-sm font-medium">Controlled thumbnail worker</div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{liveThumbnail?.diagnostics.providerConfigured ? "Configured" : "Not connected"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                    <div className="text-xs text-muted-foreground">Queue</div>
                    <div className="mt-1 text-sm font-medium">{liveThumbnail?.queue.mode ?? "not_connected"}</div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{liveThumbnail ? `${liveThumbnail.queue.waiting} waiting, ${liveThumbnail.queue.failed} failed` : "No queue snapshot"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                    <div className="text-xs text-muted-foreground">Budget</div>
                    <div className="mt-1 text-sm font-medium">{liveThumbnail ? `${liveThumbnail.governance.quota.runsToday}/${liveThumbnail.governance.quota.maxDailyRuns} daily` : "Unavailable"}</div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{liveThumbnail ? `${liveThumbnail.governance.quota.estimatedGpuMinutesToday}/${liveThumbnail.governance.quota.maxEstimatedGpuMinutes} GPU min` : "No quota"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                    <div className="text-xs text-muted-foreground">Rollback</div>
                    <div className="mt-1 text-sm font-medium">{liveThumbnail?.rollback.dryRunFallback ? "Dry-run fallback" : "Needs setup"}</div>
                    <p className="mt-1 text-[11px] text-muted-foreground">Quarantine and queue drain controls available.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={runLiveThumbnailRender} disabled={livePending || controlPending || !approvalId.trim()}>
                    {livePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                    Run live thumbnail
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => controlLiveThumbnail("rollback_to_dry_run")} disabled={livePending || controlPending}>
                    Rollback to dry-run
                  </Button>
                  <Button type="button" variant="danger" onClick={() => controlLiveThumbnail("quarantine")} disabled={livePending || controlPending}>
                    Quarantine provider
                  </Button>
                </div>

                {liveThumbnail?.governance.reasons.length ? (
                  <div className={cn("rounded-2xl border p-3 text-xs leading-5", statusClass(toHonestStatus(liveThumbnail.governance.status)))}>{liveThumbnail.governance.reasons[0]}</div>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                  {canPreview ? (
                    <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${previewUrl})` }} aria-label="Live thumbnail preview" />
                  ) : (
                    <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">Live thumbnail preview appears here after a governed worker returns an approved asset URL.</div>
                  )}
                </div>
                {liveResponse ? (
                  <div className={cn("rounded-2xl border p-4", statusClass(toHonestStatus(liveResponse.result?.status ?? "blocked")))}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{liveResponse.error ? "Live thumbnail blocked" : "Live thumbnail result"}</span>
                      {liveResponse.result ? <Badge className={statusClass(toHonestStatus(liveResponse.result.status))}>{toHonestStatus(liveResponse.result.status)}</Badge> : null}
                      {liveResponse.result?.scoring ? <Badge className={statusClass(liveResponse.result.scoring.acceptance)}>score {liveResponse.result.scoring.qualityScore}</Badge> : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 opacity-85">{liveResponse.error ?? liveResponse.message ?? liveResponse.result?.governance.reasons[0] ?? "Live thumbnail trace captured."}</p>
                    {liveResponse.result ? <p className="mt-2 font-mono text-[11px] text-muted-foreground">{liveResponse.result.renderPlan.renderId}</p> : null}
                  </div>
                ) : null}
              </div>

              <div className="xl:col-span-2">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {liveRuns.length ? (
                    liveRuns.map((run) => (
                      <div key={run.runId} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                        <Badge className={statusClass(toHonestStatus(run.status))}>{toHonestStatus(run.status)}</Badge>
                        <div className="mt-2 text-sm font-medium">{run.asset.title}</div>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{run.liveThumbnail?.previewUrl ?? run.liveThumbnail?.failedAssetIsolation ?? "No preview URL captured."}</p>
                        <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{run.queueJobId}</div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground md:col-span-2 xl:col-span-4">No live thumbnail renders captured yet.</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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
                    <Badge className={statusClass(toHonestStatus(run.status))}>{toHonestStatus(run.status)}</Badge>
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
