import { z } from "zod";

export const liveResearchWorkflowKinds = [
  "content_ideation",
  "trend_analysis",
  "competitor_insight",
  "topic_intelligence",
  "audience_insight",
  "strategic_recommendation",
  "research_reflection",
  "memory_aware_retrieval",
  "research_scoring",
] as const;

export type LiveResearchWorkflowKind = (typeof liveResearchWorkflowKinds)[number];

export const LIVE_RESEARCH_OPERATIONAL_CAPABILITY = "gemini_research_operational_intelligence" as const;

export const liveResearchWorkflowLabels: Record<LiveResearchWorkflowKind, string> = {
  content_ideation: "Content Ideation / Trend Insight",
  trend_analysis: "Live Trend Analysis",
  competitor_insight: "Competitor Insight",
  topic_intelligence: "Topic Intelligence",
  audience_insight: "Audience Insight",
  strategic_recommendation: "Strategic Recommendation",
  research_reflection: "Research Reflection",
  memory_aware_retrieval: "Memory-Aware Retrieval",
  research_scoring: "Research Scoring",
};

export const researchOperationalOutputSchema = z.object({
  workflowKind: z.enum(liveResearchWorkflowKinds),
  summary: z.string().min(12).max(1400),
  insights: z
    .array(
      z.object({
        title: z.string().min(3).max(180),
        type: z.enum(["trend", "competitor", "topic", "audience", "strategy", "reflection", "memory", "score"]),
        confidence: z.number().min(0).max(100),
        evidence: z.string().min(8).max(800),
        memoryComparison: z.string().min(3).max(700),
        noveltyScore: z.number().min(0).max(100),
        riskLevel: z.enum(["low", "medium", "high"]),
      }),
    )
    .min(1)
    .max(10),
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
    confidenceScore: z.number().min(0).max(100),
    noveltyScore: z.number().min(0).max(100),
    safetyScore: z.number().min(0).max(100),
    evidenceScore: z.number().min(0).max(100),
  }),
  observability: z.object({
    reasoningTrace: z.array(z.string().min(3).max(280)).min(1).max(8),
    retrievalUsed: z.boolean(),
    memoryItemsUsed: z.number().min(0).max(25),
  }),
  safety: z.object({
    noPublishing: z.literal(true),
    needsHumanReview: z.literal(true),
    sourceVerificationRequired: z.literal(true),
    noWorkflowMutation: z.literal(true),
  }),
});

export type ResearchOperationalOutput = z.infer<typeof researchOperationalOutputSchema>;

export const researchOperationalResponseSchema = {
  type: "OBJECT",
  properties: {
    workflowKind: { type: "STRING", enum: liveResearchWorkflowKinds },
    summary: { type: "STRING" },
    insights: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          type: { type: "STRING", enum: ["trend", "competitor", "topic", "audience", "strategy", "reflection", "memory", "score"] },
          confidence: { type: "NUMBER" },
          evidence: { type: "STRING" },
          memoryComparison: { type: "STRING" },
          noveltyScore: { type: "NUMBER" },
          riskLevel: { type: "STRING", enum: ["low", "medium", "high"] },
        },
        required: ["title", "type", "confidence", "evidence", "memoryComparison", "noveltyScore", "riskLevel"],
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
        confidenceScore: { type: "NUMBER" },
        noveltyScore: { type: "NUMBER" },
        safetyScore: { type: "NUMBER" },
        evidenceScore: { type: "NUMBER" },
      },
      required: ["qualityScore", "confidenceScore", "noveltyScore", "safetyScore", "evidenceScore"],
    },
    observability: {
      type: "OBJECT",
      properties: {
        reasoningTrace: { type: "ARRAY", items: { type: "STRING" } },
        retrievalUsed: { type: "BOOLEAN" },
        memoryItemsUsed: { type: "NUMBER" },
      },
      required: ["reasoningTrace", "retrievalUsed", "memoryItemsUsed"],
    },
    safety: {
      type: "OBJECT",
      properties: {
        noPublishing: { type: "BOOLEAN" },
        needsHumanReview: { type: "BOOLEAN" },
        sourceVerificationRequired: { type: "BOOLEAN" },
        noWorkflowMutation: { type: "BOOLEAN" },
      },
      required: ["noPublishing", "needsHumanReview", "sourceVerificationRequired", "noWorkflowMutation"],
    },
  },
  required: ["workflowKind", "summary", "insights", "recommendations", "duplicateSignals", "memoryContext", "scoring", "observability", "safety"],
} as const;

export type ResearchMemoryContextItem = {
  id: string;
  title: string;
  summary: string;
  relevance: number;
  category: string;
};

export function buildResearchOperationsSystemPrompt() {
  return [
    "You are Folqen's governed Research Department intelligence system.",
    "Use only the operator-provided inputs and supplied memory context. Do not claim live browsing, scraping, platform API access, publishing, rendering, scheduling, or account access.",
    "The brand is India-based Urban Legends / Mystery / Folklore. Separate legend, hypothesis, and verified fact clearly.",
    "Avoid duplicate recommendations by comparing against memory context.",
    "Every output is draft research intelligence only: human review, source verification, no publishing, and no workflow mutation are mandatory.",
  ].join("\n");
}

export function buildResearchOperationsPrompt(input: {
  workflowKind: LiveResearchWorkflowKind;
  objective: string;
  seedTopics?: string[];
  competitors?: string[];
  audienceNotes?: string[];
  sourceReferences?: string[];
  memoryContext?: ResearchMemoryContextItem[];
}) {
  return [
    `Workflow: ${liveResearchWorkflowLabels[input.workflowKind]} (${input.workflowKind})`,
    `Objective: ${input.objective}`,
    input.seedTopics?.length ? `Seed topics:\n${input.seedTopics.map((item) => `- ${item}`).join("\n")}` : undefined,
    input.competitors?.length ? `Competitors or channels to compare:\n${input.competitors.map((item) => `- ${item}`).join("\n")}` : undefined,
    input.audienceNotes?.length ? `Audience notes:\n${input.audienceNotes.map((item) => `- ${item}`).join("\n")}` : undefined,
    input.sourceReferences?.length ? `Manual source references:\n${input.sourceReferences.map((item) => `- ${item}`).join("\n")}` : undefined,
    input.memoryContext?.length
      ? `Memory context to compare against:\n${input.memoryContext.map((item) => `- ${item.id}: ${item.title} (${item.category}, relevance ${item.relevance}) - ${item.summary}`).join("\n")}`
      : "Memory context: none available. State retrievalUsed=false and recommend memory capture.",
    "Return only valid JSON matching the schema. Include confidence, novelty, safety, evidence, duplicate signals, and reasoning trace. Do not create public content, scripts, media prompts, thumbnails, captions, or publishing instructions.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function parseResearchOperationsJson(content: string): ResearchOperationalOutput {
  const trimmed = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const parsed = JSON.parse(trimmed) as unknown;
  return researchOperationalOutputSchema.parse(parsed);
}

export function scoreResearchOutput(output: ResearchOperationalOutput) {
  const scoring = output.scoring;
  const average = (scoring.qualityScore + scoring.confidenceScore + scoring.noveltyScore + scoring.safetyScore + scoring.evidenceScore) / 5;
  const duplicatePenalty = Math.min(20, output.duplicateSignals.length * 4);
  const riskPenalty = output.insights.filter((item) => item.riskLevel === "high").length * 5;
  const score = Math.max(0, Math.min(100, average - duplicatePenalty - riskPenalty));
  return Number(score.toFixed(1));
}

export function researchOutputWarnings(output: ResearchOperationalOutput) {
  const warnings: string[] = [];
  if (scoreResearchOutput(output) < 55) warnings.push("Research quality score is below the live acceptance threshold.");
  if (output.scoring.safetyScore < 70) warnings.push("Safety score is too low for operational use.");
  if (output.scoring.evidenceScore < 50) warnings.push("Evidence score is too low; source verification is required before downstream use.");
  if (output.duplicateSignals.length > 5) warnings.push("Duplicate signal count is high; recommendations may repeat prior research.");
  if (!output.safety.noPublishing || !output.safety.needsHumanReview || !output.safety.sourceVerificationRequired || !output.safety.noWorkflowMutation) warnings.push("Mandatory safety flags are not all true.");
  return warnings;
}
