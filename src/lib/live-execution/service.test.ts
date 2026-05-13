import assert from "node:assert/strict";
import test from "node:test";

import { resolveLiveExecutionAdminAccess, resolveLiveExecutionOperatorAccess, resolveLiveExecutionReadAccess } from "./api-handler";
import { FIRST_LIVE_TARGET } from "./config";
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
