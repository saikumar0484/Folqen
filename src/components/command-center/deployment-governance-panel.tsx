import { AlertTriangle, Database, KeyRound, LockKeyhole, RotateCcw, ServerCog, ShieldCheck, TerminalSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DeploymentGovernanceStatus, DeploymentReadinessDashboard } from "@/lib/deployment-governance/types";

type DeploymentGovernancePanelProps = {
  dashboard: DeploymentReadinessDashboard;
};

function statusClass(status: DeploymentGovernanceStatus | string) {
  if (status === "Live" || status === "Configured") return "border-neon/25 bg-neon/10 text-neon";
  if (status === "Needs approval" || status === "Mock") return "border-amber-300/25 bg-amber-300/10 text-amber-100";
  if (status === "Blocked") return "border-rose-300/25 bg-rose-300/10 text-rose-100";
  return "border-white/10 bg-white/[0.04] text-muted-foreground";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function DeploymentGovernancePanel({ dashboard }: DeploymentGovernancePanelProps) {
  const blockedChecks = [...dashboard.environment, ...dashboard.observability].filter((item) => item.status === "Blocked");
  const attentionSecrets = dashboard.secrets.filter((item) => item.status === "Blocked" || item.status === "Needs approval" || item.status === "Not connected");

  return (
    <section className="space-y-4">
      <Card className="border-neon/20 bg-black/30">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="premium">
                  <ServerCog className="h-3.5 w-3.5" />
                  Deployment Governance
                </Badge>
                <Badge className={statusClass(dashboard.readinessStatus)}>Readiness {dashboard.readinessStatus}</Badge>
                <Badge variant={dashboard.productionSafe ? "safe" : "warning"}>{dashboard.productionSafe ? "Production-safe flags" : "Preflight flags"}</Badge>
                <Badge variant="safe">No activation</Badge>
              </div>
              <CardTitle className="mt-3">Production Environment & Startup Integrity</CardTitle>
              <CardDescription>Read-only production readiness, secret governance, startup safety, rollback posture, Docker/VPS readiness, and deployment diagnostics without exposing secrets.</CardDescription>
            </div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {dashboard.runtimeProfile} / {dashboard.startupMode} / {formatDate(dashboard.generatedAt)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["Checks", dashboard.summary.checks, "Total readiness checks"],
            ["Blocked", dashboard.summary.blocked, "Must fix before launch"],
            ["Warnings", dashboard.summary.warnings, "Needs approval or setup"],
            ["Secrets", dashboard.summary.configuredSecrets, "Configured, masked only"],
            ["Missing", dashboard.summary.missingRequiredSecrets, "Required secret gaps"],
          ].map(([label, value, hint]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="font-mono text-2xl text-neon">{value}</div>
              <div className="mt-1 text-sm font-medium">{label}</div>
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-neon" />
              Environment validation
            </CardTitle>
            <CardDescription>Required envs, unsafe defaults, startup profile mismatch, queue startup, provider activation, and production safety gates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.environment.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{item.category}</div>
                    <div className="mt-1 text-sm font-medium">{item.label}</div>
                  </div>
                  <Badge className={statusClass(item.status)}>{item.status}</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.evidence.slice(0, 4).map((evidence) => (
                    <Badge key={evidence} variant="neutral">
                      {evidence}
                    </Badge>
                  ))}
                </div>
                {item.status === "Blocked" || item.status === "Needs approval" ? <p className="mt-2 text-[11px] leading-5 text-amber-100/80">{item.recoveryAction}</p> : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-neon" />
              Secret governance
            </CardTitle>
            <CardDescription>Secret presence and format checks. Values are masked and never rendered raw.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.secrets.map((secret) => (
              <div key={secret.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{secret.envKey}</div>
                    <div className="mt-1 font-mono text-xs text-muted-foreground">{secret.maskedValue}</div>
                  </div>
                  <Badge className={statusClass(secret.status)}>{secret.status}</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{secret.summary}</p>
                <p className="mt-2 text-[11px] leading-5 text-amber-100/80">{secret.rotationGuidance}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TerminalSquare className="h-4 w-4 text-neon" />
              Startup integrity
            </CardTitle>
            <CardDescription>Boot-time kill switch, dry-run mode, rollback mode, and quarantine mode.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.startupIntegrity.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{item.label}</div>
                  <Badge className={statusClass(item.status)}>{item.status}</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.summary}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.controls.map((control) => (
                    <Badge key={control} variant="neutral">
                      {control}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4 text-neon" />
              Runtime diagnostics
            </CardTitle>
            <CardDescription>Database, Redis, queue, and metadata masking diagnostics for production readiness.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.observability.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{item.label}</div>
                  <Badge className={statusClass(item.status)}>{item.status}</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.summary}</p>
                <p className="mt-2 text-[11px] leading-5 text-amber-100/80">{item.recoveryAction}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-neon" />
              Rollback readiness
            </CardTitle>
            <CardDescription>Reversible deployment controls for dry-run return, provider quarantine, and database recovery.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.rollbackReadiness.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{item.label}</div>
                  <Badge className={statusClass(item.status)}>{item.status}</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.summary}</p>
                <ol className="mt-2 space-y-1 text-[11px] leading-5 text-muted-foreground">
                  {item.rollbackSteps.slice(0, 4).map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Docker deployment profiles</CardTitle>
            <CardDescription>Compose and Coolify deployment profiles with persistence and safety assumptions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.dockerProfiles.map((profile) => (
              <div key={profile.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-medium">{profile.name}</div>
                  <Badge className={statusClass(profile.status)}>{profile.status}</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">Services: {profile.services.join(", ")}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Persistence: {profile.persistence.join(", ")}</p>
                <p className="mt-1 text-[11px] leading-5 text-amber-100/80">Safety: {profile.safety.join(", ")}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>VPS and recovery readiness</CardTitle>
            <CardDescription>Oracle VPS, Hetzner VPS, Coolify, reverse proxy, and backup checks before production deployment.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {dashboard.vpsReadiness.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-medium">{item.target}</div>
                  <Badge className={statusClass(item.status)}>{item.status}</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.summary}</p>
                <div className="mt-2 space-y-1 text-[11px] leading-5 text-muted-foreground">
                  {item.requiredActions.slice(0, 3).map((action) => (
                    <p key={action}>{action}</p>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {blockedChecks.length || attentionSecrets.length ? (
        <Card className="border-amber-300/20 bg-amber-300/[0.05]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-200" />
              Launch blockers and approval items
            </CardTitle>
            <CardDescription>These are the items that should be resolved before controlled rendering, publishing, or production deployment.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2">
            {[...blockedChecks.map((item) => `${item.label}: ${item.recoveryAction}`), ...attentionSecrets.map((item) => `${item.envKey}: ${item.summary}`)].slice(0, 8).map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/25 p-3 text-xs leading-5 text-muted-foreground">
                <LockKeyhole className="mb-2 h-3.5 w-3.5 text-amber-200" />
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="rounded-2xl border border-neon/20 bg-neon/[0.04] p-4 text-xs leading-6 text-muted-foreground">
        {dashboard.notes.map((note) => (
          <p key={note}>{note}</p>
        ))}
      </div>
    </section>
  );
}
