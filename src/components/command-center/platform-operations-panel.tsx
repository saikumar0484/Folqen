"use client";

import { useState } from "react";
import { Activity, AlertTriangle, BarChart3, CalendarClock, Globe2, Loader2, RadioTower, RefreshCw, Send, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mutationFetch } from "@/lib/client/mutation-fetch";
import type { DeploymentPlan, PlatformOperationResult, PlatformOpsDashboard, PlatformOpsPlatform } from "@/lib/platform-ops/types";
import { cn } from "@/lib/utils";

type PlatformOperationsPanelProps = {
  dashboard: PlatformOpsDashboard;
};

type PlatformOpsResponse = {
  ok?: boolean;
  result?: PlatformOperationResult;
  retryPlan?: DeploymentPlan;
  error?: string;
  message?: string;
};

const platformOptions: PlatformOpsPlatform[] = ["YOUTUBE", "INSTAGRAM", "THREADS", "TIKTOK", "LINKEDIN", "X_TWITTER"];

function statusClass(status: string) {
  if (status === "Blocked" || status === "failed_recoverable") return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  if (status === "Needs approval" || status === "blocked_needs_approval" || status === "Not connected") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  if (status === "Configured") return "border-neon/25 bg-neon/10 text-neon";
  return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
}

function labelPlatform(platform: PlatformOpsPlatform) {
  return platform === "X_TWITTER" ? "X/Twitter" : platform.charAt(0) + platform.slice(1).toLowerCase();
}

export function PlatformOperationsPanel({ dashboard }: PlatformOperationsPanelProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformOpsPlatform[]>(["YOUTUBE", "INSTAGRAM", "THREADS"]);
  const [objective, setObjective] = useState("Distribute a source-safe haunted fort mystery package with approval-gated manual posting fallback.");
  const [title, setTitle] = useState("The Fort That Would Not Sleep");
  const [caption, setCaption] = useState("A cinematic folklore mystery package for short-form and long-form channels.");
  const [pending, setPending] = useState<string | null>(null);
  const [response, setResponse] = useState<PlatformOpsResponse | null>(null);
  const [deployments, setDeployments] = useState(dashboard.recentDeployments);
  const [analyticsPlans, setAnalyticsPlans] = useState(dashboard.analyticsPlans);
  const visibleAnalyticsPlans = analyticsPlans.length ? analyticsPlans : dashboard.analyticsPlans;

  function togglePlatform(platform: PlatformOpsPlatform) {
    setSelectedPlatforms((current) => (current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform]));
  }

  async function runPlatformOps(endpoint: "/api/platform-ops/adapt" | "/api/platform-ops/schedule" | "/api/platform-ops/distribute" | "/api/platform-ops/analytics/collect") {
    setPending(endpoint);
    setResponse(null);
    const result = await mutationFetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objective,
        title,
        caption,
        description: "Folqen platform deployment package for Urban Legends / Mystery / Folklore content.",
        hashtags: ["folklore", "mystery", "urbanlegends", "india"],
        platforms: selectedPlatforms.length ? selectedPlatforms : ["YOUTUBE"],
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        approvalRequired: true,
      }),
    });
    const payload = (await result.json().catch(() => ({ error: "Invalid platform operations response." }))) as PlatformOpsResponse;
    setPending(null);
    setResponse(payload);

    if (payload.result) {
      setDeployments((items) => [...payload.result!.deployments, ...items].slice(0, 10));
      setAnalyticsPlans((items) => [payload.result!.analyticsPlan, ...items].slice(0, 8));
    }
  }

  async function retryLatest() {
    setPending("retry");
    const latest = deployments[0];
    const result = await mutationFetch("/api/platform-ops/retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deploymentId: latest?.deploymentId ?? "deploy_latest_failed",
        platform: latest?.platform ?? "YOUTUBE",
        reason: "Operator requested safe publishing retry from Platform Operations.",
      }),
    });
    const payload = (await result.json().catch(() => ({ error: "Invalid platform retry response." }))) as PlatformOpsResponse;
    setPending(null);
    setResponse(payload);

    if (payload.retryPlan) {
      setDeployments((items) => [payload.retryPlan!, ...items].slice(0, 10));
    }
  }

  return (
    <section className="space-y-4">
      <Card className="border-neon/20 bg-black/30">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="premium">Platform Operations Department</Badge>
                <Badge variant="info">Mock</Badge>
                <Badge variant="warning">No real posting</Badge>
                <Badge variant="safe">Queue-ready</Badge>
              </div>
              <CardTitle className="mt-3 flex items-center gap-2">
                <RadioTower className="h-5 w-5 text-neon" />
                Publishing Infrastructure & Distribution Control
              </CardTitle>
              <CardDescription>
                n8n-ready scheduling, platform adaptation, distribution tracking, retry recovery, analytics ingestion, and monetization monitoring without account automation.
              </CardDescription>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              {dashboard.providers.slice(0, 8).map((provider) => (
                <div key={provider.id} className={cn("rounded-2xl border px-3 py-2", statusClass(provider.status))}>
                  <div className="font-medium">{provider.label}</div>
                  <div className="mt-1 opacity-80">{provider.status}</div>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Distribution workflow runner</CardTitle>
            <CardDescription>Every action produces a dry-run deployment package and approval checkpoint.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Package title</span>
                <input value={title} onChange={(event) => setTitle(event.target.value)} className="h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-neon/60" />
              </label>
              <label className="block space-y-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Caption seed</span>
                <input value={caption} onChange={(event) => setCaption(event.target.value)} className="h-11 w-full rounded-2xl border border-white/10 bg-black/40 px-3 text-sm outline-none focus:border-neon/60" />
              </label>
            </div>
            <label className="block space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Objective</span>
              <textarea value={objective} onChange={(event) => setObjective(event.target.value)} className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-neon/60" />
            </label>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Platform set</div>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {platformOptions.map((platform) => {
                  const selected = selectedPlatforms.includes(platform);
                  const profile = dashboard.platforms.find((item) => item.id === platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={cn(
                        "rounded-2xl border px-3 py-2 text-left text-sm transition",
                        selected ? "border-neon/40 bg-neon/10 text-neon" : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20",
                      )}
                    >
                      <span className="font-medium">{profile?.label ?? labelPlatform(platform)}</span>
                      <span className="mt-1 block text-xs opacity-80">{profile?.tier.replaceAll("_", " ")}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => runPlatformOps("/api/platform-ops/adapt")} disabled={Boolean(pending)}>
                {pending === "/api/platform-ops/adapt" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe2 className="h-4 w-4" />}
                Adapt package
              </Button>
              <Button type="button" variant="secondary" onClick={() => runPlatformOps("/api/platform-ops/distribute")} disabled={Boolean(pending)}>
                {pending === "/api/platform-ops/distribute" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Plan distribution
              </Button>
              <Button type="button" variant="ghost" onClick={() => runPlatformOps("/api/platform-ops/schedule")} disabled={Boolean(pending)}>
                {pending === "/api/platform-ops/schedule" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
                Schedule dry run
              </Button>
              <Button type="button" variant="ghost" onClick={() => runPlatformOps("/api/platform-ops/analytics/collect")} disabled={Boolean(pending)}>
                {pending === "/api/platform-ops/analytics/collect" ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
                Plan analytics
              </Button>
              <Button type="button" variant="ghost" onClick={retryLatest} disabled={Boolean(pending)}>
                {pending === "retry" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Retry safely
              </Button>
            </div>
            {response ? (
              <div className={cn("rounded-2xl border p-4", response.error ? statusClass("Blocked") : statusClass(response.result?.status === "blocked" ? "Blocked" : "Needs approval"))}>
                <div className="font-medium">{response.error ? "Platform action blocked" : "Platform operation planned"}</div>
                <p className="mt-1 text-sm leading-6 opacity-85">{response.error ?? response.message ?? response.result?.risks[0] ?? "Dry-run distribution package captured."}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow registry</CardTitle>
              <CardDescription>Publishing operations are split into reusable n8n-ready pipelines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {dashboard.workflows.map((workflow) => (
                <div key={workflow.kind} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-neon/20 bg-neon/10 text-neon">
                      <Activity className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{workflow.name}</div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{workflow.description}</p>
                    </div>
                    <Badge variant={workflow.retryable ? "safe" : "neutral"}>{workflow.queue}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Deployment registry</CardTitle>
            <CardDescription>Mock-safe deployment plans, status tracking, recovery state, and schedule metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {deployments.length ? (
              deployments.map((deployment) => (
                <div key={`${deployment.deploymentId}-${deployment.queueJobId}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{labelPlatform(deployment.platform)}</div>
                      <div className="mt-1 font-medium">{deployment.deploymentId}</div>
                      <div className="mt-2 text-xs text-muted-foreground">Queue job: {deployment.queueJobId}</div>
                    </div>
                    <Badge className={statusClass(deployment.status)}>{deployment.status.replaceAll("_", " ")}</Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">Scheduled: {new Date(deployment.scheduledAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</div>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">Retry: {deployment.retryPolicy.maxAttempts} attempts, approval required</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">No deployment plans yet. Run a dry distribution workflow to populate this registry.</div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics ingestion</CardTitle>
              <CardDescription>Read-only architecture for future platform metrics and workflow linkage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {visibleAnalyticsPlans.map((plan, index) => (
                <div key={`${plan.source}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{plan.source.replaceAll("_", " ")}</span>
                    <Badge className={statusClass(plan.status)}>{plan.status}</Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{plan.metrics.join(" / ")}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-amber-300/15 bg-amber-300/[0.04]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-200" />
                Monetization and policy watch
              </CardTitle>
              <CardDescription>Copyright, warnings, strikes, and policy hooks are mock monitors until accounts are connected.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">Copyright incidents: {dashboard.monetization.copyrightIncidents.replaceAll("_", " ")}</div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">Platform warnings: {dashboard.monetization.platformWarnings.replaceAll("_", " ")}</div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">Strike monitoring: {dashboard.monetization.strikeMonitoring.replaceAll("_", " ")}</div>
            </CardContent>
          </Card>

          <Card className="border-neon/20 bg-neon/[0.04]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-neon" />
                Safety state
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground">
              <div>Public publishing: {dashboard.observability.publicPublishing}</div>
              <div>Account automation: {dashboard.observability.accountAutomation}</div>
              <div>Scraping: {dashboard.observability.scraping}</div>
              <div>Credentials: {dashboard.observability.credentials}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
