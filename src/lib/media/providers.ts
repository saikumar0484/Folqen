import { getEnv } from "@/lib/env";
import type { MediaProviderId, MediaProviderStatus } from "./types";

function configured(value: string | undefined) {
  return Boolean(value?.trim());
}

export function getMediaProviderStatuses(source: NodeJS.ProcessEnv = process.env): MediaProviderStatus[] {
  const env = getEnv(source);
  const localWorkerConfigured = configured(env.LOCAL_WORKER_BASE_URL) && configured(env.LOCAL_WORKER_SHARED_SECRET);
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
      label: "Local/Oracle media worker",
      status: localWorkerConfigured ? "Blocked" : "Not connected",
      capabilities: ["queued_rendering", "heavy_media_jobs", "provider_bridge"],
      reason: localWorkerConfigured
        ? "Worker endpoint is configured, but live media execution is still blocked by safety policy."
        : "No media worker endpoint and shared secret are configured.",
      liveExecutionEnabled: false,
    },
  ];
}

export function selectMediaProvider(preferences: MediaProviderId[]) {
  const providers = getMediaProviderStatuses();
  return preferences.map((id) => providers.find((provider) => provider.id === id)).find(Boolean) ?? providers[0];
}
