import { randomUUID } from "crypto";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import { createCorrelationId } from "@/lib/orchestration/event-bus";
import { getIntelligenceWorkflow } from "./agents";
import { runMockSafeIntelligenceProvider } from "./providers";
import type {
  DraftArtifact,
  IntelligenceAgentId,
  IntelligenceDepartmentId,
  IntelligencePlatform,
  IntelligenceProviderStatus,
  IntelligenceRunInput,
  IntelligenceRunResult,
  RankedIntelligenceItem,
} from "./types";

const defaultPlatforms: IntelligencePlatform[] = ["YOUTUBE", "INSTAGRAM", "FACEBOOK"];

function normalizeInput(input: IntelligenceRunInput): Required<IntelligenceRunInput> {
  return {
    workflowKind: input.workflowKind,
    objective: input.objective,
    region: input.region?.trim() || "India",
    brandContext: input.brandContext?.trim() || "Urban legends / mystery / folklore",
    platforms: input.platforms?.length ? input.platforms : defaultPlatforms,
    seedTopics: input.seedTopics?.filter(Boolean) ?? [],
    competitors: input.competitors?.filter(Boolean) ?? [],
    audienceNotes: input.audienceNotes?.filter(Boolean) ?? [],
    sourceReferences: input.sourceReferences?.filter(Boolean) ?? [],
    approvalRequired: input.approvalRequired ?? true,
    providerId: input.providerId ?? "mock",
  };
}

function topicSeeds(input: Required<IntelligenceRunInput>) {
  const seeds = input.seedTopics.length > 0 ? input.seedTopics : ["haunted fort mystery", "regional folklore legend", "cursed object story"];
  return seeds.slice(0, 5);
}

function scoreFor(index: number, base = 88) {
  return Math.max(61, base - index * 7);
}

function riskFor(title: string): "low" | "medium" | "high" {
  if (/tragedy|crime|death|real victim/i.test(title)) return "high";
  if (/haunted|curse|ritual|spirit/i.test(title)) return "medium";
  return "low";
}

function buildRankedItems(input: Required<IntelligenceRunInput>): RankedIntelligenceItem[] {
  const seeds = topicSeeds(input);
  const prefixByKind: Record<string, string> = {
    trend_discovery: "Trend signal",
    competitor_analysis: "Competitor pattern",
    viral_opportunity: "Viral opportunity",
    topic_selection: "Selected topic",
    hook_optimization: "Hook angle",
    script_generation: "Script concept",
    thumbnail_planning: "Thumbnail concept",
    metadata_optimization: "Metadata angle",
  };

  return seeds.map((topic, index) => ({
    id: `ranked_${index + 1}_${topic.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "topic"}`,
    title: `${prefixByKind[input.workflowKind]}: ${topic}`,
    score: scoreFor(index, input.workflowKind === "viral_opportunity" ? 92 : 88),
    rationale: `Strong fit for ${input.brandContext} in ${input.region}; based on manual seed inputs and mock-safe scoring.`,
    platformFit: input.platforms.slice(0, 3),
    risk: riskFor(topic),
  }));
}

function buildRecommendations(input: Required<IntelligenceRunInput>, rankedItems: RankedIntelligenceItem[]) {
  const top = rankedItems[0]?.title ?? "the strongest seed topic";
  const competitorNote = input.competitors.length > 0 ? `Compare against ${input.competitors.slice(0, 2).join(", ")} before final scripting.` : "Add competitor examples before moving to live benchmarking.";

  return [
    `Prioritize ${top} for the next draft package.`,
    "Keep claims framed as folklore unless a reliable source is attached.",
    "Create manual posting packages until platform APIs are configured.",
    competitorNote,
  ];
}

function buildArtifacts(input: Required<IntelligenceRunInput>, rankedItems: RankedIntelligenceItem[]): DraftArtifact[] {
  const topTopic = rankedItems[0]?.title.replace(/^[^:]+:\s*/, "") ?? input.objective;
  const commonStatus = input.approvalRequired ? "Needs approval" : "Mock";

  if (input.workflowKind === "script_generation") {
    return [
      {
        type: "script",
        title: `Draft script: ${topTopic}`,
        body: `Cold open with a question about ${topTopic}. Separate documented context from local legend. Close with a viewer question and a safety note.`,
        status: commonStatus,
      },
      {
        type: "hook",
        title: "Opening hook",
        body: `What if the most repeated story about ${topTopic} is hiding a much older local legend?`,
        status: commonStatus,
      },
    ];
  }

  if (input.workflowKind === "thumbnail_planning") {
    return [
      {
        type: "thumbnail_plan",
        title: `Thumbnail plan: ${topTopic}`,
        body: "Dark documentary frame, one clear focal object/location, neon green short title, no fake gore or misleading real-person imagery.",
        status: commonStatus,
      },
    ];
  }

  if (input.workflowKind === "metadata_optimization") {
    return [
      {
        type: "metadata",
        title: `Metadata pack: ${topTopic}`,
        body: `Title: The legend behind ${topTopic}. Tags: folklore, mystery, urban legends, India mystery. Description should label folklore as legend.`,
        status: commonStatus,
      },
      {
        type: "caption",
        title: "Caption draft",
        body: `Locals still talk about ${topTopic}. Folklore is not proof, but the story is hard to ignore. What have you heard?`,
        status: commonStatus,
      },
    ];
  }

  if (input.workflowKind === "hook_optimization") {
    return [
      {
        type: "hook",
        title: `Hook variants: ${topTopic}`,
        body: `1. Why do people still whisper about ${topTopic}? 2. This legend starts with one detail most people miss. 3. The story sounds impossible until you hear the local version.`,
        status: commonStatus,
      },
    ];
  }

  if (input.workflowKind === "topic_selection") {
    return [
      {
        type: "topic",
        title: `Topic selection brief: ${topTopic}`,
        body: `Recommended as a draft-only topic because it has strong mystery appeal and manageable sourcing risk.`,
        status: commonStatus,
      },
    ];
  }

  return [
    {
      type: "research_summary",
      title: `Research summary: ${topTopic}`,
      body: `Mock-safe intelligence summary based on manual topics, competitor names, audience notes, and source references. No public web fetch was performed.`,
      status: "Mock",
    },
  ];
}

function buildRisks(input: Required<IntelligenceRunInput>, rankedItems: RankedIntelligenceItem[]) {
  const risks = [
    "No live scraping, public API, or paid AI provider was used.",
    "Human review is required before public publishing or paid execution.",
  ];

  if (rankedItems.some((item) => item.risk === "high")) {
    risks.push("At least one topic has sensitive-topic risk and should be reviewed before scripting.");
  }

  if (input.sourceReferences.length === 0) {
    risks.push("No source references were provided; research confidence is capped.");
  }

  return risks;
}

const IntelligenceGraphState = Annotation.Root({
  input: Annotation<Required<IntelligenceRunInput>>({
    reducer: (_current, update) => update,
    default: () => normalizeInput({ workflowKind: "trend_discovery", objective: "Discover safe folklore opportunities." }),
  }),
  departmentId: Annotation<IntelligenceDepartmentId>({
    reducer: (_current, update) => update,
    default: () => "research",
  }),
  assignedAgents: Annotation<IntelligenceAgentId[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),
  providerStatus: Annotation<IntelligenceProviderStatus | null>({
    reducer: (_current, update) => update,
    default: () => null,
  }),
  rankedItems: Annotation<RankedIntelligenceItem[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),
  recommendations: Annotation<string[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),
  draftArtifacts: Annotation<DraftArtifact[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),
  risks: Annotation<string[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),
  confidence: Annotation<number>({
    reducer: (_current, update) => update,
    default: () => 0.72,
  }),
  graphTrace: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),
  blocked: Annotation<boolean>({
    reducer: (_current, update) => update,
    default: () => false,
  }),
  correlationId: Annotation<string>({
    reducer: (_current, update) => update,
    default: () => createCorrelationId("intel"),
  }),
});

function createIntelligenceGraph() {
  return new StateGraph(IntelligenceGraphState)
    .addNode("validate_and_route", (state) => {
      const workflow = getIntelligenceWorkflow(state.input.workflowKind);
      return {
        departmentId: workflow?.departmentId ?? "research",
        assignedAgents: workflow?.ownerAgentIds ?? [],
        graphTrace: [`Validated ${state.input.workflowKind} and routed to ${workflow?.departmentId ?? "research"}.`],
      };
    })
    .addNode("provider_guard", async (state) => {
      const provider = await runMockSafeIntelligenceProvider(state.input);
      return {
        providerStatus: provider.providerStatus,
        blocked: !provider.ok,
        graphTrace: [provider.message],
      };
    })
    .addNode("mock_intelligence", (state) => {
      if (state.blocked) {
        return {
          rankedItems: [],
          recommendations: ["Provider execution blocked. Switch to the mock provider or request approval in a future slice."],
          draftArtifacts: [],
          risks: ["Requested provider is not available for safe execution."],
          confidence: 0,
          graphTrace: ["Stopped before generation because provider guard blocked execution."],
        };
      }

      const rankedItems = buildRankedItems(state.input);
      return {
        rankedItems,
        recommendations: buildRecommendations(state.input, rankedItems),
        draftArtifacts: buildArtifacts(state.input, rankedItems),
        risks: buildRisks(state.input, rankedItems),
        confidence: state.input.sourceReferences.length > 0 ? 0.86 : 0.74,
        graphTrace: ["Generated deterministic mock-safe intelligence output."],
      };
    })
    .addNode("approval_checkpoint", (state) => ({
      graphTrace: [
        state.input.approvalRequired
          ? "Approval checkpoint attached for review before public, paid, or publishing-adjacent use."
          : "Approval checkpoint marked as not required for this internal dry run.",
      ],
    }))
    .addEdge(START, "validate_and_route")
    .addEdge("validate_and_route", "provider_guard")
    .addEdge("provider_guard", "mock_intelligence")
    .addEdge("mock_intelligence", "approval_checkpoint")
    .addEdge("approval_checkpoint", END)
    .compile();
}

export async function runIntelligenceGraph(input: IntelligenceRunInput) {
  const normalized = normalizeInput(input);
  const graph = createIntelligenceGraph();
  const graphResult = await graph.invoke({
    input: normalized,
    correlationId: createCorrelationId("intel"),
  });
  const workflow = getIntelligenceWorkflow(normalized.workflowKind);
  const runId = `intel_${randomUUID()}`;
  const blocked = graphResult.blocked || graphResult.providerStatus?.status === "Blocked";
  const status = blocked ? "blocked" : normalized.approvalRequired ? "waiting_for_approval" : "completed";

  const result: Omit<IntelligenceRunResult, "queueJobId" | "memoryCaptureStatus" | "createdAt"> = {
    runId,
    workflowKind: normalized.workflowKind,
    departmentId: workflow?.departmentId ?? graphResult.departmentId,
    status,
    assignedAgents: graphResult.assignedAgents,
    rankedItems: graphResult.rankedItems,
    recommendations: graphResult.recommendations,
    draftArtifacts: graphResult.draftArtifacts,
    confidence: graphResult.confidence,
    risks: graphResult.risks,
    approvalCheckpoint: {
      id: `approval_${runId}`,
      status: normalized.approvalRequired && !blocked ? "pending" : "not_required",
      reason: workflow?.approvalReason ?? "Human review is required before risky actions.",
      riskLevel: normalized.workflowKind === "script_generation" || normalized.workflowKind === "metadata_optimization" ? "medium" : "low",
    },
    providerStatus: graphResult.providerStatus ?? (await runMockSafeIntelligenceProvider(normalized)).providerStatus,
    graphTrace: graphResult.graphTrace,
  };

  return { input: normalized, result };
}
