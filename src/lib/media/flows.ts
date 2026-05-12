import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import { createCorrelationId } from "@/lib/orchestration/event-bus";
import { defaultMediaTypeForWorkflow, getMediaWorkflow } from "./registry";
import { selectMediaProvider } from "./providers";
import type { MediaAssetPlan, MediaGenerationInput, MediaPipelineResult, RenderPlan } from "./types";

type MediaGraphStateInput = Required<Pick<MediaGenerationInput, "workflowKind" | "objective" | "platform" | "aspectRatio" | "durationSeconds" | "tags" | "approvalRequired">> &
  Omit<MediaGenerationInput, "workflowKind" | "objective" | "platform" | "aspectRatio" | "durationSeconds" | "tags" | "approvalRequired">;

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "asset";
}

function normalizeInput(input: MediaGenerationInput): MediaGraphStateInput {
  return {
    workflowKind: input.workflowKind,
    objective: input.objective,
    mediaType: input.mediaType ?? defaultMediaTypeForWorkflow(input.workflowKind),
    contentId: input.contentId,
    sourceAssetId: input.sourceAssetId,
    platform: input.platform ?? "YOUTUBE",
    prompt: input.prompt,
    scriptText: input.scriptText,
    aspectRatio: input.aspectRatio ?? (input.platform === "YOUTUBE" ? "16:9" : "9:16"),
    durationSeconds: input.durationSeconds ?? 45,
    tags: input.tags ?? [],
    approvalRequired: input.approvalRequired ?? true,
  };
}

const MediaGraphState = Annotation.Root({
  input: Annotation<MediaGraphStateInput>({
    reducer: (_current, update) => update,
    default: () => normalizeInput({ workflowKind: "thumbnail_workflow", objective: "Plan a mystery thumbnail." }),
  }),
  graphTrace: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),
  assets: Annotation<MediaAssetPlan[]>({
    reducer: (_current, update) => update,
    default: () => [],
  }),
  renderPlan: Annotation<Omit<RenderPlan, "queueJobId"> | null>({
    reducer: (_current, update) => update,
    default: () => null,
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
    default: () => createCorrelationId("media"),
  }),
});

function buildAssets(input: MediaGraphStateInput): MediaAssetPlan[] {
  const workflow = getMediaWorkflow(input.workflowKind);
  const provider = selectMediaProvider(workflow.providerPreference);
  const base = slug(`${input.platform}-${input.workflowKind}-${input.objective}`);
  const warnings = [
    "Dry-run asset only. No GPU generation, file write, or public publishing occurred.",
    input.sourceAssetId ? "Source asset lineage is tracked through metadata." : "No source asset was provided for lineage.",
  ];

  return [
    {
      id: `asset_${base}`,
      mediaType: input.mediaType ?? workflow.mediaTypes[0],
      title: `${workflow.name}: ${input.objective.slice(0, 90)}`,
      description: input.prompt || input.scriptText || workflow.description,
      format: input.mediaType === "subtitles" ? "text/vtt" : input.mediaType === "render_output" ? "video/mp4" : "image/png",
      aspectRatio: input.aspectRatio,
      storagePath: `mock-media://${input.workflowKind}/${base}`,
      version: input.sourceAssetId ? 2 : 1,
      tags: Array.from(new Set([input.platform.toLowerCase(), input.workflowKind, ...(input.tags ?? [])])).slice(0, 12),
      status: input.approvalRequired ? "Needs approval" : "Mock",
      providerId: provider.id,
      validation: {
        safe: true,
        warnings,
      },
    },
  ];
}

function buildRenderPlan(input: MediaGraphStateInput): Omit<RenderPlan, "queueJobId"> {
  const workflow = getMediaWorkflow(input.workflowKind);
  const provider = selectMediaProvider(workflow.providerPreference);
  return {
    renderId: `render_${slug(`${input.workflowKind}-${input.objective}`)}`,
    workflowKind: input.workflowKind,
    status: "planned",
    attempts: 0,
    maxAttempts: workflow.retryable ? 3 : 1,
    providerStatus: provider,
    steps: [
      "validate_asset_inputs",
      "prepare_provider_workflow",
      "plan_scene_sequence",
      "attach_subtitle_overlay_plan",
      "queue_dry_run_render",
      "capture_observability_events",
    ],
    logs: [
      "Media pipeline ran in dry-run mode.",
      `${provider.label} status: ${provider.status}.`,
      "No GPU, FFmpeg process, ComfyUI request, storage write, or publishing call was executed.",
    ],
    retryPolicy: {
      enabled: true,
      backoffMs: 15_000,
      escalationAfterAttempts: workflow.retryable ? 3 : 1,
    },
  };
}

function createMediaGraph() {
  return new StateGraph(MediaGraphState)
    .addNode("validate_inputs", (state) => ({
      graphTrace: [`Validated ${state.input.workflowKind} for ${state.input.platform} in ${state.input.aspectRatio}.`],
      risks: state.input.objective.length < 12 ? ["Objective is short; creative direction may be weak."] : [],
    }))
    .addNode("provider_guard", (state) => {
      const workflow = getMediaWorkflow(state.input.workflowKind);
      const provider = selectMediaProvider(workflow.providerPreference);
      return {
        graphTrace: [`Provider guard selected ${provider.label}; live execution is ${provider.liveExecutionEnabled ? "enabled" : "blocked"}.`],
        risks: provider.liveExecutionEnabled ? [] : [`${provider.label} live execution is blocked or not connected.`],
      };
    })
    .addNode("asset_plan", (state) => ({
      assets: buildAssets(state.input),
      graphTrace: ["Generated mock-safe asset registry plan and version metadata."],
    }))
    .addNode("render_plan", (state) => ({
      renderPlan: buildRenderPlan(state.input),
      graphTrace: ["Generated FFmpeg/ComfyUI-ready dry-run render plan."],
      recommendations: [
        "Review asset plan before rendering or public use.",
        "Use manual posting packages until platform APIs are connected.",
        "Connect local worker and approve media execution before live rendering.",
      ],
    }))
    .addEdge(START, "validate_inputs")
    .addEdge("validate_inputs", "provider_guard")
    .addEdge("provider_guard", "asset_plan")
    .addEdge("asset_plan", "render_plan")
    .addEdge("render_plan", END)
    .compile();
}

export async function runMediaGraph(input: MediaGenerationInput): Promise<{
  input: MediaGraphStateInput;
  result: Omit<MediaPipelineResult, "queueJobId" | "eventId" | "persisted" | "createdAt"> & { graphTrace: string[] };
}> {
  const normalized = normalizeInput(input);
  const workflow = getMediaWorkflow(normalized.workflowKind);
  const graph = createMediaGraph();
  const output = await graph.invoke({ input: normalized, correlationId: createCorrelationId("media") });
  const provider = output.renderPlan?.providerStatus ?? selectMediaProvider(workflow.providerPreference);
  const status = provider.status === "Blocked" ? "blocked" : normalized.approvalRequired ? "waiting_for_approval" : "completed";
  const riskLevel = normalized.workflowKind === "rendering_workflow" || normalized.workflowKind === "script_to_scene_workflow" ? "medium" : "low";

  return {
    input: normalized,
    result: {
      runId: output.correlationId,
      workflowKind: normalized.workflowKind,
      status,
      mode: "dry_run",
      mediaType: normalized.mediaType ?? workflow.mediaTypes[0],
      providerStatus: provider,
      assets: output.assets,
      renderPlan: {
        ...(output.renderPlan ?? buildRenderPlan(normalized)),
        queueJobId: "pending_queue",
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
