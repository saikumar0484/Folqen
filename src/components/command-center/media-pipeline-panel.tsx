"use client";

import { useState } from "react";
import { AlertTriangle, Clapperboard, ImageIcon, Loader2, Play, RefreshCw, Scissors, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mutationFetch } from "@/lib/client/mutation-fetch";
import { toHonestStatus } from "@/lib/status-semantics";
import type { MediaDashboard, MediaPipelineResult, MediaWorkflowKind } from "@/lib/media/types";
import { cn } from "@/lib/utils";

type MediaPipelinePanelProps = {
  dashboard: MediaDashboard;
};

type MediaRunResponse = {
  ok?: boolean;
  result?: MediaPipelineResult;
  retryPlan?: MediaDashboard["renderQueue"][number];
  error?: string;
  message?: string;
};

const workflowIcons: Record<string, typeof ImageIcon> = {
  thumbnail_workflow: ImageIcon,
  shorts_visual_workflow: Clapperboard,
  script_to_scene_workflow: Scissors,
  rendering_workflow: Play,
  subtitle_workflow: Clapperboard,
  asset_adaptation_workflow: RefreshCw,
  asset_optimization_workflow: ShieldCheck,
};

function statusClass(status: string) {
  if (status === "Blocked") return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  if (status === "Needs approval") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  if (status === "Configured") return "border-neon/25 bg-neon/10 text-neon";
  if (status === "Not connected") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
}

export function MediaPipelinePanel({ dashboard }: MediaPipelinePanelProps) {
  const [workflowKind, setWorkflowKind] = useState<MediaWorkflowKind>("thumbnail_workflow");
  const [objective, setObjective] = useState("Create a premium YouTube thumbnail and vertical short visual plan for an Indian haunted fort mystery.");
  const [prompt, setPrompt] = useState("Cinematic dark documentary style, strong focal silhouette, neon green title space, no gore, no real-person likeness.");
  const [scriptText, setScriptText] = useState("Cold open: What if the abandoned fort was never really empty? Reveal one local legend before the midpoint.");
  const [pending, setPending] = useState<string | null>(null);
  const [response, setResponse] = useState<MediaRunResponse | null>(null);
  const [assets, setAssets] = useState(dashboard.recentAssets);
  const [renders, setRenders] = useState(dashboard.renderQueue);

  const selectedWorkflow = dashboard.workflows.find((workflow) => workflow.kind === workflowKind) ?? dashboard.workflows[0];

  async function runMedia(endpoint: "/api/media/generate" | "/api/media/render") {
    setPending(endpoint);
    setResponse(null);
    const body = {
      workflowKind,
      objective,
      prompt,
      scriptText,
      platform: "YOUTUBE",
      aspectRatio: workflowKind === "thumbnail_workflow" ? "16:9" : "9:16",
      tags: ["folklore", "mystery", "media-pipeline"],
      approvalRequired: true,
    };
    const result = await mutationFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await result.json().catch(() => ({ error: "Invalid media response." }))) as MediaRunResponse;
    setPending(null);
    setResponse(payload);

    if (payload.result) {
      setAssets((items) => [...payload.result!.assets, ...items].slice(0, 8));
      setRenders((items) => [payload.result!.renderPlan, ...items].slice(0, 8));
    }
  }

  async function retryLatest() {
    setPending("retry");
    const renderId = renders[0]?.renderId ?? "render_latest_failed";
    const result = await mutationFetch("/api/media/retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ renderId, reason: "Operator requested safe render retry from Content Studio." }),
    });
    const payload = (await result.json().catch(() => ({ error: "Invalid retry response." }))) as MediaRunResponse;
    setPending(null);
    setResponse(payload);

    if (payload.retryPlan) {
      setRenders((items) => [payload.retryPlan!, ...items].slice(0, 8));
    }
  }

  return (
    <section className="space-y-4">
      <Card className="border-neon/20 bg-black/30">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="premium">Media Production Department</Badge>
                <Badge variant="info">Configured</Badge>
                <Badge variant="warning">No live rendering</Badge>
                <Badge variant="safe">Queue-ready</Badge>
              </div>
              <CardTitle className="mt-3 flex items-center gap-2">
                <Clapperboard className="h-5 w-5 text-neon" />
                Media Generation & Asset Pipeline
              </CardTitle>
              <CardDescription>ComfyUI-ready creative workflows, FFmpeg render plans, asset versioning, retry policy, and observability without GPU execution.</CardDescription>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              {dashboard.providers.map((provider) => (
                <div key={provider.id} className={cn("rounded-2xl border px-3 py-2", statusClass(toHonestStatus(provider.status)))}>
                  <div className="font-medium">{provider.label}</div>
                  <div className="mt-1 opacity-80">{toHonestStatus(provider.status)}</div>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Creative workflow runner</CardTitle>
            <CardDescription>{selectedWorkflow.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Workflow</span>
              <select
                value={workflowKind}
                onChange={(event) => setWorkflowKind(event.target.value as MediaWorkflowKind)}
                className="h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-neon/60"
              >
                {dashboard.workflows.map((workflow) => (
                  <option key={workflow.kind} value={workflow.kind}>
                    {workflow.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Objective</span>
              <textarea value={objective} onChange={(event) => setObjective(event.target.value)} className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Visual prompt</span>
                <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
              </label>
              <label className="block space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Script / scene notes</span>
                <textarea value={scriptText} onChange={(event) => setScriptText(event.target.value)} className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => runMedia("/api/media/generate")} disabled={Boolean(pending)}>
                {pending === "/api/media/generate" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                Plan media assets
              </Button>
              <Button type="button" variant="secondary" onClick={() => runMedia("/api/media/render")} disabled={Boolean(pending)}>
                {pending === "/api/media/render" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Queue dry render
              </Button>
              <Button type="button" variant="ghost" onClick={retryLatest} disabled={Boolean(pending)}>
                {pending === "retry" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Retry safely
              </Button>
            </div>
            {response ? (
              <div className={cn("rounded-2xl border p-4", response.error ? statusClass("Blocked") : statusClass(response.result?.status === "blocked" ? "Blocked" : "Needs approval"))}>
                <div className="font-medium">{response.error ? "Media action blocked" : "Media pipeline planned"}</div>
                <p className="mt-1 text-sm leading-6 opacity-85">{response.error ?? response.message ?? response.result?.risks[0] ?? "Dry-run result captured."}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Creative workflow registry</CardTitle>
              <CardDescription>Reusable production pipelines are provider-abstracted and approval-gated.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {dashboard.workflows.map((workflow) => {
                const Icon = workflowIcons[workflow.kind] ?? ImageIcon;
                return (
                  <div key={workflow.kind} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-neon/20 bg-neon/10 text-neon">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{workflow.name}</div>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{workflow.mediaTypes.join(" / ")}</p>
                      </div>
                      <Badge variant={workflow.retryable ? "safe" : "neutral"}>{workflow.retryable ? "Retryable" : "Single pass"}</Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Asset registry</CardTitle>
            <CardDescription>Metadata-only previews for generated plans, variants, templates, and render outputs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assets.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">No media pipeline assets yet.</div>
            ) : (
              assets.map((asset) => (
                <div key={asset.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="info">{asset.mediaType}</Badge>
                    <span className="font-mono text-xs text-neon">v{asset.version}</span>
                  </div>
                  <div className="mt-3 text-sm font-medium">{asset.title}</div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{asset.description}</p>
                  <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{asset.storagePath}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Render queue and recovery</CardTitle>
            <CardDescription>Dry-run BullMQ jobs, render logs, retry policy, and failed render tracking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {renders.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">Render queue is empty. Queue a dry render to inspect logs.</div>
            ) : (
              renders.map((render) => (
                <div key={`${render.renderId}-${render.queueJobId}`} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant={render.status === "failed_recoverable" ? "warning" : "info"}>{render.status}</Badge>
                    <span className="font-mono text-xs text-muted-foreground">{render.queueJobId}</span>
                  </div>
                  <div className="mt-3 text-sm font-medium">{render.workflowKind}</div>
                  <div className="mt-2 space-y-1">
                    {render.logs.slice(0, 3).map((log) => (
                      <div key={log} className="font-mono text-xs leading-5 text-muted-foreground">
                        {log}
                      </div>
                    ))}
                  </div>
                  {render.status === "failed_recoverable" ? (
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-100">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Recovery stays dry-run until a live worker is approved.
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
