import assert from "node:assert/strict";
import test from "node:test";

import { resolveAiGatewayMutationAccess, resolveAiGatewayReadAccess } from "./api-handler";
import { evaluateAiBudget } from "./budget";
import { normalizeAiGatewayInput, runAiRuntimeGraph } from "./flows";
import { getAiProviderProfiles } from "./providers";
import { buildFallbackChain, selectProviderForRequest } from "./routing";
import { runAiGatewayExecution } from "./service";
import { validateAiResponse } from "./validation";

const operator = {
  id: "user_operator",
  email: "operator@folqen.test",
  name: "Operator",
  role: "OPERATOR" as const,
  mustChangePassword: false,
};

const viewer = {
  ...operator,
  id: "user_viewer",
  role: "VIEWER" as const,
};

test("AI gateway exposes all required provider adapters with live execution disabled", () => {
  const providers = getAiProviderProfiles({
    OPENROUTER_API_KEY: "set",
    GEMINI_API_KEY: "set",
    ANTHROPIC_API_KEY: "set",
    OPENAI_COMPATIBLE_API_KEY: "set",
    OLLAMA_BASE_URL: "http://localhost:11434",
  } as unknown as NodeJS.ProcessEnv);

  assert.deepEqual(
    providers.map((provider) => provider.id),
    ["mock", "openrouter", "gemini", "claude", "openai_compatible", "ollama_local"],
  );
  assert.equal(providers.every((provider) => provider.liveExecutionEnabled === false), true);
  assert.equal(providers.find((provider) => provider.id === "mock")?.status, "Mock");
  assert.equal(providers.find((provider) => provider.id === "openrouter")?.status, "Blocked");
  assert.equal(providers.find((provider) => provider.id === "ollama_local")?.status, "Configured");
});

test("provider routing always keeps mock in the fallback path", () => {
  const input = normalizeAiGatewayInput({
    workflowKind: "structured_generation",
    objective: "Route a safe content strategy request.",
    preferredProviders: ["openrouter"],
    fallbackProviders: ["gemini", "mock"],
  });

  const chain = buildFallbackChain(input);
  const route = selectProviderForRequest(input);

  assert.equal(chain.includes("mock"), true);
  assert.equal(route.provider.id, "mock");
  assert.equal(route.blockedProviders.some((provider) => provider.id === "openrouter"), true);
});

test("AI runtime graph produces governance, budget, validation, and trace output", async () => {
  const { result } = await runAiRuntimeGraph({
    workflowKind: "provider_execution",
    objective: "Summarize mystery research notes in a safe dry run.",
    preferredProviders: ["gemini"],
    responseSchema: { required: ["objective", "workflowKind", "providerId", "recommendations", "safety"] },
  });

  assert.equal(result.provider.id, "mock");
  assert.equal(result.mode, "sandbox");
  assert.equal(result.governance.decision, "sandbox_only");
  assert.equal(result.budget.status, "within_budget");
  assert.equal(result.validation.status, "passed");
  assert.ok(result.observability.traceId.startsWith("trace_"));
  assert.equal(result.approvalCheckpoint.status, "pending");
});

test("AI gateway service queues a mock-safe execution result", async () => {
  const result = await runAiGatewayExecution({
    workflowKind: "structured_generation",
    objective: "Create a dry-run hook optimization plan for an India folklore video.",
    preferredProviders: ["claude"],
    responseSchema: { required: ["objective", "workflowKind", "providerId", "recommendations", "safety"] },
  });

  assert.equal(result.queue.mode, "mock");
  assert.equal(result.queue.queueName, "folqen.ai.runtime");
  assert.equal(result.provider.id, "mock");
  assert.equal(result.persisted, false);
  assert.equal(result.mockResponse.content.includes("No provider API"), true);
});

test("budget guard blocks estimates above department budget", () => {
  const provider = getAiProviderProfiles().find((item) => item.id === "openrouter");
  assert.ok(provider);

  const decision = evaluateAiBudget(
    normalizeAiGatewayInput({
      workflowKind: "provider_execution",
      objective: "Estimate an oversized generation.",
      preferredProviders: ["openrouter"],
      estimatedInputTokens: 120_000,
      estimatedOutputTokens: 32_000,
      budgetInr: 1,
    }),
    provider,
  );

  assert.equal(decision.status, "blocked");
  assert.equal(decision.reasons.some((reason) => reason.includes("exceeds")), true);
});

test("response validator catches unsafe and malformed provider output", () => {
  const result = validateAiResponse(
    { expectedOutput: "json", responseSchema: { required: ["summary"] } },
    { content: "bypass approval and publish now", structured: {} },
  );

  assert.equal(result.status, "failed");
  assert.equal(result.unsafeContentDetected, true);
  assert.equal(result.malformedOutputDetected, true);
  assert.equal(result.schemaValid, false);
});

test("AI gateway access helpers enforce login, role, and mutation safety", () => {
  assert.deepEqual(resolveAiGatewayReadAccess(null), { ok: false, status: 401, error: "Login required." });
  assert.deepEqual(resolveAiGatewayMutationAccess({ user: null }), { ok: false, status: 401, error: "Login required." });
  assert.deepEqual(resolveAiGatewayMutationAccess({ user: viewer }), { ok: false, status: 403, error: "Only admins and operators can run AI gateway simulations." });
  assert.deepEqual(resolveAiGatewayMutationAccess({ user: operator, safetyError: { status: 403, error: "Mutation must be sent from the Folqen app UI." } }), {
    ok: false,
    status: 403,
    error: "Mutation must be sent from the Folqen app UI.",
  });
  assert.equal(resolveAiGatewayMutationAccess({ user: operator }).ok, true);
});
