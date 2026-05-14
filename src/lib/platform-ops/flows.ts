import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import { createCorrelationId } from "@/lib/orchestration/event-bus";
import { getPlatformProfile, getPublishingWorkflow } from "./registry";
import { getPlatformProviderStatuses, selectPlatformProvider } from "./providers";
import type { DeploymentPlan, PlatformAdaptation, PlatformOperationInput, PlatformOperationResult, PlatformOpsPlatform } from "./types";

type NormalizedPlatformInput = Required<Pick<PlatformOperationInput, "workflowKind" | "objective" | "platforms" | "hashtags" | "approvalRequired">> &
  Omit<PlatformOperationInput, "workflowKind" | "objective" | "platforms" | "hashtags" | "approvalRequired">;

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "deployment";
}

function normalizeInput(input: PlatformOperationInput): NormalizedPlatformInput {
  return {
    workflowKind: input.workflowKind,
    objective: input.objective,
    contentId: input.contentId,
    title: input.title,
    caption: input.caption,
    description: input.description,
    hashtags: input.hashtags ?? ["urbanlegends", "mystery", "folklore"],
    platforms: input.platforms?.length ? input.platforms : ["YOUTUBE", "INSTAGRAM", "THREADS"],
    scheduledAt: input.scheduledAt,
    assetIds: input.assetIds,
    approvalRequired: input.approvalRequired ?? true,
  };
}

function trimText(value: string, max: number) {
  return value.length <= max ? value : `${value.slice(0, Math.max(0, max - 1))}...`;
}

function buildHashtags(platform: PlatformOpsPlatform, requested: string[]) {
  const profile = getPlatformProfile(platform);
  const core = ["folklore", "mystery", "urbanlegends"];
  return Array.from(new Set([...requested, ...core]))
    .map((tag) => tag.replace(/^#/, "").replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())
    .filter(Boolean)
    .slice(0, profile.hashtagLimit);
}

function buildAdaptations(input: NormalizedPlatformInput): PlatformAdaptation[] {
  return input.platforms.map((platform) => {
    const profile = getPlatformProfile(platform);
    const hashtags = buildHashtags(platform, input.hashtags);
    const baseTitle = input.title ?? input.objective;
    const title = trimText(platform === "X_TWITTER" ? `${baseTitle}: thread hook` : baseTitle, profile.maxTitleLength);
    const captionBase = input.caption ?? `A source-safe mystery post package for ${profile.label}: ${input.objective}`;
    const caption = trimText(`${captionBase}\n\n${hashtags.map((tag) => `#${tag}`).join(" ")}`, profile.maxCaptionLength);
    const aspectRatio = profile.defaultAspectRatios[0];

    return {
      platform,
      title,
      caption,
      hashtags,
      aspectRatio,
      metadata: {
        description: trimText(input.description ?? `Folqen manual posting package for ${profile.label}.`, 500),
        visibility: input.approvalRequired ? "manual_package_only" : "private_draft",
        category: "Urban Legends / Mystery / Folklore",
        region: platform === "TIKTOK" ? "Global" : "India",
        template: `${profile.label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_mock_distribution_template`,
      },
      checks: {
        titleLength: title.length,
        captionLength: caption.length,
        hashtagCount: hashtags.length,
        policy: platform === "TIKTOK" ? "Blocked" : "Needs approval",
        publishing: "Blocked",
      },
    };
  });
}

function buildDeploymentPlans(input: NormalizedPlatformInput, adaptations: PlatformAdaptation[]): Omit<DeploymentPlan, "queueJobId">[] {
  const scheduledAt = input.scheduledAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const workflow = getPublishingWorkflow(input.workflowKind);
  return adaptations.map((adaptation) => ({
    deploymentId: `deploy_${slug(`${adaptation.platform}-${input.workflowKind}-${input.objective}`)}`,
    platform: adaptation.platform,
    status: input.workflowKind === "analytics_collection" || input.workflowKind === "engagement_monitoring" ? "analytics_pending" : input.approvalRequired ? "blocked_needs_approval" : "queued_mock",
    queueJobId: "pending_queue",
    scheduledAt,
    retryPolicy: {
      enabled: true,
      maxAttempts: workflow.retryable ? 3 : 1,
      backoffMs: 20_000,
      escalationAfterAttempts: workflow.retryable ? 3 : 1,
    },
    recoverySteps: [
      "verify_content_review_status",
      "verify_human_approval",
      "switch_to_manual_package_when_api_missing",
      "record_platform_event",
      "escalate_policy_or_copyright_warning",
    ],
    logs: [
      "Publishing plan created in dry-run mode.",
      "No public post, credential use, browser automation, scraping, or platform API call occurred.",
      adaptation.platform === "TIKTOK" ? "TikTok is a requested placeholder only and is not part of the India-first dependency plan." : `${adaptation.platform} deployment remains manual-package only.`,
    ],
  }));
}

const PlatformGraphState = Annotation.Root({
  input: Annotation<NormalizedPlatformInput>({
    reducer: (_current, update) => update,
    default: () => normalizeInput({ workflowKind: "platform_adaptation", objective: "Adapt a mystery post." }),
  }),
  graphTrace: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),
  adaptations: Annotation<PlatformAdaptation[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),
  deployments: Annotation<Omit<DeploymentPlan, "queueJobId">[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),
  risks: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),
  recommendations: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),
  correlationId: Annotation<string>({
    reducer: (_current, update) => update,
    default: () => createCorrelationId("platform"),
  }),
});

function createPlatformGraph() {
  return new StateGraph(PlatformGraphState)
    .addNode("validate_input", (state) => ({
      graphTrace: [`Validated ${state.input.workflowKind} for ${state.input.platforms.join(", ")}.`],
      risks: state.input.objective.length < 12 ? ["Objective is short; distribution strategy may be weak."] : [],
    }))
    .addNode("provider_guard", (state) => {
      const providers = getPlatformProviderStatuses();
      const blocked = state.input.platforms
        .map((platform) => getPlatformProfile(platform))
        .map((profile) => providers.find((provider) => provider.id === profile.apiProviderId))
        .filter((provider) => provider?.status !== "Mock");
      return {
        graphTrace: ["Checked platform API providers and n8n publishing bridge."],
        risks: [
          "Public publishing is blocked by safety settings.",
          ...blocked.map((provider) => `${provider?.label ?? "Platform provider"} is ${provider?.status ?? "Not connected"}.`),
        ],
      };
    })
    .addNode("adapt_platforms", (state) => ({
      adaptations: buildAdaptations(state.input),
      graphTrace: ["Generated platform-specific titles, captions, hashtags, aspect ratios, metadata, and templates."],
    }))
    .addNode("deployment_plan", (state) => ({
      deployments: buildDeploymentPlans(state.input, state.adaptations),
      graphTrace: ["Created publishing queue, scheduling, retry, recovery, analytics, and monetization monitoring plans."],
      recommendations: [
        "Use manual posting packages until official platform adapters are connected.",
        "Require human approval before scheduling or publishing-adjacent actions.",
        "Connect analytics as read-only before enabling optimization loops.",
      ],
    }))
    .addEdge(START, "validate_input")
    .addEdge("validate_input", "provider_guard")
    .addEdge("provider_guard", "adapt_platforms")
    .addEdge("adapt_platforms", "deployment_plan")
    .addEdge("deployment_plan", END)
    .compile();
}

export async function runPlatformOpsGraph(input: PlatformOperationInput): Promise<{
  input: NormalizedPlatformInput;
  result: Omit<PlatformOperationResult, "queueJobIds" | "eventId" | "persisted" | "createdAt"> & { graphTrace: string[] };
}> {
  const normalized = normalizeInput(input);
  const workflow = getPublishingWorkflow(normalized.workflowKind);
  const graph = createPlatformGraph();
  const output = await graph.invoke({ input: normalized, correlationId: createCorrelationId("platform") });
  const provider = selectPlatformProvider(["mock", "n8n"]);
  const blockedPlatforms = normalized.platforms.filter((platform) => platform === "TIKTOK");
  const riskLevel = normalized.workflowKind.includes("recovery") || normalized.workflowKind === "multi_platform_distribution" ? "high" : "medium";

  return {
    input: normalized,
    result: {
      runId: output.correlationId,
      workflowKind: normalized.workflowKind,
      status: blockedPlatforms.length > 0 ? "blocked" : normalized.approvalRequired ? "waiting_for_approval" : "completed_mock",
      mode: "dry_run",
      platforms: normalized.platforms,
      providerStatus: provider,
      adaptations: output.adaptations,
      deployments: output.deployments.map((deployment) => ({ ...deployment, queueJobId: "pending_queue" })),
      analyticsPlan: {
        metrics: ["views", "ctr", "retention", "engagement", "followers", "watch_time"],
        status: "Mock",
        source: "manual_import",
        notes: ["No platform analytics API was called.", "Future ingestion should map metrics to workflow run and content IDs."],
      },
      monetizationMonitor: {
        status: "Mock",
        copyrightIncidents: "manual_review_required",
        platformWarnings: "manual_review_required",
        strikeMonitoring: "not_connected",
        policyMonitoring: "mock_watchlist",
      },
      recommendations: output.recommendations,
      risks: output.risks,
      approvalCheckpoint: {
        id: `approval_${output.correlationId}`,
        status: normalized.approvalRequired ? "pending" : "not_required",
        reason: workflow.approvalReason,
        riskLevel,
      },
      graphTrace: output.graphTrace,
    },
  };
}
