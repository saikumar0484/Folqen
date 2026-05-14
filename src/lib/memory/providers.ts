import { getEnv } from "@/lib/env";
import type { MemoryProviderStatus } from "./types";

export function getMemoryProviderStatus(source: NodeJS.ProcessEnv = process.env): MemoryProviderStatus {
  const env = getEnv(source);
  const provider = env.MEMORY_EMBEDDINGS_PROVIDER;

  if (provider === "mock") {
    return {
      id: "mock",
      label: "Mock embeddings",
      status: "Mock",
      reason: "Deterministic mock-safe retrieval is active. No live embedding provider is called.",
      liveEmbeddingsEnabled: false,
    };
  }

  if (provider === "openai") {
    return {
      id: "openai",
      label: "OpenAI embeddings",
      status: env.OPENAI_API_KEY && env.ALLOW_PAID_TOOLS ? "Blocked" : "Not connected",
      reason: "Live embeddings remain blocked until credentials, paid-tool approval, and a future execution guard are implemented.",
      liveEmbeddingsEnabled: false,
    };
  }

  return {
    id: "gemini",
    label: "Gemini embeddings",
    status: env.GEMINI_API_KEY && env.ALLOW_PAID_TOOLS ? "Blocked" : "Not connected",
    reason: "Gemini embeddings are a status-aware placeholder. No paid or live provider call is allowed in this slice.",
    liveEmbeddingsEnabled: false,
  };
}

export function createMockEmbeddingSignature(text: string) {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const buckets = new Array(16).fill(0) as number[];
  for (const token of tokens) {
    const bucket = Array.from(token).reduce((sum, char) => sum + char.charCodeAt(0), 0) % buckets.length;
    buckets[bucket] += 1;
  }

  const max = Math.max(...buckets, 1);
  return buckets.map((value) => Number((value / max).toFixed(4)));
}
