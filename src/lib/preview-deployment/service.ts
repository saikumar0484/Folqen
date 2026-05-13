import { getEnv } from "@/lib/env";
import type { DeploymentGovernanceStatus } from "@/lib/deployment-governance/types";
import type { PreviewDeploymentDashboard, PreviewReadinessCheck } from "./types";

function check(id: string, label: string, status: DeploymentGovernanceStatus, summary: string, evidence: string[], recoveryAction: string): PreviewReadinessCheck {
  return { id, label, status, summary, evidence, recoveryAction };
}

export function getPreviewDeploymentDashboard(source: NodeJS.ProcessEnv = process.env): PreviewDeploymentDashboard {
  const env = getEnv(source);
  const previewMode = env.PREVIEW_SAFE_MODE || env.FOLQEN_RUNTIME_PROFILE === "preview" || source.VERCEL_ENV === "preview";
  const checks: PreviewReadinessCheck[] = [
    check(
      "preview_profile",
      "Preview runtime profile",
      previewMode ? "Configured" : "Needs approval",
      previewMode ? "Preview-safe runtime indicators are present." : "Preview indicators are not enabled in this environment.",
      [`FOLQEN_RUNTIME_PROFILE=${env.FOLQEN_RUNTIME_PROFILE}`, `PREVIEW_SAFE_MODE=${env.PREVIEW_SAFE_MODE}`, `VERCEL_ENV=${source.VERCEL_ENV ?? "unset"}`],
      "For Vercel preview, set FOLQEN_RUNTIME_PROFILE=preview and PREVIEW_SAFE_MODE=true in preview environment variables.",
    ),
    check(
      "force_dry_run",
      "Forced dry-run execution",
      env.PREVIEW_FORCE_DRY_RUN && env.ORCHESTRATION_EXECUTION_MODE === "mock" && !env.ORCHESTRATION_WORKER_ENABLED ? "Configured" : "Blocked",
      env.PREVIEW_FORCE_DRY_RUN ? "Preview is configured to force dry-run mode." : "Preview dry-run mode is disabled.",
      [`PREVIEW_FORCE_DRY_RUN=${env.PREVIEW_FORCE_DRY_RUN}`, `ORCHESTRATION_EXECUTION_MODE=${env.ORCHESTRATION_EXECUTION_MODE}`, `ORCHESTRATION_WORKER_ENABLED=${env.ORCHESTRATION_WORKER_ENABLED}`],
      "Set PREVIEW_FORCE_DRY_RUN=true, ORCHESTRATION_EXECUTION_MODE=mock, and ORCHESTRATION_WORKER_ENABLED=false.",
    ),
    check("publishing_disabled", "Publishing disabled", env.ALLOW_PUBLIC_PUBLISH ? "Blocked" : "Configured", env.ALLOW_PUBLIC_PUBLISH ? "Public publishing is enabled." : "Public publishing is disabled.", [`ALLOW_PUBLIC_PUBLISH=${env.ALLOW_PUBLIC_PUBLISH}`], "Set ALLOW_PUBLIC_PUBLISH=false for every preview deployment."),
    check("paid_tools_disabled", "Paid tools disabled", env.ALLOW_PAID_TOOLS ? "Blocked" : "Configured", env.ALLOW_PAID_TOOLS ? "Paid tool usage is enabled." : "Paid tools are disabled.", [`ALLOW_PAID_TOOLS=${env.ALLOW_PAID_TOOLS}`], "Set ALLOW_PAID_TOOLS=false for preview."),
    check("live_ai_disabled", "Live AI disabled", env.ALLOW_LIVE_AI_EXECUTION || env.LIVE_AI_ACTIVATION_STAGE > 0 ? "Blocked" : "Configured", env.ALLOW_LIVE_AI_EXECUTION ? "Live AI execution is enabled." : "Live AI remains disabled.", [`ALLOW_LIVE_AI_EXECUTION=${env.ALLOW_LIVE_AI_EXECUTION}`, `LIVE_AI_ACTIVATION_STAGE=${env.LIVE_AI_ACTIVATION_STAGE}`], "Set ALLOW_LIVE_AI_EXECUTION=false and LIVE_AI_ACTIVATION_STAGE=0."),
    check("rendering_disabled", "Rendering disabled", env.ALLOW_CONTROLLED_MEDIA_EXECUTION || env.ALLOW_LIVE_THUMBNAIL_RENDERING || env.LIVE_MEDIA_ACTIVATION_STAGE > 0 || env.LIVE_THUMBNAIL_RENDER_STAGE > 0 ? "Blocked" : "Configured", "Preview must not run live rendering or controlled worker jobs.", [`ALLOW_CONTROLLED_MEDIA_EXECUTION=${env.ALLOW_CONTROLLED_MEDIA_EXECUTION}`, `ALLOW_LIVE_THUMBNAIL_RENDERING=${env.ALLOW_LIVE_THUMBNAIL_RENDERING}`, `LIVE_MEDIA_ACTIVATION_STAGE=${env.LIVE_MEDIA_ACTIVATION_STAGE}`, `LIVE_THUMBNAIL_RENDER_STAGE=${env.LIVE_THUMBNAIL_RENDER_STAGE}`], "Keep all media/render execution flags false or zero."),
    check("browser_disabled", "Browser execution disabled", env.ALLOW_BROWSER_AUTOMATION || !env.BROWSER_OPERATIONS_SANDBOX_MODE || env.BROWSER_OPERATIONS_KILL_SWITCH ? "Blocked" : "Configured", env.ALLOW_BROWSER_AUTOMATION ? "Browser automation is enabled." : "Browser Operations is sandbox/dry-run only.", [`ALLOW_BROWSER_AUTOMATION=${env.ALLOW_BROWSER_AUTOMATION}`, `BROWSER_OPERATIONS_SANDBOX_MODE=${env.BROWSER_OPERATIONS_SANDBOX_MODE}`, `BROWSER_OPERATIONS_KILL_SWITCH=${env.BROWSER_OPERATIONS_KILL_SWITCH}`], "Set ALLOW_BROWSER_AUTOMATION=false and keep sandbox mode true."),
    check("secrets_minimal", "No production secrets required", env.AUTH_SECRET && env.DATABASE_URL ? "Configured" : "Needs approval", "Preview can render the UI with auth/database envs when configured, but no provider/platform secrets are required.", [`AUTH_SECRET=${env.AUTH_SECRET ? "configured" : "missing"}`, `DATABASE_URL=${env.DATABASE_URL ? "configured" : "missing"}`], "Use preview-only AUTH_SECRET/DATABASE_URL values; do not paste production provider or platform secrets."),
  ];
  const blocked = checks.filter((item) => item.status === "Blocked").length;
  const warnings = checks.filter((item) => item.status === "Needs approval" || item.status === "Not connected").length;
  const configured = checks.filter((item) => item.status === "Configured").length;

  return {
    mode: "preview_safe",
    generatedAt: new Date().toISOString(),
    status: blocked > 0 ? "Blocked" : warnings > 0 ? "Needs approval" : "Configured",
    profile: env.FOLQEN_RUNTIME_PROFILE,
    summary: {
      checks: checks.length,
      blocked,
      warnings,
      configured,
    },
    checks,
    disabledRuntime: [
      "public publishing",
      "real AI provider execution",
      "media rendering",
      "browser execution",
      "queue workers",
      "autonomous retries",
      "platform account automation",
      "workflow mutation",
    ],
    visibleRoutes: ["/dashboard", "/agents", "/workflows", "/research-intelligence", "/content-studio", "/analytics", "/approvals", "/audit", "/browser-operations", "/infrastructure"],
    requiredEnv: ["AUTH_SECRET", "DATABASE_URL", "NEXTAUTH_URL", "APP_BASE_URL", "FOLQEN_RUNTIME_PROFILE=preview", "PREVIEW_SAFE_MODE=true", "PREVIEW_FORCE_DRY_RUN=true"],
    deploymentCommands: ["vercel env add FOLQEN_RUNTIME_PROFILE preview", "vercel env add PREVIEW_SAFE_MODE preview", "vercel env add PREVIEW_FORCE_DRY_RUN preview", "vercel deploy"],
    notes: [
      "Preview mode is for visualization and internal testing only.",
      "Do not add provider, platform, render worker, OAuth, or paid-tool secrets to preview unless a later phase explicitly approves it.",
      "Preview diagnostics are read-only and do not activate providers or workers.",
    ],
  };
}
