import { getEnv } from "@/lib/env";
import type { IntelligenceProviderId, IntelligenceProviderStatus, IntelligenceRunInput } from "./types";

export function getIntelligenceProviderStatus(providerId: IntelligenceProviderId = "mock"): IntelligenceProviderStatus {
  const env = getEnv();

  if (providerId === "mock") {
    return {
      id: "mock",
      label: "Mock Intelligence Provider",
      status: "Mock",
      configured: true,
      paidToolGuard: "not_required",
      message: "Mock-safe provider selected. No external AI call, scraping, or paid execution will run.",
    };
  }

  if (providerId === "openrouter") {
    return {
      id: "openrouter",
      label: "OpenRouter",
      status: env.OPENROUTER_API_KEY ? "Blocked" : "Not connected",
      configured: Boolean(env.OPENROUTER_API_KEY),
      paidToolGuard: "blocked",
      message: "OpenRouter is a placeholder provider. Paid-tool approval is required before real execution.",
    };
  }

  return {
    id: "gemini",
    label: "Gemini",
    status: env.GEMINI_API_KEY ? "Blocked" : "Not connected",
    configured: Boolean(env.GEMINI_API_KEY),
    paidToolGuard: "blocked",
    message: "Gemini is a placeholder provider. Quota/cost approval is required before real execution.",
  };
}

export async function runMockSafeIntelligenceProvider(input: IntelligenceRunInput) {
  const providerStatus = getIntelligenceProviderStatus(input.providerId ?? "mock");

  if (providerStatus.id !== "mock") {
    return {
      ok: false as const,
      providerStatus,
      message: providerStatus.message,
    };
  }

  return {
    ok: true as const,
    providerStatus,
    message: "Mock-safe intelligence output generated deterministically from manual inputs.",
  };
}

export function listIntelligenceProviders() {
  return [getIntelligenceProviderStatus("mock"), getIntelligenceProviderStatus("openrouter"), getIntelligenceProviderStatus("gemini")];
}
