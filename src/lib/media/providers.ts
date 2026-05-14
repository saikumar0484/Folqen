import { getEnv } from "@/lib/env";
import type { MediaProviderId, MediaProviderStatus } from "./types";

function configured(value: string | undefined) {
  return Boolean(value?.trim());
}

export function getMediaProviderStatuses(source: NodeJS.ProcessEnv = process.env): MediaProviderStatus[] {
  const env = getEnv(source);
  const localWorkerConfigured = configured(env.LOCAL_WORKER_BASE_URL) && configured(env.LOCAL_WORKER_SHARED_SECRET);
  const liveThumbnailConfigured =
    localWorkerConfigured &&
    env.ALLOW_CONTROLLED_MEDIA_EXECUTION &&
    env.ALLOW_LIVE_THUMBNAIL_RENDERING &&
    env.LIVE_MEDIA_ACTIVATION_STAGE >= 1 &&
    env.LIVE_THUMBNAIL_RENDER_STAGE >= 1 &&
    !env.MEDIA_RENDER_KILL_SWITCH &&
    !env.MEDIA_RENDER_EMERGENCY_STOP;
  const comfyConfigured = configured(env.COMFYUI_BASE_URL);
  const ffmpegConfigured = configured(env.FFMPEG_PATH);

  return [
    {
      id: "mock",
      label: "Mock media planner",
      status: "Mock",
      capabilities: ["asset_plan", "workflow_preview", "render_logs", "retry_plan"],
      reason: "Default dry-run media planning. No GPU, renderer, file write, or provider call occurs.",
      liveExecutionEnabled: false,
    },
    {
      id: "comfyui",
      label: "ComfyUI",
      status: comfyConfigured ? "Blocked" : "Not connected",
      capabilities: ["text_to_image", "image_to_image", "workflow_graph"],
      reason: comfyConfigured
        ? "ComfyUI endpoint is configured, but live GPU execution remains blocked until a future approval-gated slice."
        : "ComfyUI is not connected. This slice creates only ComfyUI-ready workflow plans.",
      liveExecutionEnabled: false,
    },
    {
      id: "ffmpeg",
      label: "FFmpeg",
      status: ffmpegConfigured ? "Configured" : "Not connected",
      capabilities: ["render_plan", "subtitle_overlay", "transcode", "scene_assembly"],
      reason: ffmpegConfigured
        ? "FFmpeg path is configured, but Folqen is currently in dry-run rendering mode."
        : "FFmpeg path is missing. Rendering remains a dry-run plan.",
      liveExecutionEnabled: false,
    },
    {
      id: "local_worker",
      label: "Controlled thumbnail worker",
      status: liveThumbnailConfigured ? "Configured" : localWorkerConfigured ? "Needs approval" : "Not connected",
      capabilities: ["governed_thumbnail_rendering", "queued_rendering", "thumbnail_asset_registry", "provider_bridge"],
      reason: liveThumbnailConfigured
        ? "Worker endpoint is configured for governed thumbnail rendering only. Each render still requires approval, budget, validation, and rollback gates."
        : localWorkerConfigured
          ? "Worker endpoint is configured, but live thumbnail rendering remains approval-gated and disabled by runtime flags."
          : "No controlled thumbnail worker endpoint and shared secret are configured.",
      liveExecutionEnabled: liveThumbnailConfigured,
    },
  ];
}

export function selectMediaProvider(preferences: MediaProviderId[]) {
  const providers = getMediaProviderStatuses();
  return preferences.map((id) => providers.find((provider) => provider.id === id)).find(Boolean) ?? providers[0];
}
