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

export type MediaDashboard = {
  workflows: MediaWorkflowDefinition[];
  providers: MediaProviderStatus[];
  recentAssets: MediaAssetPlan[];
  renderQueue: RenderPlan[];
  failedRenders: RenderPlan[];
  observability: {
    mode: "mock_safe";
    liveRendering: "blocked";
    gpuExecution: "blocked";
    publicPublishing: "blocked";
  };
};
