import type { AiProviderId, AiProviderProfile, AiTaskType } from "./types";

const now = () => new Date().toISOString();

const providerCapabilities: Record<AiProviderId, AiTaskType[]> = {
  mock: ["text_generation", "structured_output", "planning", "classification", "summarization", "embedding"],
  openrouter: ["text_generation", "structured_output", "planning", "classification", "summarization"],
  gemini: ["text_generation", "structured_output", "planning", "classification", "summarization", "embedding"],
  claude: ["text_generation", "structured_output", "planning", "classification", "summarization"],
  openai_compatible: ["text_generation", "structured_output", "planning", "classification", "summarization", "embedding"],
  ollama_local: ["text_generation", "structured_output", "planning", "classification", "summarization", "embedding"],
};

function baseProvider(input: Omit<AiProviderProfile, "health">): AiProviderProfile {
  return {
    ...input,
    health: {
      status: input.status === "Mock" ? "mock" : input.status === "Not connected" ? "not_connected" : input.status === "Blocked" ? "blocked" : "degraded",
      latencyMs: input.id === "mock" ? 24 : 0,
      failureRate: input.id === "mock" ? 0 : 1,
      lastCheckedAt: now(),
    },
  };
}

function envHas(env: NodeJS.ProcessEnv, keys: string[]) {
  return keys.some((key) => Boolean(env[key]?.trim()));
}

export function getAiProviderProfiles(env: NodeJS.ProcessEnv = process.env): AiProviderProfile[] {
  const openRouterConfigured = envHas(env, ["OPENROUTER_API_KEY"]);
  const geminiConfigured = envHas(env, ["GEMINI_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY"]);
  const claudeConfigured = envHas(env, ["ANTHROPIC_API_KEY", "CLAUDE_API_KEY"]);
  const openAiCompatibleConfigured = envHas(env, ["OPENAI_COMPATIBLE_API_KEY", "OPENAI_API_KEY"]);
  const ollamaConfigured = envHas(env, ["OLLAMA_BASE_URL", "LOCAL_LLM_BASE_URL"]);

  return [
    baseProvider({
      id: "mock",
      label: "Folqen Mock Runtime",
      status: "Mock",
      category: "mock",
      capabilities: providerCapabilities.mock,
      configured: true,
      liveExecutionEnabled: false,
      paidToolGuard: "not_required",
      costPer1kInputTokensInr: 0,
      costPer1kOutputTokensInr: 0,
      maxConcurrency: 50,
      timeoutMs: 250,
      notes: ["Default provider. Generates deterministic dry-run responses without network calls or paid execution."],
    }),
    baseProvider({
      id: "openrouter",
      label: "OpenRouter",
      status: openRouterConfigured ? "Blocked" : "Not connected",
      category: "cloud_paid",
      capabilities: providerCapabilities.openrouter,
      configured: openRouterConfigured,
      liveExecutionEnabled: false,
      paidToolGuard: "blocked",
      costPer1kInputTokensInr: 0.08,
      costPer1kOutputTokensInr: 0.16,
      maxConcurrency: 0,
      timeoutMs: 30_000,
      notes: ["Credential status is detected, but live execution is blocked until paid-tool approval and provider governance are implemented."],
    }),
    baseProvider({
      id: "gemini",
      label: "Gemini",
      status: geminiConfigured ? "Blocked" : "Not connected",
      category: "cloud_quota",
      capabilities: providerCapabilities.gemini,
      configured: geminiConfigured,
      liveExecutionEnabled: false,
      paidToolGuard: "needs_approval",
      costPer1kInputTokensInr: 0.04,
      costPer1kOutputTokensInr: 0.12,
      maxConcurrency: 0,
      timeoutMs: 30_000,
      notes: ["Gemini adapter is status-aware only. No API request is made in this slice."],
    }),
    baseProvider({
      id: "claude",
      label: "Claude",
      status: claudeConfigured ? "Blocked" : "Not connected",
      category: "cloud_paid",
      capabilities: providerCapabilities.claude,
      configured: claudeConfigured,
      liveExecutionEnabled: false,
      paidToolGuard: "blocked",
      costPer1kInputTokensInr: 0.12,
      costPer1kOutputTokensInr: 0.6,
      maxConcurrency: 0,
      timeoutMs: 30_000,
      notes: ["Claude adapter is future-ready and remains blocked by governance and budget controls."],
    }),
    baseProvider({
      id: "openai_compatible",
      label: "OpenAI-Compatible API",
      status: openAiCompatibleConfigured ? "Blocked" : "Not connected",
      category: "openai_compatible",
      capabilities: providerCapabilities.openai_compatible,
      configured: openAiCompatibleConfigured,
      liveExecutionEnabled: false,
      paidToolGuard: "blocked",
      costPer1kInputTokensInr: 0.1,
      costPer1kOutputTokensInr: 0.25,
      maxConcurrency: 0,
      timeoutMs: 30_000,
      notes: ["Compatible with OpenAI-style endpoints later. Current runtime never sends credentials or prompts."],
    }),
    baseProvider({
      id: "ollama_local",
      label: "Local / Ollama",
      status: ollamaConfigured ? "Configured" : "Not connected",
      category: "local",
      capabilities: providerCapabilities.ollama_local,
      configured: ollamaConfigured,
      liveExecutionEnabled: false,
      paidToolGuard: "not_required",
      costPer1kInputTokensInr: 0,
      costPer1kOutputTokensInr: 0,
      maxConcurrency: 0,
      timeoutMs: 60_000,
      notes: ["Local endpoint discovery is ready, but real local execution is still blocked until sandbox approval and worker checks exist."],
    }),
  ];
}

export function getAiProviderProfile(providerId: AiProviderId, env: NodeJS.ProcessEnv = process.env) {
  return getAiProviderProfiles(env).find((provider) => provider.id === providerId);
}

export function isAiProviderId(value: string): value is AiProviderId {
  return ["mock", "openrouter", "gemini", "claude", "openai_compatible", "ollama_local"].includes(value);
}
