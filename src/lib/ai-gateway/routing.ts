import { getAiProviderProfiles } from "./providers";
import type { AiGatewayRequest, AiProviderId, AiProviderProfile } from "./types";

const defaultFallbacks: AiProviderId[] = ["mock", "ollama_local", "gemini", "openrouter", "claude", "openai_compatible"];

function uniqueProviders(values: AiProviderId[]) {
  return Array.from(new Set(values));
}

export function buildFallbackChain(input: Required<Pick<AiGatewayRequest, "taskType" | "preferredProviders" | "fallbackProviders">>, providers = getAiProviderProfiles()): AiProviderId[] {
  const requested = uniqueProviders([...input.preferredProviders, ...input.fallbackProviders, ...defaultFallbacks]);
  return requested.filter((providerId) => providers.some((provider) => provider.id === providerId && provider.capabilities.includes(input.taskType)));
}

export function selectProviderForRequest(input: Required<Pick<AiGatewayRequest, "taskType" | "preferredProviders" | "fallbackProviders">>, providers = getAiProviderProfiles()): {
  provider: AiProviderProfile;
  fallbackChain: AiProviderId[];
  blockedProviders: AiProviderProfile[];
} {
  const fallbackChain = buildFallbackChain(input, providers);
  const candidates = fallbackChain.map((providerId) => providers.find((provider) => provider.id === providerId)).filter(Boolean) as AiProviderProfile[];
  const provider = candidates.find((candidate) => candidate.id === "mock") ?? providers.find((candidate) => candidate.id === "mock") ?? providers[0];

  return {
    provider,
    fallbackChain,
    blockedProviders: candidates.filter((candidate) => candidate.id !== "mock" && !candidate.liveExecutionEnabled),
  };
}
