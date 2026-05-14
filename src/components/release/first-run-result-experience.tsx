"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, Clipboard, Copy, Download, FileText, ImageIcon, Loader2, RefreshCcw, ShieldCheck, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { mutationFetch } from "@/lib/client/mutation-fetch";
import { toHonestStatus } from "@/lib/status-semantics";
import type { FirstRunResponse } from "./types";

function parseScriptDrafts(scripts: unknown, fallbackScript: string) {
  if (!scripts || typeof scripts !== "object" || Array.isArray(scripts)) return [fallbackScript];
  const maybeDrafts = (scripts as Record<string, unknown>).drafts;
  if (!Array.isArray(maybeDrafts)) return [fallbackScript];
  const cleaned = maybeDrafts.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return cleaned.length ? cleaned : [fallbackScript];
}

function buildExplanation(result: FirstRunResponse) {
  const blocked = Object.values(result.statuses).filter((item) => item === "Blocked").length;
  const needsApproval = Object.values(result.statuses).filter((item) => item === "Needs approval").length;
  if (blocked > 0) {
    return "Your first package is ready. Some sensitive actions are still protected until approvals are complete.";
  }
  if (needsApproval > 0) {
    return "Great progress. Folqen completed the guided path and is waiting for your approvals on sensitive actions.";
  }
  return "Success. Folqen completed your first creator workflow and prepared a draft package ready for review.";
}

type LiveThumbnailResponse = {
  ok?: boolean;
  error?: string;
  result?: {
    status?: string;
    governance?: { status?: string; reasons?: string[] };
    liveThumbnail?: { previewUrl?: string };
  };
  message?: string;
};

type FirstRunResultExperienceProps = {
  objective: string;
  result: FirstRunResponse;
  onRetry: () => void;
  retrying: boolean;
};

export function FirstRunResultExperience({ objective, result, onRetry, retrying }: FirstRunResultExperienceProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [revisionPrompt, setRevisionPrompt] = useState(
    `Create a cinematic YouTube Shorts thumbnail for "${objective}" with strong contrast, clean title space, mystery atmosphere, and safe documentary tone.`,
  );
  const [approvalId, setApprovalId] = useState("");
  const [thumbError, setThumbError] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(result.thumbnailDraft?.previewUrl ?? null);
  const [thumbnailStatus, setThumbnailStatus] = useState(result.thumbnailDraft?.status ?? "Not connected");
  const [thumbnailMessage, setThumbnailMessage] = useState<string | null>(null);
  const [runningThumbnail, startThumbnailRun] = useTransition();

  const scripts = useMemo(() => parseScriptDrafts(result.scripts, result.youtubeDraftPackage.script), [result.scripts, result.youtubeDraftPackage.script]);
  const explanation = useMemo(() => buildExplanation(result), [result]);
  const checklist = useMemo(
    () => [
      { label: "Research brief prepared", done: toHonestStatus(result.statuses.research ?? "Configured") !== "Blocked" },
      { label: "Script drafts generated", done: toHonestStatus(result.statuses.script ?? "Configured") !== "Blocked" },
      { label: "Thumbnail draft available", done: Boolean(thumbnailPreview) },
      { label: "YouTube draft package assembled", done: true },
      { label: "Safety checks recorded", done: true },
    ],
    [result.statuses, thumbnailPreview],
  );

  async function copyText(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied((current) => (current === label ? null : current)), 1800);
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "folqen-first-run-package.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function downloadScriptText() {
    const blob = new Blob([scripts.join("\n\n---\n\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "folqen-script-drafts.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function runThumbnailRevision() {
    setThumbError(null);
    setThumbnailMessage(null);
    startThumbnailRun(async () => {
      const response = await mutationFetch("/api/media/live-thumbnail-render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective,
          approvalId: approvalId.trim() || "missing_approval",
          prompt: revisionPrompt,
          aspectRatio: "16:9",
          outputFormat: "image/png",
          estimatedRenderSeconds: 45,
          estimatedGpuMinutes: 0.8,
          tags: ["beta-v1", "thumbnail-revision", "creator-flow"],
        }),
      });

      const body = (await response.json().catch(() => null)) as LiveThumbnailResponse | null;
      if (!response.ok || !body) {
        setThumbError(body?.error ?? "Thumbnail revision could not be completed.");
        return;
      }

      const nextPreview = body.result?.liveThumbnail?.previewUrl ?? null;
      setThumbnailPreview(nextPreview);
      setThumbnailStatus(toHonestStatus(body.result?.governance?.status ?? body.result?.status ?? "Configured"));
      setThumbnailMessage(body.message ?? "Thumbnail revision request completed.");
      if (!nextPreview && body.result?.governance?.reasons?.length) {
        setThumbError(body.result.governance.reasons[0] ?? null);
      }
    });
  }

  return (
    <section className="section-space">
      <Card className="panel">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neon text-black">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] md:text-3xl">Your First Workflow Is Ready</h2>
              <CardDescription>Research → Script → Thumbnail → YouTube draft package</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Object.entries(result.statuses).map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/12 bg-white/[0.03] p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
                <div className="mt-1 text-sm font-semibold">{toHonestStatus(value)}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/12 bg-white/[0.03] p-4 text-sm text-muted-foreground">
            <div className="inline-flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-4 w-4 text-neon" />
                Folqen summary
            </div>
            <p className="mt-2 leading-7">{explanation}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={downloadJson} variant="secondary">
              <Download className="h-4 w-4" />
              Export Workflow JSON
            </Button>
            <Button type="button" onClick={downloadScriptText} variant="secondary">
              <FileText className="h-4 w-4" />
              Export Script TXT
            </Button>
            <Button type="button" onClick={onRetry} disabled={retrying}>
              {retrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Retry First Run
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="panel">
          <CardHeader>
            <h3 className="text-lg font-semibold">Script Viewer</h3>
            <CardDescription>Creator-ready drafts generated from the first workflow run.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {scripts.map((script, index) => (
              <article key={`${index}-${script.slice(0, 24)}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Draft {index + 1}</div>
                  <Button size="sm" variant="ghost" onClick={() => copyText(`draft-${index}`, script)}>
                    {copied === `draft-${index}` ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied === `draft-${index}` ? "Copied" : "Copy"}
                  </Button>
                </div>
                <pre className="mt-2 max-h-60 overflow-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black/20 p-3 text-xs leading-6 text-muted-foreground">{script}</pre>
              </article>
            ))}
          </CardContent>
        </Card>

        <Card className="panel-soft">
          <CardHeader>
            <h3 className="text-base font-semibold">Workflow Trace Timeline</h3>
            <CardDescription>A clear step-by-step story of what Folqen completed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.trace.map((item, index) => (
              <article key={item.step} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")} / {item.step}
                  </span>
                  <span className="text-xs text-muted-foreground">{toHonestStatus(item.status)}</span>
                </div>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">{item.detail}</p>
              </article>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="panel">
          <CardHeader>
            <h3 className="text-lg font-semibold">Thumbnail Generation & Revision</h3>
            <CardDescription>Generate and refine thumbnail drafts for this package.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Approval ID (if available)</span>
                <input
                  value={approvalId}
                  onChange={(event) => setApprovalId(event.target.value)}
                  className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2 text-sm outline-none transition focus:border-neon/60"
                  placeholder="approval_live_thumb_..."
                />
              </label>
              <div className="rounded-xl border border-white/12 bg-white/[0.03] p-3 text-xs text-muted-foreground">
                Current status
                <div className="mt-1 text-sm font-semibold text-foreground">{thumbnailStatus}</div>
              </div>
            </div>

            <label className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Revision Prompt</span>
              <textarea
                rows={3}
                value={revisionPrompt}
                onChange={(event) => setRevisionPrompt(event.target.value)}
                className="w-full rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2.5 text-sm outline-none transition focus:border-neon/60"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={runThumbnailRevision} disabled={runningThumbnail || revisionPrompt.trim().length < 12}>
                {runningThumbnail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                Generate Revision
              </Button>
              <Button type="button" variant="secondary" onClick={runThumbnailRevision} disabled={runningThumbnail}>
                <RefreshCcw className="h-4 w-4" />
                Retry Render
              </Button>
            </div>

            {thumbError ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
                <AlertCircle className="h-4 w-4" />
                {thumbError}
              </div>
            ) : null}

            {thumbnailMessage ? (
              <div className="rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground">{thumbnailMessage}</div>
            ) : null}

            <div className="overflow-hidden rounded-2xl border border-white/12 bg-black/25">
              {thumbnailPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbnailPreview} alt="Generated thumbnail draft preview" className="aspect-video w-full object-cover" />
              ) : (
                <div className="flex aspect-video items-center justify-center px-4 text-center text-sm text-muted-foreground">
                  No live thumbnail preview yet. Run a governed revision to attempt preview generation.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="panel-soft">
          <CardHeader>
            <h3 className="text-base font-semibold">YouTube Draft Package</h3>
            <CardDescription>Draft-only creator package for manual review and upload prep.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Title</div>
              <div className="mt-1 font-medium">{result.youtubeDraftPackage.title}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Description</div>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{result.youtubeDraftPackage.description}</p>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Tags</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {result.youtubeDraftPackage.tags.map((tag) => (
                  <span key={tag} className="rounded border border-white/12 bg-white/[0.03] px-2 py-0.5 text-xs text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ImageIcon className="h-3.5 w-3.5" />
                Upload readiness checklist
              </div>
              <div className="mt-2 space-y-1.5">
                {checklist.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    <span className={item.done ? "text-neon" : "text-muted-foreground"}>{item.done ? "●" : "○"}</span>
                    <span className={item.done ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-amber-300/25 bg-amber-300/[0.08] p-3 text-xs text-amber-100">
              Creator preview: publishing stays manual until account connections and approvals are complete.
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => copyText("title", result.youtubeDraftPackage.title)}>
                {copied === "title" ? <CheckCircle2 className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                {copied === "title" ? "Title copied" : "Copy title"}
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => copyText("description", result.youtubeDraftPackage.description)}>
                {copied === "description" ? <CheckCircle2 className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                {copied === "description" ? "Description copied" : "Copy description"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
