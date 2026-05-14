import type { AiGatewayRequest, AiValidationResult } from "./types";

const unsafePatterns = [/publish\s+now/i, /bypass\s+approval/i, /ignore\s+copyright/i, /leak\s+secret/i, /use\s+paid\s+api/i];

export function validateAiResponse(input: Required<Pick<AiGatewayRequest, "expectedOutput" | "responseSchema">>, response: { content: string; structured: Record<string, unknown> }): AiValidationResult {
  const warnings: string[] = [];
  const unsafeContentDetected = unsafePatterns.some((pattern) => pattern.test(response.content));
  if (unsafeContentDetected) {
    warnings.push("Unsafe execution or approval bypass language detected.");
  }

  const malformedOutputDetected = input.expectedOutput === "json" && Object.keys(response.structured).length === 0;
  if (malformedOutputDetected) {
    warnings.push("Expected JSON output is missing structured fields.");
  }

  const requiredKeys = Array.isArray(input.responseSchema.required) ? input.responseSchema.required.map(String) : [];
  const missingKeys = requiredKeys.filter((key) => !(key in response.structured));
  const schemaValid = missingKeys.length === 0;
  if (!schemaValid) {
    warnings.push(`Structured response is missing required keys: ${missingKeys.join(", ")}.`);
  }

  const score = Math.max(0, 100 - warnings.length * 20 - (unsafeContentDetected ? 30 : 0) - (malformedOutputDetected ? 20 : 0));
  const status = unsafeContentDetected || malformedOutputDetected ? "failed" : warnings.length ? "warning" : "passed";

  return {
    status,
    score,
    schemaValid,
    unsafeContentDetected,
    malformedOutputDetected,
    hallucinationGuard: input.expectedOutput === "embedding" ? "not_applicable" : "passed_mock",
    warnings,
  };
}
