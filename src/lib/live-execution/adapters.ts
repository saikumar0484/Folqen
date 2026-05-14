import type { NormalizedAiGatewayInput } from "@/lib/ai-gateway/flows";
import type { AiProviderId } from "@/lib/ai-gateway/types";
import { estimateTokenCostInr } from "@/lib/ai-gateway/budget";
import { getAiProviderProfile } from "@/lib/ai-gateway/providers";
import { FIRST_LIVE_TARGET } from "./config";
import type { LiveProviderResponse } from "./types";

type LiveAdapterInput = {
  providerId: AiProviderId;
  model?: string;
  input: NormalizedAiGatewayInput;
  timeoutMs: number;
  responseMimeType?: "application/json" | "text/plain";
  responseSchema?: Record<string, unknown>;
};

function extractGeminiText(payload: unknown) {
  const candidates = typeof payload === "object" && payload !== null && "candidates" in payload ? payload.candidates : undefined;
  if (!Array.isArray(candidates)) return "";
  const first = candidates[0] as Record<string, unknown> | undefined;
  const content = first?.content as Record<string, unknown> | undefined;
  const parts = content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts.map((part) => (typeof part === "object" && part !== null && "text" in part ? String(part.text ?? "") : "")).join("").trim();
}

function extractGeminiUsage(payload: unknown, fallbackInputTokens: number, fallbackOutputTokens: number) {
  const usage = typeof payload === "object" && payload !== null && "usageMetadata" in payload ? (payload.usageMetadata as Record<string, unknown>) : {};
  const inputTokens = Number(usage.promptTokenCount ?? fallbackInputTokens);
  const outputTokens = Number(usage.candidatesTokenCount ?? fallbackOutputTokens);
  const totalTokens = Number(usage.totalTokenCount ?? inputTokens + outputTokens);
  return { inputTokens, outputTokens, totalTokens };
}

export async function executeLiveProvider(input: LiveAdapterInput): Promise<LiveProviderResponse> {
  if (input.providerId !== FIRST_LIVE_TARGET.providerId) {
    throw new Error("Only the first live activation target is implemented for provider execution.");
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const provider = getAiProviderProfile("gemini");
  if (!provider) {
    throw new Error("Gemini provider profile is unavailable.");
  }

  const model = input.model || FIRST_LIVE_TARGET.defaultModel;
  const prompt = [input.input.systemPrompt, input.input.prompt ?? input.input.objective].filter(Boolean).join("\n\n");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), input.timeoutMs);
  const started = Date.now();

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: input.input.maxOutputTokens,
          ...(input.responseMimeType ? { responseMimeType: input.responseMimeType } : {}),
          ...(input.responseSchema ? { responseSchema: input.responseSchema } : {}),
        },
      }),
      signal: controller.signal,
    });
    const payload = (await response.json().catch(() => ({}))) as unknown;
    const content = extractGeminiText(payload);
    if (!response.ok || !content) {
      throw new Error(`Gemini live execution failed with status ${response.status}.`);
    }

    const usage = extractGeminiUsage(payload, input.input.estimatedInputTokens, input.input.estimatedOutputTokens);
    const estimatedCostInr = estimateTokenCostInr({ estimatedInputTokens: usage.inputTokens, estimatedOutputTokens: usage.outputTokens }, provider);

    return {
      providerId: "gemini",
      model,
      content,
      structured: input.responseMimeType === "application/json" ? { rawJson: content } : undefined,
      rawStatus: response.status,
      latencyMs: Math.max(1, Date.now() - started),
      usage: {
        ...usage,
        estimatedCostInr,
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}
