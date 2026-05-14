import { z } from "zod";

export const LIVE_RESEARCH_IDEATION_CAPABILITY = "gemini_research_content_ideation" as const;

export const researchIdeationOutputSchema = z.object({
  summary: z.string().min(12).max(1200),
  trendInsights: z
    .array(
      z.object({
        trend: z.string().min(3).max(180),
        signalType: z.enum(["cultural", "platform", "audience", "competitor", "seasonal", "format"]),
        relevanceScore: z.number().min(0).max(100),
        rationale: z.string().min(8).max(600),
      }),
    )
    .min(1)
    .max(8),
  topicSuggestions: z
    .array(
      z.object({
        topic: z.string().min(3).max(180),
        angle: z.string().min(8).max(500),
        hook: z.string().min(8).max(240),
        platformFit: z.array(z.enum(["YOUTUBE", "INSTAGRAM", "FACEBOOK", "SNAPCHAT", "THREADS"])).min(1).max(5),
        confidence: z.number().min(0).max(100),
        safetyNotes: z.string().min(3).max(500),
      }),
    )
    .min(1)
    .max(10),
  strategicRecommendations: z.array(z.string().min(8).max(500)).min(1).max(8),
  risks: z.array(z.string().min(3).max(400)).min(1).max(8),
  followUpResearch: z.array(z.string().min(3).max(300)).min(1).max(8),
  safety: z.object({
    noPublishing: z.literal(true),
    needsHumanReview: z.literal(true),
    sourceVerificationRequired: z.literal(true),
  }),
});

export type ResearchIdeationOutput = z.infer<typeof researchIdeationOutputSchema>;

export const researchIdeationResponseJsonSchema = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING", description: "Concise research intelligence summary." },
    trendInsights: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          trend: { type: "STRING" },
          signalType: { type: "STRING", enum: ["cultural", "platform", "audience", "competitor", "seasonal", "format"] },
          relevanceScore: { type: "NUMBER" },
          rationale: { type: "STRING" },
        },
        required: ["trend", "signalType", "relevanceScore", "rationale"],
      },
    },
    topicSuggestions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          topic: { type: "STRING" },
          angle: { type: "STRING" },
          hook: { type: "STRING" },
          platformFit: { type: "ARRAY", items: { type: "STRING", enum: ["YOUTUBE", "INSTAGRAM", "FACEBOOK", "SNAPCHAT", "THREADS"] } },
          confidence: { type: "NUMBER" },
          safetyNotes: { type: "STRING" },
        },
        required: ["topic", "angle", "hook", "platformFit", "confidence", "safetyNotes"],
      },
    },
    strategicRecommendations: { type: "ARRAY", items: { type: "STRING" } },
    risks: { type: "ARRAY", items: { type: "STRING" } },
    followUpResearch: { type: "ARRAY", items: { type: "STRING" } },
    safety: {
      type: "OBJECT",
      properties: {
        noPublishing: { type: "BOOLEAN" },
        needsHumanReview: { type: "BOOLEAN" },
        sourceVerificationRequired: { type: "BOOLEAN" },
      },
      required: ["noPublishing", "needsHumanReview", "sourceVerificationRequired"],
    },
  },
  required: ["summary", "trendInsights", "topicSuggestions", "strategicRecommendations", "risks", "followUpResearch", "safety"],
} as const;

export function buildResearchIdeationSystemPrompt() {
  return [
    "You are Folqen's Research Department trend intelligence agent.",
    "Operate only on manual/user-provided context and general reasoning. Do not claim live web scraping, platform API reads, publishing, rendering, or account access.",
    "Create structured content ideation for an India-based Urban Legends / Mystery / Folklore creator brand.",
    "Every suggestion is draft intelligence only and must require human review, source verification, and no publishing.",
    "Avoid graphic exploitation of real tragedies, copyrighted modern horror retellings, celebrity likeness/voice misuse, and claims presented as verified fact without sources.",
  ].join("\n");
}

export function buildResearchIdeationPrompt(input: {
  objective: string;
  prompt?: string;
}) {
  return [
    `Objective: ${input.objective}`,
    input.prompt ? `Operator context: ${input.prompt}` : undefined,
    "Return only valid JSON matching the response schema. Include platform-fit suggestions for YouTube, Instagram, Facebook, Snapchat, and Threads where appropriate.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function parseResearchIdeationJson(content: string): ResearchIdeationOutput {
  const trimmed = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const parsed = JSON.parse(trimmed) as unknown;
  return researchIdeationOutputSchema.parse(parsed);
}
