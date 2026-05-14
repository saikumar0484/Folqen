import { Cloud, Eye, LockKeyhole, Rocket, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toHonestStatus } from "@/lib/status-semantics";
import type { PreviewDeploymentDashboard } from "@/lib/preview-deployment/types";

type PreviewDeploymentPanelProps = {
  dashboard: PreviewDeploymentDashboard;
};

function statusClass(status: string) {
  if (status === "Configured") return "border-neon/25 bg-neon/10 text-neon";
  if (status === "Needs approval") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  if (status === "Blocked") return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  return "border-white/10 bg-white/[0.04] text-muted-foreground";
}

export function PreviewDeploymentPanel({ dashboard }: PreviewDeploymentPanelProps) {
  return (
    <section className="space-y-4">
      <Card className="border-cyan-300/20 bg-black/30">
        <CardHeader>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="premium">
                  <Cloud className="h-3.5 w-3.5" />
                  Safe Preview Deployment
                </Badge>
                <Badge className={statusClass(toHonestStatus(dashboard.status))}>{toHonestStatus(dashboard.status)}</Badge>
                <Badge variant="safe">Dry-run forced</Badge>
                <Badge variant="safe">No live execution</Badge>
              </div>
              <CardTitle className="mt-3">Preview Build Readiness</CardTitle>
              <CardDescription>Vercel preview and local Docker preview checks for UI, workflow visualization, traces, and safe operational simulation.</CardDescription>
            </div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{dashboard.profile} / {dashboard.mode}</div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Checks", dashboard.summary.checks, "Preview preflight checks"],
            ["Blocked", dashboard.summary.blocked, "Unsafe flags to fix"],
            ["Warnings", dashboard.summary.warnings, "Needs setup or approval"],
            ["Configured", dashboard.summary.configured, "Preview-safe controls"],
          ].map(([label, value, hint]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="font-mono text-2xl text-neon">{value}</div>
              <div className="mt-1 text-sm font-medium">{label}</div>
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-neon" />
              Preview safety checks
            </CardTitle>
            <CardDescription>These checks must stay configured before a preview URL is shared for internal testing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.checks.map((check) => (
              <div key={check.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="text-sm font-medium">{check.label}</div>
                  <Badge className={statusClass(toHonestStatus(check.status))}>{toHonestStatus(check.status)}</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{check.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {check.evidence.slice(0, 4).map((item) => (
                    <Badge key={item} variant="neutral">
                      {item}
                    </Badge>
                  ))}
                </div>
                {check.status !== "Configured" ? <p className="mt-2 text-[11px] leading-5 text-amber-100/80">{check.recoveryAction}</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-neon" />
                Disabled runtime
              </CardTitle>
              <CardDescription>Preview is visualization only. These systems must remain off.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {dashboard.disabledRuntime.map((item) => (
                <Badge key={item} variant="warning">
                  {item}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-neon" />
                Preview-visible routes
              </CardTitle>
              <CardDescription>Routes expected to load for UI and operational visualization.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {dashboard.visibleRoutes.map((route) => (
                <Badge key={route} variant="neutral">
                  {route}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-neon" />
                Vercel preview commands
              </CardTitle>
              <CardDescription>Use preview environment variables only. Do not add provider/platform/render secrets.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {dashboard.deploymentCommands.map((command) => (
                <code key={command} className="block rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-muted-foreground">
                  {command}
                </code>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
