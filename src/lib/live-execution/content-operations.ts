import { z } from "zod";

export const liveContentWorkflowKinds = [
  "hook_generation",
  "script_generation",
  "caption_generation",
  "metadata_optimization",
  "thumbnail_strategy",
  "platform_adaptation",
  "content_reflection",
  "content_quality_scoring",
] as const;

export type LiveContentWorkflowKind = (typeof liveContentWorkflowKinds)[number];

export const LIVE_CONTENT_OPERATIONAL_CAPABILITY = "gemini_content_operational_intelligence" as const;

export const liveContentWorkflowLabels: Record<LiveContentWorkflowKind, string> = {
  hook_generation: "Live Hook Generation",
  script_generation: "Script Generation",
  caption_generation: "Caption Generation",
  metadata_optimization: "Metadata Optimization",
  thumbnail_strategy: "Thumbnail Strategy",
  platform_adaptation: "Platform Adaptation",
  content_reflection: "Content Reflection",
  content_quality_scoring: "Content Quality Scoring",
};

export const contentPlatformTargets = ["YOUTUBE_SHORTS", "INSTAGRAM_REELS", "THREADS", "LINKEDIN", "X_TWITTER"] as const;
export type ContentPlatformTarget = (typeof contentPlatformTargets)[number];

export const contentOperationalOutputSchema = z.object({
  workflowKind: z.enum(liveContentWorkflowKinds),
  contentBrief: z.object({
    title: z.string().min(3).max(180),
    angle: z.string().min(8).max(700),
    targetPlatforms: z.array(z.enum(contentPlatformTargets)).min(1).max(5),
    audience: z.string().min(3).max(400),
    sourceVerificationNotes: z.string().min(6).max(700),
  }),
  drafts: z
    .array(
      z.object({
        type: z.enum(["hook", "script", "caption", "metadata", "thumbnail_strategy", "platform_adaptation", "reflection", "score"]),
        platform: z.enum(contentPlatformTargets),
        text: z.string().min(6).max(1800),
        rationale: z.string().min(8).max(700),
        confidence: z.number().min(0).max(100),
        riskLevel: z.enum(["low", "medium", "high"]),
      }),
    )
    .min(1)
    .max(12),
  recommendations: z
    .array(
      z.object({
        action: z.string().min(6).max(360),
        rationale: z.string().min(8).max(700),
        priority: z.enum(["low", "medium", "high"]),
        confidence: z.number().min(0).max(100),
      }),
    )
    .min(1)
    .max(8),
  duplicateSignals: z.array(z.string().min(3).max(300)).max(8),
  memoryContext: z.object({
    used: z.boolean(),
    items: z.array(z.object({ id: z.string(), title: z.string(), relevance: z.number().min(0).max(100) })).max(8),
  }),
  scoring: z.object({
    qualityScore: z.number().min(0).max(100),
    originalityScore: z.number().min(0).max(100),
    safetyScore: z.number().min(0).max(100),
    platformFitScore: z.number().min(0).max(100),
    evidenceScore: z.number().min(0).max(100),
  }),
  observability: z.object({
    generationTrace: z.array(z.string().min(3).max(280)).min(1).max(8),
    retrievalUsed: z.boolean(),
    memoryItemsUsed: z.number().min(0).max(25),
    estimatedReviewComplexity: z.enum(["low", "medium", "high"]),
  }),
  safety: z.object({
    noPublishing: z.literal(true),
    needsHumanReview: z.literal(true),
    sourceVerificationRequired: z.literal(true),
    noMediaGeneration: z.literal(true),
    noPlatformExecution: z.literal(true),
    noWorkflowMutation: z.literal(true),
  }),
});

export type ContentOperationalOutput = z.infer<typeof contentOperationalOutputSchema>;

export const contentOperationalResponseSchema = {
  type: "OBJECT",
  properties: {
    workflowKind: { type: "STRING", enum: liveContentWorkflowKinds },
    contentBrief: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        angle: { type: "STRING" },
        targetPlatforms: { type: "ARRAY", items: { type: "STRING", enum: contentPlatformTargets } },
        audience: { type: "STRING" },
        sourceVerificationNotes: { type: "STRING" },
      },
      required: ["title", "angle", "targetPlatforms", "audience", "sourceVerificationNotes"],
    },
    drafts: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          type: { type: "STRING", enum: ["hook", "script", "caption", "metadata", "thumbnail_strategy", "platform_adaptation", "reflection", "score"] },
          platform: { type: "STRING", enum: contentPlatformTargets },
          text: { type: "STRING" },
          rationale: { type: "STRING" },
          confidence: { type: "NUMBER" },
          riskLevel: { type: "STRING", enum: ["low", "medium", "high"] },
        },
        required: ["type", "platform", "text", "rationale", "confidence", "riskLevel"],
      },
    },
    recommendations: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          action: { type: "STRING" },
          rationale: { type: "STRING" },
          priority: { type: "STRING", enum: ["low", "medium", "high"] },
          confidence: { type: "NUMBER" },
        },
        required: ["action", "rationale", "priority", "confidence"],
      },
    },
    duplicateSignals: { type: "ARRAY", items: { type: "STRING" } },
    memoryContext: {
      type: "OBJECT",
      properties: {
        used: { type: "BOOLEAN" },
        items: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              title: { type: "STRING" },
              relevance: { type: "NUMBER" },
            },
            required: ["id", "title", "relevance"],
          },
        },
      },
      required: ["used", "items"],
    },
    scoring: {
      type: "OBJECT",
      properties: {
        qualityScore: { type: "NUMBER" },
        originalityScore: { type: "NUMBER" },
        safetyScore: { type: "NUMBER" },
        platformFitScore: { type: "NUMBER" },
        evidenceScore: { type: "NUMBER" },
      },
      required: ["qualityScore", "originalityScore", "safetyScore", "platformFitScore", "evidenceScore"],
    },
    observability: {
      type: "OBJECT",
      properties: {
        generationTrace: { type: "ARRAY", items: { type: "STRING" } },
        retrievalUsed: { type: "BOOLEAN" },
        memoryItemsUsed: { type: "NUMBER" },
        estimatedReviewComplexity: { type: "STRING", enum: ["low", "medium", "high"] },
      },
      required: ["generationTrace", "retrievalUsed", "memoryItemsUsed", "estimatedReviewComplexity"],
    },
    safety: {
      type: "OBJECT",
      properties: {
        noPublishing: { type: "BOOLEAN" },
        needsHumanReview: { type: "BOOLEAN" },
        sourceVerificationRequired: { type: "BOOLEAN" },
        noMediaGeneration: { type: "BOOLEAN" },
        noPlatformExecution: { type: "BOOLEAN" },
        noWorkflowMutation: { type: "BOOLEAN" },
      },
      required: ["noPublishing", "needsHumanReview", "sourceVerificationRequired", "noMediaGeneration", "noPlatformExecution", "noWorkflowMutation"],
    },
  },
  required: ["workflowKind", "contentBrief", "drafts", "recommendations", "duplicateSignals", "memoryContext", "scoring", "observability", "safety"],
} as const;

export type ContentMemoryContextItem = {
  id: string;
  title: string;
  summary: string;
  relevance: number;
  category: string;
};

export function buildContentOperationsSystemPrompt() {
  return [
    "You are Folqen's governed Content Department intelligence system.",
    "Create structured draft content intelligence only for an India-based Urban Legends / Mystery / Folklore brand.",
    "Use only operator-provided inputs and supplied memory context. Do not claim live browsing, scraping, platform API access, rendering, scheduling, publishing, or media generation.",
    "Separate legend, hypothesis, and verified fact clearly. Avoid exploiting real tragedies, private individuals, graphic detail, copyrighted story reuse, or celebrity likeness.",
    "Optimize for platform fit while keeping outputs as human-review drafts. No posting instructions, no schedules, no rendered assets, and no workflow mutation.",
  ].join("\n");
}

export function buildContentOperationsPrompt(input: {
  workflowKind: LiveContentWorkflowKind;
  objective: string;
  seedTopics?: string[];
  audienceNotes?: string[];
  sourceReferences?: string[];
  platformTargets?: ContentPlatformTarget[];
  memoryContext?: ContentMemoryContextItem[];
}) {
  return [
    `Workflow: ${liveContentWorkflowLabels[input.workflowKind]} (${input.workflowKind})`,
    `Objective: ${input.objective}`,
    input.platformTargets?.length ? `Platform targets:\n${input.platformTargets.map((item) => `- ${item}`).join("\n")}` : undefined,
    input.seedTopics?.length ? `Seed topics or draft angles:\n${input.seedTopics.map((item) => `- ${item}`).join("\n")}` : undefined,
    input.audienceNotes?.length ? `Audience and style notes:\n${input.audienceNotes.map((item) => `- ${item}`).join("\n")}` : undefined,
    input.sourceReferences?.length ? `Manual source references:\n${input.sourceReferences.map((item) => `- ${item}`).join("\n")}` : undefined,
    input.memoryContext?.length
      ? `Memory context to optimize against:\n${input.memoryContext.map((item) => `- ${item.id}: ${item.title} (${item.category}, relevance ${item.relevance}) - ${item.summary}`).join("\n")}`
      : "Memory context: none available. State retrievalUsed=false and recommend memory capture.",
    "Return only valid JSON matching the schema. Generate draft hooks/scripts/captions/metadata/thumbnail strategy/platform adaptation only where useful for the requested workflow. Include quality, originality, safety, platform-fit, evidence scores, duplicate signals, generation trace, and mandatory safety flags.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function parseContentOperationsJson(content: string): ContentOperationalOutput {
  const trimmed = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const parsed = JSON.parse(trimmed) as unknown;
  return contentOperationalOutputSchema.parse(parsed);
}

export function scoreContentOutput(output: ContentOperationalOutput) {
  const scoring = output.scoring;
  const average = (scoring.qualityScore + scoring.originalityScore + scoring.safetyScore + scoring.platformFitScore + scoring.evidenceScore) / 5;
  const duplicatePenalty = Math.min(22, output.duplicateSignals.length * 4);
  const riskPenalty = output.drafts.filter((item) => item.riskLevel === "high").length * 6;
  const reviewPenalty = output.observability.estimatedReviewComplexity === "high" ? 6 : output.observability.estimatedReviewComplexity === "medium" ? 2 : 0;
  const score = Math.max(0, Math.min(100, average - duplicatePenalty - riskPenalty - reviewPenalty));
  return Number(score.toFixed(1));
}

export function contentOutputWarnings(output: ContentOperationalOutput) {
  const warnings: string[] = [];
  if (scoreContentOutput(output) < 60) warnings.push("Content quality score is below the live acceptance threshold.");
  if (output.scoring.safetyScore < 75) warnings.push("Safety score is too low for operational content use.");
  if (output.scoring.evidenceScore < 50) warnings.push("Evidence score is too low; source verification is required before downstream use.");
  if (output.duplicateSignals.length > 5) warnings.push("Duplicate signal count is high; content may repeat prior patterns.");
  if (output.drafts.some((draft) => draft.riskLevel === "high")) warnings.push("At least one draft is high-risk and needs human review before reuse.");
  if (!output.safety.noPublishing || !output.safety.needsHumanReview || !output.safety.sourceVerificationRequired || !output.safety.noMediaGeneration || !output.safety.noPlatformExecution || !output.safety.noWorkflowMutation) warnings.push("Mandatory content safety flags are not all true.");
  return warnings;
}
