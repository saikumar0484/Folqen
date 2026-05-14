import assert from "node:assert/strict";
import test from "node:test";

import { FOLQEN_MUTATION_HEADER, FOLQEN_MUTATION_HEADER_VALUE } from "@/lib/security/mutation-headers";
import { getMemoryProviderStatus } from "./providers";
import { memoryCategories, reflectionWorkflowSteps } from "./registry";
import { createExperiment, createPromptVersion, getMemoryDashboard, ingestMemory, runReflection, searchMemory } from "./service";
import { resolveMemoryMutationAccess } from "./api-handler";

const operator = { id: "user_operator", email: "operator@example.com", name: "Operator", role: "OPERATOR" as const };
const viewer = { id: "user_viewer", email: "viewer@example.com", name: "Viewer", role: "VIEWER" as const };

function safeRequest() {
  return new Request("http://localhost:3000/api/memory/ingest", {
    method: "POST",
    headers: {
      origin: "http://localhost:3000",
      host: "localhost:3000",
      [FOLQEN_MUTATION_HEADER]: FOLQEN_MUTATION_HEADER_VALUE,
    },
  });
}

test("memory registry exposes all required memory categories and reflection steps", () => {
  assert.deepEqual(
    memoryCategories.map((category) => category.id),
    ["strategic", "workflow", "prompt", "analytics", "organizational"],
  );
  assert.equal(reflectionWorkflowSteps.includes("score_workflow_quality"), true);
  assert.equal(reflectionWorkflowSteps.includes("generate_strategy_recommendations"), true);
});

test("memory provider abstraction blocks live embeddings by default", () => {
  assert.deepEqual(getMemoryProviderStatus({ MEMORY_EMBEDDINGS_PROVIDER: "mock" } as unknown as NodeJS.ProcessEnv), {
    id: "mock",
    label: "Mock embeddings",
    status: "Mock",
    reason: "Deterministic mock-safe retrieval is active. No live embedding provider is called.",
    liveEmbeddingsEnabled: false,
  });

  const openaiStatus = getMemoryProviderStatus({
    MEMORY_EMBEDDINGS_PROVIDER: "openai",
    OPENAI_API_KEY: "present",
    ALLOW_PAID_TOOLS: "true",
  } as unknown as NodeJS.ProcessEnv);
  assert.equal(openaiStatus.status, "Blocked");
  assert.equal(openaiStatus.liveEmbeddingsEnabled, false);
});

test("memory ingestion returns queue metadata and mock semantic status", async () => {
  const result = await ingestMemory({
    category: "strategic",
    title: "High-retention folklore pattern",
    summary: "Regional mystery hooks should reveal the first clue early.",
    content: "Haunted fort shorts worked better when the first question was asked before second three.",
    tags: ["folklore", "retention"],
    sourceType: "test",
  });

  assert.equal(result.providerStatus.status, "Mock");
  assert.equal(result.semanticStatus, "Mock");
  assert.match(result.queueJobId, /^mock_job_/);
  assert.equal(result.memory.embeddingStatus, "Mock");
});

test("mock semantic retrieval ranks captured memory without a live provider", async () => {
  await ingestMemory({
    category: "workflow",
    title: "Retry bottleneck note",
    summary: "Render retries should stay advisory until FFmpeg is connected.",
    content: "Worker failures should create recovery suggestions and avoid automatic retries that spend credits.",
    tags: ["retry", "workflow"],
    sourceType: "test",
  });

  const result = await searchMemory({ query: "workflow retry recovery", categories: ["workflow"], limit: 5 });

  assert.equal(result.mode, "mock_semantic");
  assert.equal(result.providerStatus.liveEmbeddingsEnabled, false);
  assert.equal(result.items.length > 0, true);
  assert.equal(result.items[0].category, "workflow");
});

test("reflection engine creates recommendations without workflow mutation", async () => {
  const result = await runReflection({
    objective: "Compare recent workflow failures and propose safer retry strategy.",
    reflectionKind: "workflow_reflection",
    categories: ["workflow", "organizational"],
  });

  assert.equal(result.mode, "dry_run");
  assert.equal(result.mutationStatus, "no_workflow_mutation");
  assert.equal(result.memoryCaptureStatus, "Mock");
  assert.match(result.queueJobId, /^mock_job_/);
  assert.equal(result.recommendations.length >= 3, true);
  assert.equal(result.comparedMemoryIds.length >= 0, true);
});

test("experiment tracking supports hook comparison without automatic rollout", async () => {
  const result = await createExperiment({
    experimentType: "hook_comparison",
    name: "Hook A/B test",
    hypothesis: "Question hooks should improve retention.",
    variants: [
      { key: "a", label: "Question", description: "What happened inside the fort?", metrics: { retention: 0.74 } },
      { key: "b", label: "Statement", description: "This fort has a secret.", metrics: { retention: 0.62 } },
    ],
  });

  assert.equal(result.experimentType, "hook_comparison");
  assert.equal(result.winnerKey, "a");
  assert.equal(result.mutationStatus, "no_automatic_rollout");
});

test("prompt versioning captures memory but does not promote live workflow prompts", async () => {
  const result = await createPromptVersion({
    key: "hook_generator",
    content: "Generate three India-focused mystery hooks with source-safe language.",
    performanceScore: 0.72,
    optimizationNotes: "Prefer cold-open questions.",
  });

  assert.equal(result.key, "hook_generator");
  assert.equal(result.approvalStatus, "Needs approval");
  assert.match(result.message, /not automatically promoted/);
});

test("memory dashboard reports pgvector readiness and no live embeddings", async () => {
  const dashboard = await getMemoryDashboard();

  assert.equal(dashboard.semanticSearch.pgvectorReady, true);
  assert.equal(dashboard.semanticSearch.liveEmbeddingsEnabled, false);
  assert.equal(dashboard.semanticSearch.status, "Mock");
});

test("memory mutation access follows auth, role, and mutation guard outcomes", () => {
  assert.deepEqual(resolveMemoryMutationAccess({ user: null }), { ok: false, status: 401, error: "Login required." });
  assert.deepEqual(resolveMemoryMutationAccess({ user: viewer }), { ok: false, status: 403, error: "Only admins and operators can manage organizational memory." });
  assert.deepEqual(resolveMemoryMutationAccess({ user: operator, safetyError: { status: 403, error: "Missing Folqen mutation marker." } }), {
    ok: false,
    status: 403,
    error: "Missing Folqen mutation marker.",
  });
  assert.equal(resolveMemoryMutationAccess({ user: operator }).ok, true);
  assert.equal(safeRequest().headers.get(FOLQEN_MUTATION_HEADER), FOLQEN_MUTATION_HEADER_VALUE);
});
