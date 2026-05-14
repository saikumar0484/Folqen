import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import { getEnv } from "@/lib/env";
import { emitOrchestrationEvent } from "@/lib/orchestration/event-bus";
import { enqueueOrchestrationJob, getQueueHealth, ORCHESTRATION_QUEUES } from "@/lib/orchestration/queue";
import type {
  BrowserActionKind,
  BrowserControlAction,
  BrowserControlResult,
  BrowserGovernanceSnapshot,
  BrowserOpsDashboard,
  BrowserOpsStatus,
  BrowserSession,
  BrowserTraceStep,
  BrowserWorkflowRequest,
  BrowserWorkflowResult,
} from "./types";

const actionSchema = z.object({
  action: z.enum(["open_page", "navigate", "click", "type", "scroll", "upload_file", "capture_screenshot", "inspect_dom", "extract_structured_data"]),
  target: z.string().max(1200).optional(),
  value: z.string().max(4000).optional(),
});

const workflowSchema = z.object({
  workflowKind: z.enum(["page_observation", "dom_inspection", "structured_extraction", "screenshot_audit", "safe_navigation_rehearsal"]),
  objective: z.string().min(8).max(1200),
  startUrl: z.string().url(),
  actions: z.array(actionSchema).min(1).max(12),
  approvalId: z.string().max(180).optional(),
  approvalRequired: z.boolean().default(true),
});

const sessionSchema = z.object({
  title: z.string().min(3).max(120).default("Dry-run browser session"),
  startUrl: z.string().url().optional(),
});

const controlSchema = z.object({
  action: z.enum(["kill_switch", "quarantine_session", "release_quarantine", "rollback_to_dry_run", "recover_session"]),
  reason: z.string().min(6).max(1000),
  sessionId: z.string().max(180).optional(),
});

const globalStore = globalThis as typeof globalThis & {
  folqenBrowserSessions?: BrowserSession[];
  folqenBrowserRuns?: BrowserWorkflowResult[];
  folqenBrowserRuntime?: {
    killSwitch: boolean;
    quarantinedSessionIds: Set<string>;
  };
};

const sessionStore = globalStore.folqenBrowserSessions ?? [];
const runStore = globalStore.folqenBrowserRuns ?? [];
const runtimeStore = globalStore.folqenBrowserRuntime ?? {
  killSwitch: false,
  quarantinedSessionIds: new Set<string>(),
};

globalStore.folqenBrowserSessions = sessionStore;
globalStore.folqenBrowserRuns = runStore;
globalStore.folqenBrowserRuntime = runtimeStore;

function jsonSafe(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function csv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function hostFromUrl(value: string) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function matchesDomain(host: string, domain: string) {
  return host === domain || host.endsWith(`.${domain}`);
}

function maskPotentialSecrets(value: string | undefined) {
  if (!value) return undefined;
  const redacted = value
    .replace(/(api[_-]?key|token|secret|password|authorization|credential)\s*[:=]\s*[^&\s]+/gi, "$1=[masked]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [masked]");
  if (redacted.length > 120) return `${redacted.slice(0, 117)}...`;
  return redacted;
}

function isSecretLike(action: { target?: string; value?: string }) {
  return /(password|secret|token|api[_-]?key|credential|authorization)/i.test(`${action.target ?? ""} ${action.value ?? ""}`);
}

function getDomainDecision(url: string, governance: BrowserGovernanceSnapshot) {
  const host = hostFromUrl(url);
  if (!host) return { ok: false, host, status: "Blocked" as BrowserOpsStatus, reason: "Target URL is malformed." };
  if (governance.blockedDomains.some((domain) => matchesDomain(host, domain))) {
    return { ok: false, host, status: "Blocked" as BrowserOpsStatus, reason: `${host} is on the blocked-domain list.` };
  }
  if (!governance.allowedDomains.some((domain) => matchesDomain(host, domain))) {
    return { ok: false, host, status: "Needs approval" as BrowserOpsStatus, reason: `${host} is not on the allowed-domain list.` };
  }
  return { ok: true, host, status: "Configured" as BrowserOpsStatus, reason: `${host} is allowed for dry-run observation.` };
}

export function getBrowserGovernanceSnapshot(source: NodeJS.ProcessEnv = process.env): BrowserGovernanceSnapshot {
  const env = getEnv(source);
  const sandboxMode = env.BROWSER_OPERATIONS_SANDBOX_MODE;
  const killSwitch = runtimeStore.killSwitch || env.BROWSER_OPERATIONS_KILL_SWITCH;
  const dryRunOnly = true;
  const blockedReasons: string[] = [];

  if (!sandboxMode) blockedReasons.push("Browser sandbox mode is disabled.");
  if (killSwitch) blockedReasons.push("Browser operations kill switch is engaged.");
  if (env.ALLOW_BROWSER_AUTOMATION) blockedReasons.push("ALLOW_BROWSER_AUTOMATION is true, but live browser execution is not implemented in this preview-safe slice.");
  if (env.PREVIEW_SAFE_MODE && !env.PREVIEW_FORCE_DRY_RUN) blockedReasons.push("Preview safe mode requires PREVIEW_FORCE_DRY_RUN=true.");

  const policies = [
    { action: "open_page", requiresApproval: true, summary: "Open a page in an isolated Playwright session after domain validation." },
    { action: "navigate", requiresApproval: true, summary: "Navigate only to allow-listed domains; blocked domains are refused." },
    { action: "click", requiresApproval: true, summary: "Click actions are simulated in dry-run mode and never submitted to live sites." },
    { action: "type", requiresApproval: true, summary: "Typed values are masked and secret-like values are blocked." },
    { action: "scroll", requiresApproval: false, summary: "Scroll plans are simulated for observation only." },
    { action: "upload_file", requiresApproval: true, summary: "File uploads are blocked in preview and represented as audit plans only." },
    { action: "capture_screenshot", requiresApproval: true, summary: "Screenshot capture is a redacted placeholder until live browser execution is approved." },
    { action: "inspect_dom", requiresApproval: false, summary: "DOM inspection returns simulated selectors and structure." },
    { action: "extract_structured_data", requiresApproval: true, summary: "Structured extraction is dry-run only and never scrapes public sites." },
  ].map((policy) => ({
    ...policy,
    action: policy.action as BrowserActionKind,
    dryRunOnly,
    status: blockedReasons.length > 0 ? ("Blocked" as BrowserOpsStatus) : policy.requiresApproval ? ("Needs approval" as BrowserOpsStatus) : ("Mock" as BrowserOpsStatus),
  }));

  return {
    status: blockedReasons.length > 0 ? "Blocked" : "Mock",
    sandboxMode,
    dryRunOnly,
    killSwitch,
    approvalRequired: true,
    liveExecutionEnabled: false,
    allowedDomains: csv(env.BROWSER_OPERATIONS_ALLOWED_DOMAINS),
    blockedDomains: csv(env.BROWSER_OPERATIONS_BLOCKED_DOMAINS),
    maxSessionSeconds: env.BROWSER_OPERATIONS_MAX_SESSION_SECONDS,
    policies,
    blockedReasons,
  };
}

function createTraceStep(input: {
  action: BrowserActionKind;
  target: string;
  value?: string;
  status: BrowserTraceStep["status"];
  summary: string;
  evidence: string[];
  index: number;
}): BrowserTraceStep {
  return {
    id: `step_${input.index + 1}_${randomUUID().slice(0, 8)}`,
    action: input.action,
    status: input.status,
    target: input.target,
    summary: input.summary,
    durationMs: 18 + input.index * 7,
    evidence: input.evidence,
    maskedInput: maskPotentialSecrets(input.value),
  };
}

function seedSession(actorId?: string, startUrl?: string, title = "Dry-run browser observation"): BrowserSession {
  const now = new Date().toISOString();
  const governance = getBrowserGovernanceSnapshot();
  const decision = startUrl ? getDomainDecision(startUrl, governance) : { status: "Mock" as BrowserOpsStatus };
  return {
    id: `browser_session_${randomUUID()}`,
    title,
    status: decision.status === "Blocked" ? "blocked" : "planned",
    mode: "dry_run",
    createdAt: now,
    updatedAt: now,
    actorId,
    currentUrl: startUrl,
    domainStatus: decision.status,
    health: governance.killSwitch ? "Blocked" : "Mock",
    screenshotPreview: {
      status: "Mock",
      placeholderUrl: "mock://browser-screenshot/redacted-preview",
      redacted: true,
      summary: "Screenshot preview is simulated; no browser window, public site, or account session was opened.",
    },
  };
}

export async function createBrowserSession(rawInput: unknown, actorId?: string) {
  const input = sessionSchema.parse(rawInput ?? {});
  const session = seedSession(actorId, input.startUrl, input.title);
  sessionStore.unshift(session);
  sessionStore.splice(25);

  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.browser,
    name: "browser.session.created",
    data: { sessionId: session.id, dryRunOnly: true, liveBrowserExecution: false },
  });

  await createAuditLog({
    actorId,
    action: "browser.session_created",
    target: session.id,
    riskLevel: "LOW",
    metadata: jsonSafe({ startUrl: session.currentUrl, dryRunOnly: true, liveBrowserExecution: false, queueJobId: queue.jobId }),
  });

  return { ok: true, mode: "dry_run" as const, session, queueJobId: queue.jobId };
}

async function ensureSession(input: BrowserWorkflowRequest, actorId?: string) {
  const existing = sessionStore.find((session) => session.currentUrl === input.startUrl && session.status !== "quarantined");
  if (existing) return existing;
  const created = await createBrowserSession({ title: input.objective.slice(0, 100), startUrl: input.startUrl }, actorId);
  return created.session;
}

export async function runBrowserWorkflow(rawInput: unknown, actorId?: string): Promise<BrowserWorkflowResult> {
  const input = workflowSchema.parse(rawInput) as BrowserWorkflowRequest;
  const governance = getBrowserGovernanceSnapshot();
  const domainDecision = getDomainDecision(input.startUrl, governance);
  const session = await ensureSession(input, actorId);
  const blockedReasons = [...governance.blockedReasons];

  if (!domainDecision.ok) blockedReasons.push(domainDecision.reason);
  if (input.approvalRequired && !input.approvalId) blockedReasons.push("Approval ID is required before browser actions can move beyond planning.");
  if (runtimeStore.quarantinedSessionIds.has(session.id)) blockedReasons.push("Browser session is quarantined.");

  const status: BrowserWorkflowResult["status"] = governance.killSwitch || blockedReasons.some((reason) => /kill switch|blocked-domain|malformed|quarantined/i.test(reason))
    ? "blocked"
    : input.approvalRequired && !input.approvalId
      ? "needs_approval"
      : "simulated";

  const actions = input.actions.map((action, index) => {
    const target = action.target || input.startUrl;
    const actionHost = action.action === "navigate" || action.action === "open_page" ? hostFromUrl(target) : domainDecision.host;
    const actionDecision = action.action === "navigate" || action.action === "open_page" ? getDomainDecision(target, governance) : domainDecision;
    const secretBlocked = action.action === "type" && isSecretLike(action);
    const uploadBlocked = action.action === "upload_file";
    const actionBlocked = status === "blocked" || !actionDecision.ok || secretBlocked || uploadBlocked;
    const actionStatus: BrowserTraceStep["status"] = actionBlocked ? "blocked" : status === "needs_approval" ? "needs_approval" : "simulated";
    const summary = actionBlocked
      ? secretBlocked
        ? "Typing secret-like values is blocked and masked."
        : uploadBlocked
          ? "File upload is blocked in preview-safe browser operations."
          : actionDecision.reason
      : `Dry-run Playwright ${action.action.replace(/_/g, " ")} plan created.`;

    return createTraceStep({
      action: action.action,
      target,
      value: action.value,
      status: actionStatus,
      summary,
      index,
      evidence: [
        "No browser process was launched.",
        "No website was contacted.",
        "No cookies, credentials, or account sessions were used.",
        actionHost ? `Target host: ${actionHost}` : "Target host unavailable",
      ],
    });
  });

  if (actions.some((action) => action.status === "blocked") && status === "simulated") {
    blockedReasons.push("One or more browser actions were blocked by action validation.");
  }

  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.browser,
    name: `browser.${input.workflowKind}`,
    data: {
      workflowKind: input.workflowKind,
      sessionId: session.id,
      dryRunOnly: true,
      liveBrowserExecution: false,
      targetHost: domainDecision.host,
    },
    options: { attempts: 1 },
  });
  const traceQueue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.browserTrace,
    name: "browser.trace.recorded",
    data: { sessionId: session.id, dryRunOnly: true, steps: actions.length },
    options: { attempts: 1 },
  });

  const result: BrowserWorkflowResult = {
    runId: `browser_run_${randomUUID()}`,
    sessionId: session.id,
    workflowKind: input.workflowKind,
    status: blockedReasons.length > 0 && status === "simulated" ? "blocked" : status,
    mode: "dry_run",
    provider: {
      id: "playwright_controller",
      status: governance.killSwitch ? "Blocked" : "Mock",
      liveExecutionEnabled: false,
    },
    queueJobId: queue.jobId,
    traceId: traceQueue.jobId,
    targetHost: domainDecision.host,
    actions,
    observations: [
      "Browser workflow was simulated through the governed Browser Operations layer.",
      "Playwright controller is prepared as an isolated-session adapter but live execution remains disabled.",
      "Screenshot auditing, DOM inspection, and extraction are represented as redacted dry-run traces.",
    ],
    extractedData: input.workflowKind === "structured_extraction" ? [{ label: "preview_signal", value: "Mock structured extraction only; no scraping occurred.", confidence: 72 }] : [],
    screenshotAudit: {
      status: "Mock",
      captured: false,
      redacted: true,
      summary: "Screenshot artifact is a placeholder; no pixels were captured from any live page.",
    },
    governance,
    blockedReasons,
    createdAt: new Date().toISOString(),
  };

  runStore.unshift(result);
  runStore.splice(50);
  const sessionIndex = sessionStore.findIndex((item) => item.id === session.id);
  if (sessionIndex >= 0) {
    sessionStore[sessionIndex] = {
      ...sessionStore[sessionIndex],
      status: result.status === "simulated" ? "completed" : result.status === "needs_approval" ? "planned" : result.status === "quarantined" ? "quarantined" : "blocked",
      updatedAt: result.createdAt,
      health: result.status === "blocked" ? "Blocked" : result.status === "needs_approval" ? "Needs approval" : "Mock",
    };
  }

  await emitOrchestrationEvent({
    type: "browser.workflow.simulated",
    severity: result.status === "blocked" ? "warning" : "info",
    source: "browser-operations",
    departmentId: "browser_operations",
    workflowRunId: result.runId,
    message: `Browser workflow ${input.workflowKind} was simulated in dry-run mode.`,
    metadata: {
      queueJobId: queue.jobId,
      traceId: traceQueue.jobId,
      liveBrowserExecution: false,
      targetHost: result.targetHost,
    },
  });

  await createAuditLog({
    actorId,
    action: "browser.workflow_simulated",
    target: result.runId,
    riskLevel: result.status === "blocked" ? "MEDIUM" : "LOW",
    metadata: jsonSafe({ workflowKind: result.workflowKind, status: result.status, queueJobId: queue.jobId, liveBrowserExecution: false }),
  });

  return result;
}

export async function controlBrowserOperations(rawInput: unknown, actorId?: string): Promise<BrowserControlResult> {
  const input = controlSchema.parse(rawInput) as { action: BrowserControlAction; reason: string; sessionId?: string };
  const blockedReasons: string[] = [];

  if ((input.action === "quarantine_session" || input.action === "release_quarantine" || input.action === "recover_session") && !input.sessionId) {
    blockedReasons.push("Session ID is required for session-level controls.");
  }

  if (input.action === "kill_switch") runtimeStore.killSwitch = true;
  if (input.action === "rollback_to_dry_run") {
    runtimeStore.killSwitch = false;
    runtimeStore.quarantinedSessionIds.clear();
  }
  if (input.action === "quarantine_session" && input.sessionId) runtimeStore.quarantinedSessionIds.add(input.sessionId);
  if ((input.action === "release_quarantine" || input.action === "recover_session") && input.sessionId) runtimeStore.quarantinedSessionIds.delete(input.sessionId);

  if (input.sessionId) {
    const session = sessionStore.find((item) => item.id === input.sessionId);
    if (session) {
      session.status = input.action === "quarantine_session" ? "quarantined" : input.action === "recover_session" ? "planned" : session.status;
      session.quarantineReason = input.action === "quarantine_session" ? input.reason : undefined;
      session.updatedAt = new Date().toISOString();
      session.health = input.action === "quarantine_session" ? "Blocked" : "Mock";
    }
  }

  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.browserTrace,
    name: `browser.control.${input.action}`,
    data: { action: input.action, sessionId: input.sessionId, dryRunOnly: true, liveBrowserExecution: false },
    options: { attempts: 1 },
  });

  await createAuditLog({
    actorId,
    action: `browser.${input.action}`,
    target: input.sessionId ?? "browser_operations",
    riskLevel: input.action === "kill_switch" || input.action === "quarantine_session" ? "MEDIUM" : "LOW",
    metadata: jsonSafe({ reason: input.reason, queueJobId: queue.jobId, liveBrowserExecution: false }),
  });

  return {
    ok: blockedReasons.length === 0,
    action: input.action,
    status: input.action === "kill_switch" || input.action === "quarantine_session" ? "Blocked" : "Mock",
    sessionId: input.sessionId,
    queueJobId: queue.jobId,
    message:
      input.action === "rollback_to_dry_run"
        ? "Browser Operations rolled back to dry-run mode. No browser execution was enabled."
        : "Browser Operations control action recorded without launching browser automation.",
    blockedReasons,
  };
}

export async function getBrowserOpsDashboard(): Promise<BrowserOpsDashboard> {
  const governance = getBrowserGovernanceSnapshot();
  const queues = await getQueueHealth();
  const browserQueue = queues.find((queue) => queue.name === ORCHESTRATION_QUEUES.browser);
  const traceQueue = queues.find((queue) => queue.name === ORCHESTRATION_QUEUES.browserTrace);
  const sessions = sessionStore.length > 0 ? sessionStore.slice(0, 8) : [seedSession(undefined, "https://folqen.vercel.app/dashboard", "Preview dashboard observation")];

  return {
    mode: "dry_run",
    generatedAt: new Date().toISOString(),
    department: {
      id: "browser_operations",
      name: "Browser Operations Department",
      status: governance.status,
      mission: "Observe and rehearse governed web interactions through isolated Playwright session plans without live browser execution.",
    },
    provider: {
      id: "playwright_controller",
      name: "Playwright Controller",
      status: governance.killSwitch ? "Blocked" : "Mock",
      package: "playwright-core",
      liveExecutionEnabled: false,
      summary: "Controller dependency is available for future isolated sessions, but preview mode only records dry-run plans.",
    },
    governance,
    sessions,
    recentRuns: runStore.slice(0, 8),
    queue: {
      name: ORCHESTRATION_QUEUES.browser,
      traceQueueName: ORCHESTRATION_QUEUES.browserTrace,
      status: browserQueue?.mode === "live" ? "Needs approval" : "Mock",
      mode: browserQueue?.mode ?? "mock",
      waiting: (browserQueue?.waiting ?? 0) + (traceQueue?.waiting ?? 0),
      active: (browserQueue?.active ?? 0) + (traceQueue?.active ?? 0),
      failed: (browserQueue?.failed ?? 0) + (traceQueue?.failed ?? 0),
    },
    observability: {
      traces: runStore.reduce((count, run) => count + run.actions.length, 0),
      screenshotsAudited: runStore.filter((run) => run.screenshotAudit.status === "Mock").length,
      quarantinedSessions: runtimeStore.quarantinedSessionIds.size + sessionStore.filter((session) => session.status === "quarantined").length,
      secretMasking: "Configured",
      safePreviewReady: governance.killSwitch || governance.blockedReasons.length > 0 ? "Blocked" : "Configured",
    },
    notes: [
      "Browser Operations is dry-run only; no Playwright browser process is launched.",
      "Allowed and blocked domains are evaluated before every simulated navigation.",
      "Typing secrets, file uploads, social account automation, scraping, and credential-bearing sessions are blocked.",
      "Preview deployment must keep ALLOW_BROWSER_AUTOMATION=false and PREVIEW_FORCE_DRY_RUN=true.",
    ],
  };
}

export function resetBrowserOpsRuntimeForTests() {
  sessionStore.splice(0);
  runStore.splice(0);
  runtimeStore.killSwitch = false;
  runtimeStore.quarantinedSessionIds.clear();
}
