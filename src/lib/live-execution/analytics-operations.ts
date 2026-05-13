import { z } from "zod";

export const liveAnalyticsWorkflowKinds = [
  "content_performance_analysis",
  "hook_performance_intelligence",
  "audience_retention_analysis",
  "platform_performance",
  "workflow_performance_analysis",
  "strategic_optimization_recommendation",
  "reflection_based_analytics",
  "analytics_quality_scoring",
] as const;

export type LiveAnalyticsWorkflowKind = (typeof liveAnalyticsWorkflowKinds)[number];

export const LIVE_ANALYTICS_OPERATIONAL_CAPABILITY = "gemini_analytics_operational_intelligence" as const;

export const liveAnalyticsWorkflowLabels: Record<LiveAnalyticsWorkflowKind, string> = {
  content_performance_analysis: "Content Performance Analysis",
  hook_performance_intelligence: "Hook Performance Intelligence",
  audience_retention_analysis: "Audience Retention Analysis",
  platform_performance: "Platform Performance",
  workflow_performance_analysis: "Workflow Performance Analysis",
  strategic_optimization_recommendation: "Strategic Optimization Recommendation",
  reflection_based_analytics: "Reflection-Based Analytics",
  analytics_quality_scoring: "Analytics Quality Scoring",
};

export const analyticsDataSourceKinds = ["mock_ingestion", "future_youtube_hook", "future_instagram_hook", "workflow_analytics", "internal_execution_metrics"] as const;
export type AnalyticsDataSourceKind = (typeof analyticsDataSourceKinds)[number];

export const analyticsOperationalOutputSchema = z.object({
  workflowKind: z.enum(liveAnalyticsWorkflowKinds),
  report: z.object({
    title: z.string().min(3).max(180),
    summary: z.string().min(12).max(1400),
    dataSources: z.array(z.enum(analyticsDataSourceKinds)).min(1).max(5),
    confidence: z.number().min(0).max(100),
    limitations: z.array(z.string().min(3).max(320)).min(1).max(8),
  }),
  insights: z
    .array(
      z.object({
        title: z.string().min(3).max(180),
        metricFocus: z.enum(["ctr", "retention", "engagement", "watch_time", "workflow_latency", "failure_rate", "platform_fit", "conversion", "quality"]),
        interpretation: z.string().min(8).max(900),
        historicalComparison: z.string().min(3).max(700),
        confidence: z.number().min(0).max(100),
        impact: z.enum(["low", "medium", "high"]),
      }),
    )
    .min(1)
    .max(10),
  optimizationRecommendations: z
    .array(
      z.object({
        recommendation: z.string().min(6).max(420),
        rationale: z.string().min(8).max(800),
        confidence: z.number().min(0).max(100),
        expectedImpact: z.enum(["low", "medium", "high"]),
        executionStatus: z.literal("recommendation_only"),
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
    analyticsQualityScore: z.number().min(0).max(100),
    confidenceScore: z.number().min(0).max(100),
    evidenceScore: z.number().min(0).max(100),
    optimizationConfidenceScore: z.number().min(0).max(100),
    feedbackLoopQualityScore: z.number().min(0).max(100),
  }),
  observability: z.object({
    reasoningTrace: z.array(z.string().min(3).max(280)).min(1).max(8),
    retrievalUsed: z.boolean(),
    memoryItemsUsed: z.number().min(0).max(25),
    workflowLatencyClass: z.enum(["low", "medium", "high"]),
  }),
  safety: z.object({
    noPublishing: z.literal(true),
    needsHumanReview: z.literal(true),
    noPlatformApiAccess: z.literal(true),
    noAutonomousOptimization: z.literal(true),
    noPromptMutation: z.literal(true),
    noWorkflowMutation: z.literal(true),
  }),
});

export type AnalyticsOperationalOutput = z.infer<typeof analyticsOperationalOutputSchema>;

export const analyticsOperationalResponseSchema = {
  type: "OBJECT",
  properties: {
    workflowKind: { type: "STRING", enum: liveAnalyticsWorkflowKinds },
    report: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        summary: { type: "STRING" },
        dataSources: { type: "ARRAY", items: { type: "STRING", enum: analyticsDataSourceKinds } },
        confidence: { type: "NUMBER" },
        limitations: { type: "ARRAY", items: { type: "STRING" } },
      },
      required: ["title", "summary", "dataSources", "confidence", "limitations"],
    },
    insights: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          metricFocus: { type: "STRING", enum: ["ctr", "retention", "engagement", "watch_time", "workflow_latency", "failure_rate", "platform_fit", "conversion", "quality"] },
          interpretation: { type: "STRING" },
          historicalComparison: { type: "STRING" },
          confidence: { type: "NUMBER" },
          impact: { type: "STRING", enum: ["low", "medium", "high"] },
        },
        required: ["title", "metricFocus", "interpretation", "historicalComparison", "confidence", "impact"],
      },
    },
    optimizationRecommendations: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          recommendation: { type: "STRING" },
          rationale: { type: "STRING" },
          confidence: { type: "NUMBER" },
          expectedImpact: { type: "STRING", enum: ["low", "medium", "high"] },
          executionStatus: { type: "STRING", enum: ["recommendation_only"] },
        },
        required: ["recommendation", "rationale", "confidence", "expectedImpact", "executionStatus"],
      },
    },
    duplicateSignals: { type: "ARRAY", items: { type: "STRING" } },
    memoryContext: {
      type: "OBJECT",
      properties: {
        used: { type: "BOOLEAN" },
        items: { type: "ARRAY", items: { type: "OBJECT", properties: { id: { type: "STRING" }, title: { type: "STRING" }, relevance: { type: "NUMBER" } }, required: ["id", "title", "relevance"] } },
      },
      required: ["used", "items"],
    },
    scoring: {
      type: "OBJECT",
      properties: {
        analyticsQualityScore: { type: "NUMBER" },
        confidenceScore: { type: "NUMBER" },
        evidenceScore: { type: "NUMBER" },
        optimizationConfidenceScore: { type: "NUMBER" },
        feedbackLoopQualityScore: { type: "NUMBER" },
      },
      required: ["analyticsQualityScore", "confidenceScore", "evidenceScore", "optimizationConfidenceScore", "feedbackLoopQualityScore"],
    },
    observability: {
      type: "OBJECT",
      properties: {
        reasoningTrace: { type: "ARRAY", items: { type: "STRING" } },
        retrievalUsed: { type: "BOOLEAN" },
        memoryItemsUsed: { type: "NUMBER" },
        workflowLatencyClass: { type: "STRING", enum: ["low", "medium", "high"] },
      },
      required: ["reasoningTrace", "retrievalUsed", "memoryItemsUsed", "workflowLatencyClass"],
    },
    safety: {
      type: "OBJECT",
      properties: {
        noPublishing: { type: "BOOLEAN" },
        needsHumanReview: { type: "BOOLEAN" },
        noPlatformApiAccess: { type: "BOOLEAN" },
        noAutonomousOptimization: { type: "BOOLEAN" },
        noPromptMutation: { type: "BOOLEAN" },
        noWorkflowMutation: { type: "BOOLEAN" },
      },
      required: ["noPublishing", "needsHumanReview", "noPlatformApiAccess", "noAutonomousOptimization", "noPromptMutation", "noWorkflowMutation"],
    },
  },
  required: ["workflowKind", "report", "insights", "optimizationRecommendations", "duplicateSignals", "memoryContext", "scoring", "observability", "safety"],
} as const;

export type AnalyticsMemoryContextItem = {
  id: string;
  title: string;
  summary: string;
  relevance: number;
  category: string;
};

export function buildAnalyticsOperationsSystemPrompt() {
  return [
    "You are Folqen's governed Analytics Department intelligence system.",
    "Interpret performance signals for an India-based Urban Legends / Mystery / Folklore creator operation.",
    "Use only operator-provided analytics signals, internal execution metrics, and supplied memory context. Do not claim live YouTube, Instagram, platform API, scraping, publishing, or account access.",
    "Create optimization recommendations only. Do not mutate prompts, workflows, schedules, publishing queues, platform accounts, budgets, or scaling decisions.",
    "Every output must preserve human review and state limitations when data is mock, sparse, or future-hook only.",
  ].join("\n");
}

export function buildAnalyticsOperationsPrompt(input: {
  workflowKind: LiveAnalyticsWorkflowKind;
  objective: string;
  performanceSignals?: string[];
  sourceReferences?: string[];
  platformTargets?: string[];
  memoryContext?: AnalyticsMemoryContextItem[];
}) {
  return [
    `Workflow: ${liveAnalyticsWorkflowLabels[input.workflowKind]} (${input.workflowKind})`,
    `Objective: ${input.objective}`,
    input.platformTargets?.length ? `Platforms in scope:\n${input.platformTargets.map((item) => `- ${item}`).join("\n")}` : undefined,
    input.performanceSignals?.length ? `Mock/internal analytics signals:\n${input.performanceSignals.map((item) => `- ${item}`).join("\n")}` : undefined,
    input.sourceReferences?.length ? `Manual references or run IDs:\n${input.sourceReferences.map((item) => `- ${item}`).join("\n")}` : undefined,
    input.memoryContext?.length
      ? `Memory context to compare against:\n${input.memoryContext.map((item) => `- ${item.id}: ${item.title} (${item.category}, relevance ${item.relevance}) - ${item.summary}`).join("\n")}`
      : "Memory context: none available. State retrievalUsed=false and recommend memory capture.",
    "Return only valid JSON matching the schema. Include confidence, limitations, historical comparison, duplicate recommendations, feedback-loop quality, and mandatory safety flags. Recommendations are not execution permissions.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function parseAnalyticsOperationsJson(content: string): AnalyticsOperationalOutput {
  const trimmed = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const parsed = JSON.parse(trimmed) as unknown;
  return analyticsOperationalOutputSchema.parse(parsed);
}

export function scoreAnalyticsOutput(output: AnalyticsOperationalOutput) {
  const scoring = output.scoring;
  const average = (scoring.analyticsQualityScore + scoring.confidenceScore + scoring.evidenceScore + scoring.optimizationConfidenceScore + scoring.feedbackLoopQualityScore) / 5;
  const duplicatePenalty = Math.min(22, output.duplicateSignals.length * 4);
  const limitationPenalty = Math.min(12, output.report.limitations.length * 2);
  const lowConfidencePenalty = output.report.confidence < 60 ? 8 : 0;
  const score = Math.max(0, Math.min(100, average - duplicatePenalty - limitationPenalty - lowConfidencePenalty));
  return Number(score.toFixed(1));
}

export function analyticsOutputWarnings(output: AnalyticsOperationalOutput) {
  const warnings: string[] = [];
  if (scoreAnalyticsOutput(output) < 60) warnings.push("Analytics quality score is below the live acceptance threshold.");
  if (output.scoring.confidenceScore < 60 || output.report.confidence < 60) warnings.push("Analytics confidence is too low for operational use.");
  if (output.scoring.evidenceScore < 50) warnings.push("Evidence score is too low; use mock/internal analytics as directional only.");
  if (output.duplicateSignals.length > 5) warnings.push("Duplicate recommendation count is high; optimization may repeat prior advice.");
  if (output.optimizationRecommendations.some((item) => item.executionStatus !== "recommendation_only")) warnings.push("Optimization recommendations must remain recommendation-only.");
  if (!output.safety.noPublishing || !output.safety.needsHumanReview || !output.safety.noPlatformApiAccess || !output.safety.noAutonomousOptimization || !output.safety.noPromptMutation || !output.safety.noWorkflowMutation) warnings.push("Mandatory analytics safety flags are not all true.");
  return warnings;
}
