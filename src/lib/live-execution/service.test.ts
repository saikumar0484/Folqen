import assert from "node:assert/strict";
import test from "node:test";

import { resolveLiveExecutionAdminAccess, resolveLiveExecutionOperatorAccess, resolveLiveExecutionReadAccess } from "./api-handler";
import { analyticsOperationalOutputSchema, analyticsOutputWarnings, parseAnalyticsOperationsJson, scoreAnalyticsOutput } from "./analytics-operations";
import { FIRST_LIVE_TARGET } from "./config";
import { contentOperationalOutputSchema, contentOutputWarnings, parseContentOperationsJson, scoreContentOutput } from "./content-operations";
import { parseResearchIdeationJson, researchIdeationOutputSchema } from "./research-ideation";
import { parseResearchOperationsJson, researchOperationalOutputSchema, researchOutputWarnings, scoreResearchOutput } from "./research-operations";
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

test("first activation target blocks other providers and non-approved departments", () => {
  const readiness = evaluateLiveReadiness({
    objective: "Try live execution outside the first target.",
    providerId: "openrouter",
    departmentId: "platform_operations",
    workflowKind: "agent_tool_call",
    taskType: "text_generation",
    approvalStatus: "approved",
    approvalId: "approval_123",
  });

  assert.equal(readiness.allowed, false);
  assert.equal(readiness.reasons.some((reason) => reason.includes("Only Gemini")), true);
  assert.equal(readiness.reasons.some((reason) => reason.includes("approved Research, Content, or Analytics Department")), true);
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

test("Research operations parser scores memory-aware governed outputs", () => {
  const parsed = parseResearchOperationsJson(
    JSON.stringify({
      workflowKind: "trend_analysis",
      summary: "Governed Research trend analysis for folklore content strategy.",
      insights: [
        {
          title: "Local legend explainers remain useful when source-framed",
          type: "trend",
          confidence: 82,
          evidence: "Manual seed topics and memory context indicate repeatable mystery interest.",
          memoryComparison: "Avoids duplicating earlier haunted fort angle by shifting to civic folklore framing.",
          noveltyScore: 76,
          riskLevel: "medium",
        },
      ],
      recommendations: [{ action: "Prioritize one source-verified local legend briefing", rationale: "It can become a safe draft topic after review.", priority: "high", confidence: 81 }],
      duplicateSignals: ["Haunted fort framing appeared in previous research."],
      memoryContext: { used: true, items: [{ id: "mem_1", title: "Prior haunted fort package", relevance: 78 }] },
      scoring: { qualityScore: 82, confidenceScore: 80, noveltyScore: 76, safetyScore: 88, evidenceScore: 72 },
      observability: { reasoningTrace: ["Validated scope", "Compared memory", "Scored novelty"], retrievalUsed: true, memoryItemsUsed: 1 },
      safety: { noPublishing: true, needsHumanReview: true, sourceVerificationRequired: true, noWorkflowMutation: true },
    }),
  );

  assert.equal(researchOperationalOutputSchema.safeParse(parsed).success, true);
  assert.equal(scoreResearchOutput(parsed) > 55, true);
  assert.deepEqual(researchOutputWarnings(parsed), []);
});

test("expanded Research workflows still block without real approval verification", async () => {
  const result = await runControlledLiveExecution({
    objective: "Run competitor insight only if every Research live gate is real.",
    providerId: "gemini",
    departmentId: "research",
    workflowKind: "structured_generation",
    taskType: "planning",
    researchWorkflowKind: "competitor_insight",
    approvalStatus: "approved",
    approvalId: "approval_fake",
    seedTopics: ["folklore documentary shorts"],
    competitors: ["manual competitor note"],
  });

  assert.equal(result.mode, "blocked");
  assert.notEqual(result.status, "completed_live");
  assert.equal(result.liveCapability, "gemini_research_operational_intelligence");
  assert.equal(result.researchWorkflowKind, "competitor_insight");
  assert.equal(result.providerResponse, undefined);
  assert.equal(result.retryPolicy.maxAttempts, 1);
});

test("Content operations parser scores governed platform-aware drafts", () => {
  const parsed = parseContentOperationsJson(
    JSON.stringify({
      workflowKind: "hook_generation",
      contentBrief: {
        title: "Haunted stepwell cold-open package",
        angle: "Frame the legend as a source-aware mystery without claiming the haunting is verified fact.",
        targetPlatforms: ["YOUTUBE_SHORTS", "INSTAGRAM_REELS"],
        audience: "India-first folklore and mystery viewers.",
        sourceVerificationNotes: "Verify local history sources before scripting or posting.",
      },
      drafts: [
        {
          type: "hook",
          platform: "YOUTUBE_SHORTS",
          text: "What if the scariest part of this stepwell legend is the detail everyone repeats but nobody can prove?",
          rationale: "Creates curiosity while avoiding fake certainty.",
          confidence: 84,
          riskLevel: "low",
        },
      ],
      recommendations: [{ action: "Pair the hook with a verified-history disclaimer", rationale: "Keeps the mystery tone while preserving safety.", priority: "high", confidence: 82 }],
      duplicateSignals: ["Older hook memory used haunted fort framing."],
      memoryContext: { used: true, items: [{ id: "mem_hook_1", title: "Question hook retained well", relevance: 80 }] },
      scoring: { qualityScore: 84, originalityScore: 79, safetyScore: 90, platformFitScore: 86, evidenceScore: 72 },
      observability: { generationTrace: ["Validated topic", "Retrieved hook memory", "Scored platform fit"], retrievalUsed: true, memoryItemsUsed: 1, estimatedReviewComplexity: "medium" },
      safety: { noPublishing: true, needsHumanReview: true, sourceVerificationRequired: true, noMediaGeneration: true, noPlatformExecution: true, noWorkflowMutation: true },
    }),
  );

  assert.equal(contentOperationalOutputSchema.safeParse(parsed).success, true);
  assert.equal(scoreContentOutput(parsed) > 60, true);
  assert.deepEqual(contentOutputWarnings(parsed), []);
});

test("governed Content workflows still block without real approval verification", async () => {
  const result = await runControlledLiveExecution({
    objective: "Generate hooks only if every Content live gate is real.",
    providerId: "gemini",
    departmentId: "content",
    workflowKind: "structured_generation",
    taskType: "structured_output",
    contentWorkflowKind: "hook_generation",
    approvalStatus: "approved",
    approvalId: "approval_fake",
    seedTopics: ["haunted stepwell folklore"],
    platformTargets: ["YOUTUBE_SHORTS", "INSTAGRAM_REELS"],
  });

  assert.equal(result.mode, "blocked");
  assert.notEqual(result.status, "completed_live");
  assert.equal(result.liveCapability, "gemini_content_operational_intelligence");
  assert.equal(result.contentWorkflowKind, "hook_generation");
  assert.equal(result.providerResponse, undefined);
  assert.equal(result.retryPolicy.maxAttempts, 1);
});

test("Analytics operations parser scores governed feedback intelligence", () => {
  const parsed = parseAnalyticsOperationsJson(
    JSON.stringify({
      workflowKind: "content_performance_analysis",
      report: {
        title: "Folklore shorts feedback loop report",
        summary: "Mock/internal analytics suggest stronger source framing could improve retention without triggering platform execution.",
        dataSources: ["mock_ingestion", "workflow_analytics", "internal_execution_metrics"],
        confidence: 78,
        limitations: ["No live platform analytics API access.", "Signals are directional until human-reviewed."],
      },
      insights: [
        {
          title: "Retention drop appears near proof transition",
          metricFocus: "retention",
          interpretation: "Viewer attention may fall when the story moves from hook to explanation without enough source context.",
          historicalComparison: "Previous memory favored source cards for mystery claims.",
          confidence: 80,
          impact: "high",
        },
      ],
      optimizationRecommendations: [
        {
          recommendation: "Add a 2-second source-context beat before the first claim.",
          rationale: "This keeps mystery energy while reducing uncertainty around folklore versus verified history.",
          confidence: 81,
          expectedImpact: "medium",
          executionStatus: "recommendation_only",
        },
      ],
      duplicateSignals: ["Do not repeat the previous haunted fort cold-open pattern."],
      memoryContext: { used: true, items: [{ id: "analytics_mem_1", title: "Source cards retained viewers", relevance: 82 }] },
      scoring: { analyticsQualityScore: 82, confidenceScore: 78, evidenceScore: 74, optimizationConfidenceScore: 80, feedbackLoopQualityScore: 84 },
      observability: { reasoningTrace: ["Validated mock data scope", "Compared memory", "Scored recommendation"], retrievalUsed: true, memoryItemsUsed: 1, workflowLatencyClass: "low" },
      safety: { noPublishing: true, needsHumanReview: true, noPlatformApiAccess: true, noAutonomousOptimization: true, noPromptMutation: true, noWorkflowMutation: true },
    }),
  );

  assert.equal(analyticsOperationalOutputSchema.safeParse(parsed).success, true);
  assert.equal(scoreAnalyticsOutput(parsed) > 60, true);
  assert.deepEqual(analyticsOutputWarnings(parsed), []);
});

test("governed Analytics workflows still block without real approval verification", async () => {
  const result = await runControlledLiveExecution({
    objective: "Analyze content performance only if every Analytics live gate is real.",
    providerId: "gemini",
    departmentId: "analytics",
    workflowKind: "structured_generation",
    taskType: "structured_output",
    analyticsWorkflowKind: "content_performance_analysis",
    approvalStatus: "approved",
    approvalId: "approval_fake",
    analyticsSignals: ["CTR 4.8 percent", "retention drop at 18 seconds"],
  });

  assert.equal(result.mode, "blocked");
  assert.notEqual(result.status, "completed_live");
  assert.equal(result.liveCapability, "gemini_analytics_operational_intelligence");
  assert.equal(result.analyticsWorkflowKind, "content_performance_analysis");
  assert.equal(result.providerResponse, undefined);
  assert.equal(result.retryPolicy.maxAttempts, 1);
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
