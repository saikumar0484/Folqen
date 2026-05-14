import { getDatabaseStatus } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { getQueueHealth } from "@/lib/orchestration/queue";
import { getRedisStatus } from "@/lib/orchestration/redis";
import type {
  DeploymentCheck,
  DeploymentGovernanceStatus,
  DeploymentReadinessDashboard,
  DockerDeploymentProfile,
  RuntimeProfile,
  SecretGovernanceCheck,
  StartupIntegrityCheck,
  VpsReadinessCheck,
} from "./types";

type RuntimeFacts = {
  databaseStatus?: Awaited<ReturnType<typeof getDatabaseStatus>>;
  redisStatus?: Awaited<ReturnType<typeof getRedisStatus>>;
  queueHealth?: Awaited<ReturnType<typeof getQueueHealth>>;
};

const productionProfiles: RuntimeProfile[] = ["docker", "vps", "coolify", "vercel"];

function isProductionProfile(profile: RuntimeProfile) {
  return productionProfiles.includes(profile);
}

function isBlank(value: string | undefined) {
  return !value || value.trim().length === 0;
}

function looksPlaceholder(value: string | undefined) {
  return !value || /replace-with|example|changeme|placeholder|dummy|folqen_password/i.test(value);
}

function maskSecret(value: string | undefined) {
  if (isBlank(value)) return "Not configured";
  const trimmed = value?.trim() ?? "";
  if (trimmed.length <= 8) return "***";
  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
}

function check(id: DeploymentCheck["id"], category: DeploymentCheck["category"], label: string, status: DeploymentGovernanceStatus, summary: string, evidence: string[], recoveryAction: string): DeploymentCheck {
  const severity = status === "Blocked" ? "critical" : status === "Needs approval" || status === "Not connected" ? "warning" : status === "Mock" ? "info" : "info";
  return { id, category, label, status, severity, summary, evidence, recoveryAction };
}

function secretCheck(input: {
  id: string;
  envKey: string;
  value: string | undefined;
  profile: RuntimeProfile;
  requiredFor: RuntimeProfile[];
  validator?: (value: string | undefined) => { ok: boolean; reason: string };
  configuredStatus?: DeploymentGovernanceStatus;
  rotationGuidance: string;
}): SecretGovernanceCheck {
  const required = input.requiredFor.includes(input.profile);
  const configured = !isBlank(input.value);
  const validation = input.validator?.(input.value) ?? { ok: configured && !looksPlaceholder(input.value), reason: configured ? "Secret is configured." : "Secret is missing." };
  const status: DeploymentGovernanceStatus = configured
    ? validation.ok
      ? input.configuredStatus ?? "Configured"
      : required
        ? "Blocked"
        : "Needs approval"
    : required
      ? "Blocked"
      : "Not connected";

  return {
    id: input.id,
    envKey: input.envKey,
    status,
    requiredFor: input.requiredFor,
    configured,
    maskedValue: maskSecret(input.value),
    summary: configured ? validation.reason : `${input.envKey} is not configured for this environment.`,
    rotationGuidance: input.rotationGuidance,
  };
}

function authSecretValidator(value: string | undefined) {
  if (isBlank(value)) return { ok: false, reason: "AUTH_SECRET is missing." };
  if (looksPlaceholder(value)) return { ok: false, reason: "AUTH_SECRET still looks like a placeholder." };
  if ((value ?? "").trim().length < 32) return { ok: false, reason: "AUTH_SECRET should be at least 32 characters for production sessions." };
  return { ok: true, reason: "AUTH_SECRET length and placeholder checks passed." };
}

function databaseUrlValidator(value: string | undefined) {
  if (isBlank(value)) return { ok: false, reason: "DATABASE_URL is missing." };
  if (!/^postgres(ql)?:\/\//i.test(value ?? "")) return { ok: false, reason: "DATABASE_URL must be a PostgreSQL connection string." };
  if (looksPlaceholder(value)) return { ok: false, reason: "DATABASE_URL still contains example credentials." };
  return { ok: true, reason: "DATABASE_URL format check passed." };
}

function redisUrlValidator(value: string | undefined) {
  if (isBlank(value)) return { ok: false, reason: "REDIS_URL is missing." };
  if (!/^redis(s)?:\/\//i.test(value ?? "")) return { ok: false, reason: "REDIS_URL must be a Redis connection string." };
  return { ok: true, reason: "REDIS_URL format check passed." };
}

function baseEnvironmentChecks(source: NodeJS.ProcessEnv): DeploymentCheck[] {
  const env = getEnv(source);
  const profile = env.FOLQEN_RUNTIME_PROFILE;
  const production = isProductionProfile(profile);
  const nodeEnv = source.NODE_ENV ?? "development";
  const checks: DeploymentCheck[] = [
    check("runtime_profile", "environment", "Runtime profile", production ? "Needs approval" : "Mock", `${profile} runtime profile selected.`, [`NODE_ENV=${nodeEnv}`, `FOLQEN_RUNTIME_PROFILE=${profile}`], "Use docker, vps, coolify, or vercel only after production secrets and rollback procedures are ready."),
    check("human_approval", "security", "Human approval default", env.REQUIRE_HUMAN_APPROVAL ? "Configured" : "Blocked", env.REQUIRE_HUMAN_APPROVAL ? "Human approvals are required for risky actions." : "Human approvals are disabled, which is unsafe for production.", [`REQUIRE_HUMAN_APPROVAL=${env.REQUIRE_HUMAN_APPROVAL}`], "Set REQUIRE_HUMAN_APPROVAL=true before any deployment."),
    check("public_publish_guard", "security", "Public publishing guard", env.ALLOW_PUBLIC_PUBLISH ? "Blocked" : "Configured", env.ALLOW_PUBLIC_PUBLISH ? "Public publishing is enabled and must not be active before production approval." : "Public publishing is blocked by default.", [`ALLOW_PUBLIC_PUBLISH=${env.ALLOW_PUBLIC_PUBLISH}`], "Keep ALLOW_PUBLIC_PUBLISH=false until the publishing phase receives explicit approval."),
    check("paid_tool_guard", "security", "Paid tool guard", env.ALLOW_PAID_TOOLS ? "Blocked" : "Configured", env.ALLOW_PAID_TOOLS ? "Paid tools are enabled and could create uncontrolled spend." : "Paid tools are blocked by default.", [`ALLOW_PAID_TOOLS=${env.ALLOW_PAID_TOOLS}`], "Keep ALLOW_PAID_TOOLS=false for the low-cost MVP."),
    check("browser_automation_guard", "security", "Browser automation guard", env.ALLOW_BROWSER_AUTOMATION ? "Blocked" : "Configured", env.ALLOW_BROWSER_AUTOMATION ? "Browser automation is enabled and must remain off before account governance." : "Browser automation is blocked by default.", [`ALLOW_BROWSER_AUTOMATION=${env.ALLOW_BROWSER_AUTOMATION}`], "Keep ALLOW_BROWSER_AUTOMATION=false until account automation has a reviewed policy."),
    check("upload_privacy", "security", "Upload privacy default", env.DEFAULT_UPLOAD_PRIVACY === "private" ? "Configured" : env.DEFAULT_UPLOAD_PRIVACY === "public" ? "Blocked" : "Needs approval", `Default upload privacy is ${env.DEFAULT_UPLOAD_PRIVACY}.`, [`DEFAULT_UPLOAD_PRIVACY=${env.DEFAULT_UPLOAD_PRIVACY}`], "Use DEFAULT_UPLOAD_PRIVACY=private until public publishing is explicitly approved."),
    check("startup_validation", "startup", "Startup validation", env.REQUIRE_STARTUP_VALIDATION ? "Configured" : production ? "Blocked" : "Needs approval", env.REQUIRE_STARTUP_VALIDATION ? "Startup validation is required." : "Startup validation can be bypassed.", [`REQUIRE_STARTUP_VALIDATION=${env.REQUIRE_STARTUP_VALIDATION}`], "Set REQUIRE_STARTUP_VALIDATION=true before deployment."),
    check("startup_safety_mode", "startup", "Startup safety mode", env.STARTUP_KILL_SWITCH ? "Blocked" : env.STARTUP_QUARANTINE_MODE || env.STARTUP_ROLLBACK_MODE || env.STARTUP_DRY_RUN_MODE ? "Configured" : production ? "Needs approval" : "Mock", "Startup safety controls are available without enabling dangerous runtime paths.", [`STARTUP_DRY_RUN_MODE=${env.STARTUP_DRY_RUN_MODE}`, `STARTUP_ROLLBACK_MODE=${env.STARTUP_ROLLBACK_MODE}`, `STARTUP_QUARANTINE_MODE=${env.STARTUP_QUARANTINE_MODE}`, `STARTUP_KILL_SWITCH=${env.STARTUP_KILL_SWITCH}`], "Use dry-run or rollback mode for first production boot, and engage kill switch only during incidents."),
    check(
      "preview_safe_mode",
      "environment",
      "Preview safe mode",
      env.PREVIEW_SAFE_MODE || profile === "preview" || source.VERCEL_ENV === "preview" ? (env.PREVIEW_FORCE_DRY_RUN ? "Configured" : "Blocked") : "Mock",
      env.PREVIEW_SAFE_MODE || profile === "preview" || source.VERCEL_ENV === "preview" ? "Preview deployment indicators are active." : "Preview mode is available but not active.",
      [`PREVIEW_SAFE_MODE=${env.PREVIEW_SAFE_MODE}`, `PREVIEW_FORCE_DRY_RUN=${env.PREVIEW_FORCE_DRY_RUN}`, `VERCEL_ENV=${source.VERCEL_ENV ?? "unset"}`],
      "Set PREVIEW_SAFE_MODE=true and PREVIEW_FORCE_DRY_RUN=true for Vercel preview deployments.",
    ),
    check("live_ai_guard", "runtime", "Live AI runtime guard", env.ALLOW_LIVE_AI_EXECUTION || env.LIVE_AI_ACTIVATION_STAGE > 0 ? "Needs approval" : "Mock", env.ALLOW_LIVE_AI_EXECUTION ? "Live AI execution flag is on and still requires approvals, budgets, quotas, and provider checks." : "Live AI execution remains disabled by default.", [`ALLOW_LIVE_AI_EXECUTION=${env.ALLOW_LIVE_AI_EXECUTION}`, `LIVE_AI_ACTIVATION_STAGE=${env.LIVE_AI_ACTIVATION_STAGE}`], "Keep live AI disabled unless executing a previously approved Gemini-only workflow."),
    check("media_execution_guard", "runtime", "Media execution guard", env.ALLOW_CONTROLLED_MEDIA_EXECUTION || env.LIVE_MEDIA_ACTIVATION_STAGE > 0 ? "Needs approval" : "Mock", env.ALLOW_CONTROLLED_MEDIA_EXECUTION ? "Controlled media execution flag is on and requires render governance." : "Controlled rendering remains disabled by default.", [`ALLOW_CONTROLLED_MEDIA_EXECUTION=${env.ALLOW_CONTROLLED_MEDIA_EXECUTION}`, `LIVE_MEDIA_ACTIVATION_STAGE=${env.LIVE_MEDIA_ACTIVATION_STAGE}`], "Keep media execution disabled until the controlled rendering phase is approved."),
    check(
      "live_thumbnail_guard",
      "runtime",
      "Live thumbnail render guard",
      env.ALLOW_LIVE_THUMBNAIL_RENDERING || env.LIVE_THUMBNAIL_RENDER_STAGE > 0 ? "Needs approval" : "Mock",
      env.ALLOW_LIVE_THUMBNAIL_RENDERING ? "Live thumbnail rendering is enabled and still requires approval IDs, worker secrets, quotas, validation, and rollback controls." : "Live thumbnail rendering remains disabled by default.",
      [`ALLOW_LIVE_THUMBNAIL_RENDERING=${env.ALLOW_LIVE_THUMBNAIL_RENDERING}`, `LIVE_THUMBNAIL_RENDER_STAGE=${env.LIVE_THUMBNAIL_RENDER_STAGE}`, `THUMBNAIL_RENDER_PROVIDER=${env.THUMBNAIL_RENDER_PROVIDER}`],
      "Enable only the controlled local_worker thumbnail path after a supervised approval-gated render rehearsal.",
    ),
    check(
      "browser_operations_guard",
      "runtime",
      "Browser operations guard",
      env.ALLOW_BROWSER_AUTOMATION || !env.BROWSER_OPERATIONS_SANDBOX_MODE || env.BROWSER_OPERATIONS_KILL_SWITCH ? "Blocked" : "Mock",
      env.ALLOW_BROWSER_AUTOMATION ? "Browser automation flag is enabled, but Browser Operations must remain dry-run in preview." : "Browser Operations remains dry-run and sandbox-only by default.",
      [`ALLOW_BROWSER_AUTOMATION=${env.ALLOW_BROWSER_AUTOMATION}`, `BROWSER_OPERATIONS_SANDBOX_MODE=${env.BROWSER_OPERATIONS_SANDBOX_MODE}`, `BROWSER_OPERATIONS_KILL_SWITCH=${env.BROWSER_OPERATIONS_KILL_SWITCH}`],
      "Keep ALLOW_BROWSER_AUTOMATION=false, sandbox mode true, and the kill switch clear unless intentionally isolating Browser Operations.",
    ),
    check("queue_startup", "runtime", "Queue startup mode", env.ORCHESTRATION_EXECUTION_MODE === "live" ? (env.REDIS_URL ? "Needs approval" : "Blocked") : "Mock", env.ORCHESTRATION_EXECUTION_MODE === "live" ? "Live orchestration queue mode has been requested." : "Orchestration queues are in mock-safe mode.", [`ORCHESTRATION_EXECUTION_MODE=${env.ORCHESTRATION_EXECUTION_MODE}`, `ORCHESTRATION_WORKER_ENABLED=${env.ORCHESTRATION_WORKER_ENABLED}`], "Use mock queue mode until Redis persistence, worker processes, and recovery checks pass."),
  ];

  if (production && /^postgres(ql)?:\/\/[^@]*@(?:localhost|127\.0\.0\.1)/i.test(env.DATABASE_URL ?? "")) {
    checks.push(check("production_local_database", "environment", "Production database host", "Blocked", "Production profile points DATABASE_URL at localhost, which usually breaks container/VPS separation and recovery.", ["DATABASE_URL host appears local"], "Use the Docker service hostname, managed Postgres URL, or Supabase pooled connection in production."));
  }

  if (nodeEnv === "production" && profile === "local") {
    checks.push(check("node_profile_mismatch", "environment", "Runtime profile mismatch", "Needs approval", "NODE_ENV is production while Folqen runtime profile is local.", [`NODE_ENV=${nodeEnv}`, "FOLQEN_RUNTIME_PROFILE=local"], "Set FOLQEN_RUNTIME_PROFILE to docker, vps, coolify, or vercel before production deployment."));
  }

  return checks;
}

function secretChecks(source: NodeJS.ProcessEnv): SecretGovernanceCheck[] {
  const env = getEnv(source);
  const profile = env.FOLQEN_RUNTIME_PROFILE;
  const queueLive = env.ORCHESTRATION_EXECUTION_MODE === "live" || env.ORCHESTRATION_WORKER_ENABLED;
  const redisRequiredFor = queueLive ? productionProfiles : [];

  return [
    secretCheck({ id: "auth_secret", envKey: "AUTH_SECRET", value: env.AUTH_SECRET, profile, requiredFor: productionProfiles, validator: authSecretValidator, rotationGuidance: "Generate a unique random secret per environment and rotate sessions after suspected exposure." }),
    secretCheck({ id: "database_url", envKey: "DATABASE_URL", value: env.DATABASE_URL, profile, requiredFor: productionProfiles, validator: databaseUrlValidator, rotationGuidance: "Store database credentials in the platform secret manager and rotate the database password before public launch." }),
    secretCheck({ id: "redis_url", envKey: "REDIS_URL", value: env.REDIS_URL, profile, requiredFor: redisRequiredFor, validator: redisUrlValidator, rotationGuidance: "Use a private Redis endpoint with persistence enabled and rotate Redis credentials if exposed." }),
    secretCheck({ id: "gemini_key", envKey: "GEMINI_API_KEY", value: env.GEMINI_API_KEY, profile, requiredFor: [], configuredStatus: "Needs approval", rotationGuidance: "Keep Gemini disabled until governance approval, daily quota, and kill-switch checks pass." }),
    secretCheck({ id: "openrouter_key", envKey: "OPENROUTER_API_KEY", value: env.OPENROUTER_API_KEY, profile, requiredFor: [], configuredStatus: "Needs approval", rotationGuidance: "Do not enable OpenRouter before provider governance and budget limits are approved." }),
    secretCheck({ id: "anthropic_key", envKey: "ANTHROPIC_API_KEY", value: env.ANTHROPIC_API_KEY || env.CLAUDE_API_KEY, profile, requiredFor: [], configuredStatus: "Needs approval", rotationGuidance: "Do not enable Claude providers before provider governance and budget limits are approved." }),
    secretCheck({ id: "credential_key", envKey: "CREDENTIAL_ENCRYPTION_KEY", value: env.CREDENTIAL_ENCRYPTION_KEY, profile, requiredFor: productionProfiles, validator: (value) => (isBlank(value) ? { ok: false, reason: "Credential encryption key is missing." } : (value ?? "").length >= 32 ? { ok: true, reason: "Credential encryption key length check passed." } : { ok: false, reason: "Credential encryption key should be at least 32 characters." }), rotationGuidance: "Use one per environment and document a credential vault re-encryption procedure before OAuth integrations." }),
  ];
}

function startupChecks(source: NodeJS.ProcessEnv): StartupIntegrityCheck[] {
  const env = getEnv(source);
  return [
    {
      id: "startup_kill_switch",
      label: "Startup kill switch",
      status: env.STARTUP_KILL_SWITCH ? "Blocked" : "Configured",
      summary: env.STARTUP_KILL_SWITCH ? "Startup kill switch is engaged; production boot should halt dangerous services." : "Startup kill switch is clear.",
      controls: ["preflight_required", "no_provider_activation", "no_publishing", "no_rendering"],
    },
    {
      id: "startup_dry_run",
      label: "Dry-run startup",
      status: env.STARTUP_DRY_RUN_MODE ? "Mock" : "Needs approval",
      summary: env.STARTUP_DRY_RUN_MODE ? "First boot can run in dry-run mode with mock-safe execution paths." : "Dry-run startup is disabled.",
      controls: ["mock_safe_workers", "queue_observation_only", "provider_simulation"],
    },
    {
      id: "rollback_mode",
      label: "Rollback mode",
      status: env.STARTUP_ROLLBACK_MODE ? "Configured" : "Mock",
      summary: env.STARTUP_ROLLBACK_MODE ? "Rollback startup mode is engaged for controlled recovery." : "Rollback mode is available but not engaged.",
      controls: ["disable_providers", "drain_queues", "return_to_dry_run"],
    },
    {
      id: "quarantine_mode",
      label: "Runtime quarantine",
      status: env.STARTUP_QUARANTINE_MODE ? "Configured" : "Mock",
      summary: env.STARTUP_QUARANTINE_MODE ? "Runtime quarantine is engaged; external execution should be isolated." : "Quarantine mode is available but not engaged.",
      controls: ["quarantine_providers", "block_external_accounts", "audit_only"],
    },
  ];
}

function dockerProfiles(): DockerDeploymentProfile[] {
  return [
    {
      id: "compose_support",
      name: "Docker Compose production profile",
      status: "Configured",
      services: ["folqen-web", "postgres", "redis"],
      persistence: ["postgres volume", "redis appendonly volume", "manual backup mount points"],
      safety: ["env validation", "dry-run startup", "public publishing disabled", "paid tools disabled"],
    },
    {
      id: "coolify_support",
      name: "Coolify-ready VPS deployment",
      status: "Configured",
      services: ["Next.js app service", "PostgreSQL service", "Redis service"],
      persistence: ["Coolify volumes", "scheduled database backups", "Redis appendonly persistence"],
      safety: ["secret manager only", "healthcheck endpoint", "rollback to previous deployment"],
    },
  ];
}

function vpsChecks(profile: RuntimeProfile): VpsReadinessCheck[] {
  return [
    {
      id: "oracle_vps",
      target: "Oracle VPS",
      status: profile === "vps" ? "Needs approval" : "Configured",
      summary: "Oracle Always Free can host the low-cost MVP if swap, firewall, Docker, volumes, and backups are configured.",
      requiredActions: ["Enable UFW for 22/80/443 only", "Use Docker volumes for Postgres and Redis", "Keep app behind reverse proxy TLS", "Test restore from backup"],
    },
    {
      id: "hetzner_vps",
      target: "Hetzner VPS",
      status: profile === "vps" ? "Needs approval" : "Configured",
      summary: "Hetzner is suitable for production after DNS, firewall, snapshots, and volume backup policy are documented.",
      requiredActions: ["Create non-root deploy user", "Enable automatic security updates", "Use provider snapshots plus Postgres dumps", "Document rollback command"],
    },
    {
      id: "coolify",
      target: "Coolify",
      status: profile === "coolify" ? "Needs approval" : "Configured",
      summary: "Coolify deployment is supported through environment secrets, persistent services, and health checks.",
      requiredActions: ["Paste real secrets into Coolify only", "Use docker-compose.production.yml", "Enable healthcheck and deployment rollback", "Do not expose Postgres/Redis publicly"],
    },
    {
      id: "reverse_proxy",
      target: "Reverse proxy",
      status: "Configured",
      summary: "Reverse proxy guidance is documented for TLS termination, security headers, and app-only exposure.",
      requiredActions: ["Terminate TLS at Caddy/Nginx/Coolify", "Forward only app port", "Keep database and Redis private", "Preserve security headers"],
    },
    {
      id: "backups",
      target: "Backups",
      status: "Needs approval",
      summary: "Backup and disaster recovery procedures are documented but must be rehearsed with production-sized data.",
      requiredActions: ["Daily pg_dump", "Weekly off-host backup copy", "Redis appendonly persistence", "Restore rehearsal before launch"],
    },
  ];
}

function rollbackChecks(): DeploymentReadinessDashboard["rollbackReadiness"] {
  return [
    {
      id: "rollback_to_dry_run",
      label: "Rollback to dry-run",
      status: "Configured",
      summary: "Folqen can return to mock-safe execution by disabling live provider/media flags and engaging rollback mode.",
      rollbackSteps: ["Set STARTUP_ROLLBACK_MODE=true", "Set ALLOW_LIVE_AI_EXECUTION=false", "Set ALLOW_CONTROLLED_MEDIA_EXECUTION=false", "Drain worker queues", "Redeploy previous image if needed"],
    },
    {
      id: "provider_quarantine",
      label: "Provider quarantine",
      status: "Configured",
      summary: "Provider execution remains gated and can be quarantined without deleting credentials.",
      rollbackSteps: ["Set STARTUP_QUARANTINE_MODE=true", "Set AI_RUNTIME_EMERGENCY_STOP=true", "Set MEDIA_RENDER_EMERGENCY_STOP=true", "Audit recent provider traces"],
    },
    {
      id: "database_recovery",
      label: "Database recovery",
      status: "Needs approval",
      summary: "Database rollback requires a tested backup restore and human approval before replacing production data.",
      rollbackSteps: ["Stop app writes", "Take final snapshot", "Restore verified pg_dump to staging", "Promote restored database only after approval"],
    },
  ];
}

function observabilityChecks(facts: RuntimeFacts): DeploymentCheck[] {
  const database = facts.databaseStatus;
  const redis = facts.redisStatus;
  const queues = facts.queueHealth ?? [];
  const failedQueues = queues.filter((queue) => queue.failed > 0);

  return [
    check("database_health", "observability", "Database health", database?.status === "live" ? "Live" : database?.status === "failed" ? "Blocked" : "Not connected", database?.message ?? "Database health was not checked.", [database?.status ? `database=${database.status}` : "database=unknown"], "Configure DATABASE_URL and verify a read-only SELECT 1 check before deployment."),
    check("redis_health", "observability", "Redis health", redis?.status === "connected" ? "Live" : redis?.status === "configured_mocked" ? "Mock" : redis?.status === "error" ? "Blocked" : "Not connected", redis?.message ?? "Redis health was not checked.", [redis?.status ? `redis=${redis.status}` : "redis=unknown", redis?.mode ? `mode=${redis.mode}` : "mode=unknown"], "Keep Redis private, persistent, and mock-safe until workers are approved."),
    check("queue_health", "observability", "Queue health", failedQueues.length ? "Blocked" : queues.length ? "Mock" : "Not connected", failedQueues.length ? `${failedQueues.length} queue(s) contain failed jobs.` : `${queues.length} orchestration queues are visible for diagnostics.`, [`queues=${queues.length}`, `failedQueues=${failedQueues.length}`], "Inspect failed queues and keep workers disabled until deployment readiness passes."),
    check("secret_masking", "observability", "Secret masking", "Configured", "Deployment diagnostics return masked secret presence only, never raw values.", ["maskedValue only", "protected API only"], "Review diagnostics access rules before exposing production dashboards."),
  ];
}

function startupMode(source: NodeJS.ProcessEnv): DeploymentReadinessDashboard["startupMode"] {
  const env = getEnv(source);
  if (env.STARTUP_KILL_SWITCH) return "kill_switch";
  if (env.STARTUP_QUARANTINE_MODE) return "quarantine";
  if (env.STARTUP_ROLLBACK_MODE) return "rollback";
  if (env.STARTUP_DRY_RUN_MODE) return "dry_run";
  return "normal";
}

function readinessStatus(allChecks: Array<DeploymentCheck | SecretGovernanceCheck | StartupIntegrityCheck>, profile: RuntimeProfile): DeploymentGovernanceStatus {
  if (allChecks.some((item) => item.status === "Blocked")) return "Blocked";
  if (allChecks.some((item) => item.status === "Needs approval")) return "Needs approval";
  if (isProductionProfile(profile)) return "Configured";
  return "Mock";
}

export function buildDeploymentGovernanceDashboard(source: NodeJS.ProcessEnv = process.env, facts: RuntimeFacts = {}): DeploymentReadinessDashboard {
  const env = getEnv(source);
  const environment = baseEnvironmentChecks(source);
  const secrets = secretChecks(source);
  const startupIntegrity = startupChecks(source);
  const observability = observabilityChecks(facts);
  const profile = env.FOLQEN_RUNTIME_PROFILE;
  const allChecks = [...environment, ...secrets, ...startupIntegrity, ...observability];
  const blocked = allChecks.filter((item) => item.status === "Blocked").length;
  const warnings = allChecks.filter((item) => item.status === "Needs approval" || item.status === "Not connected").length;
  const requiredMissing = secrets.filter((item) => item.status === "Blocked").length;
  const status = readinessStatus(allChecks, profile);

  return {
    mode: "read_only",
    generatedAt: new Date().toISOString(),
    runtimeProfile: profile,
    readinessStatus: status,
    startupMode: startupMode(source),
    productionSafe: blocked === 0 && env.REQUIRE_HUMAN_APPROVAL && !env.ALLOW_PUBLIC_PUBLISH && !env.ALLOW_PAID_TOOLS && !env.ALLOW_BROWSER_AUTOMATION,
    summary: {
      checks: allChecks.length,
      blocked,
      warnings,
      configuredSecrets: secrets.filter((item) => item.configured).length,
      missingRequiredSecrets: requiredMissing,
    },
    environment,
    secrets,
    startupIntegrity,
    dockerProfiles: dockerProfiles(),
    vpsReadiness: vpsChecks(profile),
    rollbackReadiness: rollbackChecks(),
    observability,
    notes: [
      "This dashboard is read-only and does not activate providers, queues, rendering, publishing, browser automation, or workflow mutation.",
      "Production deployment must keep secrets in the platform secret manager and must rehearse rollback before public traffic.",
      "Status labels are intentionally honest: Mock, Not connected, Needs approval, Configured, Blocked, and Live.",
    ],
  };
}

export async function getDeploymentGovernanceDashboard(source: NodeJS.ProcessEnv = process.env) {
  const [databaseStatus, redisStatus, queueHealth] = await Promise.all([getDatabaseStatus(), getRedisStatus(), getQueueHealth()]);
  return buildDeploymentGovernanceDashboard(source, { databaseStatus, redisStatus, queueHealth });
}
