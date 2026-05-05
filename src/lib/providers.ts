export type ProviderStatus =
  | "not_connected"
  | "configured"
  | "testing"
  | "live"
  | "failed"
  | "disabled"
  | "deprecated"
  | "needs_attention";

export type ProviderCapability =
  | "text_generation"
  | "structured_output"
  | "vision"
  | "image_understanding"
  | "text_to_image"
  | "image_to_image"
  | "text_to_video"
  | "image_to_video"
  | "voice_generation"
  | "transcription"
  | "captions"
  | "rendering"
  | "workflow_trigger"
  | "upload_video"
  | "schedule_post"
  | "analytics_read"
  | "comment_read"
  | "browser_control"
  | "local_execution"
  | "storage";

export type ProviderRegistryItem = {
  id: string;
  name: string;
  type:
    | "llm"
    | "image"
    | "video"
    | "voice"
    | "transcription"
    | "caption"
    | "render"
    | "workflow"
    | "publishing"
    | "analytics"
    | "storage"
    | "notification"
    | "auth"
    | "vector_memory"
    | "browser_automation";
  status: ProviderStatus;
  version: string;
  capabilities: ProviderCapability[];
  costModel: "free" | "local" | "paid" | "unknown";
  rateLimit: string;
  commercialUse: "allowed" | "restricted" | "unknown";
  setupState: "missing_config" | "ready_to_test" | "manual_only";
  fallback: string;
};

export const defaultProviderRegistry: ProviderRegistryItem[] = [
  {
    id: "n8n-local",
    name: "n8n self-hosted",
    type: "workflow",
    status: "not_connected",
    version: "placeholder",
    capabilities: ["workflow_trigger"],
    costModel: "local",
    rateLimit: "Depends on self-hosted instance",
    commercialUse: "allowed",
    setupState: "missing_config",
    fallback: "Create manual workflow instructions and posting packages.",
  },
  {
    id: "ffmpeg-local",
    name: "FFmpeg local render",
    type: "render",
    status: "not_connected",
    version: "placeholder",
    capabilities: ["rendering", "local_execution"],
    costModel: "local",
    rateLimit: "Depends on local CPU/GPU",
    commercialUse: "allowed",
    setupState: "missing_config",
    fallback: "Keep assets as draft files and mark renders as not connected.",
  },
  {
    id: "comfyui-local",
    name: "ComfyUI local image workflow",
    type: "image",
    status: "not_connected",
    version: "placeholder",
    capabilities: ["text_to_image", "image_to_image", "local_execution"],
    costModel: "local",
    rateLimit: "Depends on local hardware",
    commercialUse: "unknown",
    setupState: "missing_config",
    fallback: "Store prompt packages for manual generation.",
  },
];
