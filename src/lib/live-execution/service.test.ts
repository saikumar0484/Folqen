import assert from "node:assert/strict";
import test from "node:test";

import { resolveLiveExecutionAdminAccess, resolveLiveExecutionOperatorAccess, resolveLiveExecutionReadAccess } from "./api-handler";
import { FIRST_LIVE_TARGET } from "./config";
import { parseResearchIdeationJson, researchIdeationOutputSchema } from "./research-ideation";
import { actOnProvider, engageEmergencyStop, evaluateLiveReadiness, getLiveExecutionDashboard, promoteSandboxToLive, requestProviderActivation, runControlledLiveExecution } from "./service";

const admin = {
  id: "user_admin",
  email: "admin@folqen.test",
  name: "Admin",
  role: "ADMIN" as const,
  mustChangePassword: false,
};

const operator = {
  ...admin,
  id: "user_operator",
  role: "OPERATOR" as const,
};

const viewer = {
  ...admin,
  id: "user_viewer",
  role: "VIEWER" as const,
};

test("live execution dashboard exposes staged activation and the first target only", async () => {
  const dashboard = await getLiveExecutionDashboard();

  assert.equal(dashboard.activationStages.length, 5);
  assert.deepEqual(dashboard.firstTarget, {
    providerId: FIRST_LIVE_TARGET.providerId,
    departmentId: FIRST_LIVE_TARGET.departmentId,
    workflowKind: FIRST_LIVE_TARGET.workflowKind,
    taskType: FIRST_LIVE_TARGET.taskType,
    status: "Not connected",
  });
  assert.equal(dashboard.rollback.providerQuarantine, "available");
});

test("default live readiness blocks execution before flags, approval, credentials, and sandbox pass", () => {
  const readiness = evaluateLiveReadiness({
    objective: "Run controlled content ideation.",
    providerId: "gemini",
    departmentId: "research",
    workflowKind: "structured_generation",
    taskType: "planning",
  });

  assert.equal(readiness.allowed, false);
  assert.equal(readiness.reasons.includes("ALLOW_LIVE_AI_EXECUTION is not enabled."), true);
  assert.equal(readiness.reasons.includes("Explicit approved activation approval ID is required."), true);
  assert.equal(readiness.reasons.includes("Sandbox execution must pass before live promotion."), true);
});

test("first activation target blocks other providers and departments", () => {
  const readiness = evaluateLiveReadiness({
    objective: "Try live execution outside the first target.",
    providerId: "openrouter",
    departmentId: "content",
    workflowKind: "agent_tool_call",
    taskType: "text_generation",
    approvalStatus: "approved",
    approvalId: "approval_123",
  });

  assert.equal(readiness.allowed, false);
  assert.equal(readiness.reasons.some((reason) => reason.includes("Only Gemini")), true);
  assert.equal(readiness.reasons.some((reason) => reason.includes("Research Department")), true);
});

test("activation request creates approval metadata without enabling live execution", async () => {
  const result = await requestProviderActivation({
    providerId: "gemini",
    requestedStage: 1,
    reason: "Need a safe approval request for limited research ideation.",
  });

  assert.equal(result.ok, true);
  assert.equal(result.mode, "approval_required");
  assert.ok(result.approvalId);
  assert.equal(result.message.includes("Live execution remains blocked"), true);
});

test("promotion remains blocked when live environment and credentials are absent", async () => {
  const result = await promoteSandboxToLive({
    objective: "Promote a sandbox run to live.",
    providerId: "gemini",
    departmentId: "research",
    workflowKind: "structured_generation",
    taskType: "planning",
    approvalStatus: "approved",
    approvalId: "approval_approved",
  });

  assert.equal(result.ok, false);
  assert.equal(result.mode, "blocked");
  assert.equal(result.readiness.reasons.includes("ALLOW_LIVE_AI_EXECUTION is not enabled."), true);
});

test("controlled live execution falls back to blocked result without provider calls by default", async () => {
  const result = await runControlledLiveExecution({
    objective: "Generate a real response only if every live gate passes.",
    providerId: "gemini",
    departmentId: "research",
    workflowKind: "structured_generation",
    taskType: "planning",
    approvalStatus: "approved",
    approvalId: "approval_approved",
  });

  assert.equal(result.mode, "blocked");
  assert.notEqual(result.status, "completed_live");
  assert.equal(result.rollback.available, true);
  assert.equal(result.providerResponse, undefined);
  assert.equal(result.retryPolicy.autonomousRetries, false);
  assert.equal(result.retryPolicy.maxAttempts, 1);
});

test("Gemini Research ideation output parser requires safe structured draft-only fields", () => {
  const parsed = parseResearchIdeationJson(
    JSON.stringify({
      summary: "Draft trend intelligence for India-first mystery content.",
      trendInsights: [{ trend: "Cursed village folklore explainers", signalType: "cultural", relevanceScore: 82, rationale: "Works as source-aware mystery education without claiming live platform data." }],
      topicSuggestions: [
        {
          topic: "The village where doors are never locked",
          angle: "Compare folklore, civic trust, and mystery framing without presenting unverifiable claims as fact.",
          hook: "What if the scariest village legend begins with no locked doors at all?",
          platformFit: ["YOUTUBE", "INSTAGRAM"],
          confidence: 78,
          safetyNotes: "Verify sources and avoid identifying private individuals.",
        },
      ],
      strategicRecommendations: ["Use source cards and separate legend from verified history."],
      risks: ["May need careful fact labels."],
      followUpResearch: ["Collect public source references before scripting."],
      safety: { noPublishing: true, needsHumanReview: true, sourceVerificationRequired: true },
    }),
  );

  assert.equal(researchIdeationOutputSchema.safeParse(parsed).success, true);
  assert.equal(parsed.safety.noPublishing, true);
});

test("live execution rejects client-claimed approval when database verification is unavailable", async () => {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const previousAllowLive = process.env.ALLOW_LIVE_AI_EXECUTION;
  const previousStage = process.env.LIVE_AI_ACTIVATION_STAGE;
  const previousGeminiKey = process.env.GEMINI_API_KEY;
  delete process.env.DATABASE_URL;
  process.env.ALLOW_LIVE_AI_EXECUTION = "true";
  process.env.LIVE_AI_ACTIVATION_STAGE = "1";
  process.env.GEMINI_API_KEY = "fake-test-key";

  const result = await runControlledLiveExecution({
    objective: "Generate controlled Gemini research ideation only if approval verification is real.",
    providerId: "gemini",
    departmentId: "research",
    workflowKind: "structured_generation",
    taskType: "planning",
    approvalStatus: "approved",
    approvalId: "approval_fake",
  });

  if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = previousDatabaseUrl;
  if (previousAllowLive === undefined) delete process.env.ALLOW_LIVE_AI_EXECUTION;
  else process.env.ALLOW_LIVE_AI_EXECUTION = previousAllowLive;
  if (previousStage === undefined) delete process.env.LIVE_AI_ACTIVATION_STAGE;
  else process.env.LIVE_AI_ACTIVATION_STAGE = previousStage;
  if (previousGeminiKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = previousGeminiKey;

  assert.equal(result.status, "waiting_for_approval");
  assert.equal(result.approvalVerification?.verified, false);
  assert.equal(result.readiness.reasons.some((reason) => reason.includes("Database approval verification")), true);
  assert.equal(result.providerResponse, undefined);
});

test("emergency stop and provider actions rollback to dry-run mode", async () => {
  const stop = await engageEmergencyStop({ reason: "Test emergency rollback." });
  assert.equal(stop.mode, "rollback_to_dry_run");
  assert.equal(stop.record?.emergencyStopEngaged, true);

  const action = await actOnProvider({ providerId: "gemini", action: "rollback_to_dry_run", reason: "Return to mock-only after test." });
  assert.equal(action.mode, "rollback_to_dry_run");
  assert.equal(action.record?.stage, 0);
});

test("live execution access helpers enforce login, role, and mutation safety", () => {
  assert.deepEqual(resolveLiveExecutionReadAccess(null), { ok: false, status: 401, error: "Login required." });
  assert.deepEqual(resolveLiveExecutionOperatorAccess({ user: null }), { ok: false, status: 401, error: "Login required." });
  assert.deepEqual(resolveLiveExecutionOperatorAccess({ user: viewer }), { ok: false, status: 403, error: "Only admins and operators can evaluate live execution controls." });
  assert.deepEqual(resolveLiveExecutionAdminAccess({ user: operator }), { ok: false, status: 403, error: "Only admins can change live execution activation controls." });
  assert.deepEqual(resolveLiveExecutionAdminAccess({ user: admin, safetyError: { status: 403, error: "Mutation must be sent from the Folqen app UI." } }), {
    ok: false,
    status: 403,
    error: "Mutation must be sent from the Folqen app UI.",
  });
  assert.equal(resolveLiveExecutionAdminAccess({ user: admin }).ok, true);
});
