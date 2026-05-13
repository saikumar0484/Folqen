export type MediaStatusLabel = "Mock" | "Not connected" | "Needs approval" | "Configured" | "Blocked";

export type MediaType =
  | "thumbnail"
  | "shorts_visual"
  | "video_clip"
  | "subtitles"
  | "cover_image"
  | "platform_variant"
  | "asset_template"
  | "render_output";

export type MediaWorkflowKind =
  | "thumbnail_workflow"
  | "shorts_visual_workflow"
  | "script_to_scene_workflow"
  | "asset_adaptation_workflow"
  | "rendering_workflow"
  | "subtitle_workflow"
  | "asset_optimization_workflow";

export type MediaProviderId = "mock" | "comfyui" | "ffmpeg" | "local_worker";

export type MediaProviderStatus = {
  id: MediaProviderId;
  label: string;
  status: MediaStatusLabel;
  capabilities: string[];
  reason: string;
  liveExecutionEnabled: false;
};

export type ControlledMediaWorkflowKind =
  | "live_thumbnail_rendering"
  | "structured_image_generation"
  | "subtitle_rendering"
  | "asset_validation"
  | "render_quality_scoring"
  | "asset_reflection"
  | "creative_asset_registry_integration"
  | "render_recovery";

export const controlledMediaWorkflowKinds = [
  "live_thumbnail_rendering",
  "structured_image_generation",
  "subtitle_rendering",
  "asset_validation",
  "render_quality_scoring",
  "asset_reflection",
  "creative_asset_registry_integration",
  "render_recovery",
] as const satisfies readonly ControlledMediaWorkflowKind[];

export const controlledMediaWorkflowLabels: Record<ControlledMediaWorkflowKind, string> = {
  live_thumbnail_rendering: "Live Thumbnail Rendering",
  structured_image_generation: "Structured Image Generation",
  subtitle_rendering: "Subtitle Rendering",
  asset_validation: "Asset Validation",
  render_quality_scoring: "Render Quality Scoring",
  asset_reflection: "Asset Reflection",
  creative_asset_registry_integration: "Creative Asset Registry Integration",
  render_recovery: "Render Recovery",
};

export type ControlledRenderQuota = {
  maxDailyRuns: number;
  maxConcurrency: number;
  maxRenderSeconds: number;
  maxEstimatedGpuMinutes: number;
  maxQueueDepth: number;
  maxAttempts: 1;
};

export type ControlledRenderUsage = {
  runsToday: number;
  activeRuns: number;
  estimatedGpuMinutesToday: number;
  failedRunsToday: number;
};

export type RenderGovernanceDecision = {
  allowed: boolean;
  status: "allowed" | "blocked" | "needs_approval" | "sandbox_fallback" | "kill_switch" | "budget_blocked" | "not_connected";
  reasons: string[];
  controls: string[];
  quota: ControlledRenderQuota & ControlledRenderUsage;
};

export type MediaWorkflowDefinition = {
  kind: MediaWorkflowKind;
  name: string;
  description: string;
  mediaTypes: MediaType[];
  providerPreference: MediaProviderId[];
  approvalReason: string;
  retryable: boolean;
};

export type MediaGenerationInput = {
  workflowKind: MediaWorkflowKind;
  objective: string;
  mediaType?: MediaType;
  contentId?: string;
  sourceAssetId?: string;
  platform?: "YOUTUBE" | "INSTAGRAM" | "FACEBOOK" | "SNAPCHAT" | "THREADS";
  prompt?: string;
  scriptText?: string;
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:5";
  durationSeconds?: number;
  tags?: string[];
  approvalRequired?: boolean;
};

export type MediaAssetPlan = {
  id: string;
  mediaType: MediaType;
  title: string;
  description: string;
  format: string;
  aspectRatio: string;
  storagePath: string;
  version: number;
  tags: string[];
  status: MediaStatusLabel;
  providerId: MediaProviderId;
  validation: {
    safe: boolean;
    warnings: string[];
  };
};

export type AssetValidationReport = {
  status: "passed" | "warning" | "failed";
  malformedAsset: boolean;
  failedRender: boolean;
  lowQuality: boolean;
  duplicateRisk: boolean;
  unsafeAsset: boolean;
  warnings: string[];
};

export type RenderQualityScore = {
  qualityScore: number;
  promptFitScore: number;
  safetyScore: number;
  formatScore: number;
  uniquenessScore: number;
  acceptance: "accepted" | "needs_review" | "rejected";
};

export type RenderPlan = {
  renderId: string;
  workflowKind: MediaWorkflowKind;
  status: "planned" | "queued" | "failed_recoverable";
  queueJobId: string;
  attempts: number;
  maxAttempts: number;
  providerStatus: MediaProviderStatus;
  steps: string[];
  logs: string[];
  retryPolicy: {
    enabled: true;
    backoffMs: number;
    escalationAfterAttempts: number;
  };
};

export type MediaPipelineResult = {
  runId: string;
  workflowKind: MediaWorkflowKind;
  status: "completed" | "waiting_for_approval" | "blocked";
  mode: "dry_run";
  mediaType: MediaType;
  providerStatus: MediaProviderStatus;
  assets: MediaAssetPlan[];
  renderPlan: RenderPlan;
  recommendations: string[];
  risks: string[];
  approvalCheckpoint: {
    id: string;
    status: "pending" | "not_required";
    reason: string;
    riskLevel: "low" | "medium" | "high";
  };
  queueJobId: string;
  eventId?: string;
  persisted: boolean;
  createdAt: string;
};

export type ControlledRenderResult = {
  runId: string;
  workflowKind: ControlledMediaWorkflowKind;
  status: "blocked" | "waiting_for_approval" | "completed_sandbox" | "failed";
  mode: "blocked" | "sandbox";
  providerId: MediaProviderId;
  providerStatus: MediaProviderStatus;
  governance: RenderGovernanceDecision;
  approvalVerification: {
    verified: boolean;
    status: "approved" | "pending" | "rejected" | "expired" | "missing" | "unavailable";
    approvalId?: string;
    reason: string;
  };
  queueJobId: string;
  asset: MediaAssetPlan;
  renderPlan: RenderPlan;
  validation: AssetValidationReport;
  scoring: RenderQualityScore;
  observability: {
    trace: string[];
    queueLatencyMs: number;
    renderDurationEstimateSeconds: number;
    estimatedGpuMinutes: number;
    budgetUtilizationPercent: number;
  };
  rollback: {
    available: true;
    steps: string[];
  };
  safety: {
    noPublishing: true;
    noAutonomousRetries: true;
    noUnrestrictedGpu: true;
    noVideoGeneration: true;
    noWorkflowMutation: true;
  };
  persisted: boolean;
  createdAt: string;
};

export type MediaDashboard = {
  workflows: MediaWorkflowDefinition[];
  providers: MediaProviderStatus[];
  recentAssets: MediaAssetPlan[];
  renderQueue: RenderPlan[];
  failedRenders: RenderPlan[];
  controlledRenders?: ControlledRenderResult[];
  renderGovernance?: RenderGovernanceDecision;
  observability: {
    mode: "mock_safe";
    liveRendering: "blocked";
    gpuExecution: "blocked";
    publicPublishing: "blocked";
  };
};
