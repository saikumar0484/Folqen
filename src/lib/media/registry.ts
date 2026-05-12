import type { MediaType, MediaWorkflowDefinition, MediaWorkflowKind } from "./types";

export const mediaTypes: Array<{ id: MediaType; label: string; description: string }> = [
  { id: "thumbnail", label: "Thumbnails", description: "High-CTR visual concepts and generated thumbnail plans." },
  { id: "shorts_visual", label: "Shorts visuals", description: "Vertical scene visuals for short-form mystery videos." },
  { id: "video_clip", label: "Video clips", description: "Future generated or assembled video segments." },
  { id: "subtitles", label: "Captions/subtitles", description: "SRT/VTT-ready subtitle plans and overlay instructions." },
  { id: "cover_image", label: "Cover images", description: "Platform covers, post images, and story covers." },
  { id: "platform_variant", label: "Platform variants", description: "Media variants adapted by aspect ratio and platform constraints." },
  { id: "asset_template", label: "Asset templates", description: "Reusable creative layouts, prompt skeletons, and style packs." },
  { id: "render_output", label: "Render outputs", description: "Dry-run output placeholders and future rendered files." },
];

export const mediaWorkflows: MediaWorkflowDefinition[] = [
  {
    kind: "thumbnail_workflow",
    name: "Thumbnail Workflow",
    description: "Plan a ComfyUI-ready thumbnail concept, prompt, layout, and validation checklist.",
    mediaTypes: ["thumbnail", "cover_image"],
    providerPreference: ["comfyui", "mock"],
    approvalReason: "Generated thumbnails require review before public use.",
    retryable: true,
  },
  {
    kind: "shorts_visual_workflow",
    name: "Shorts Visual Workflow",
    description: "Turn a short-form mystery concept into a vertical visual package and scene art plan.",
    mediaTypes: ["shorts_visual", "asset_template"],
    providerPreference: ["comfyui", "mock"],
    approvalReason: "AI visuals require review for safety, copyright, and brand fit.",
    retryable: true,
  },
  {
    kind: "script_to_scene_workflow",
    name: "Script-to-Scene Workflow",
    description: "Break a script into scenes, shot notes, visual prompts, subtitle beats, and assembly instructions.",
    mediaTypes: ["shorts_visual", "video_clip", "subtitles"],
    providerPreference: ["mock", "ffmpeg"],
    approvalReason: "Scene sequencing can affect editorial claims and needs review.",
    retryable: true,
  },
  {
    kind: "asset_adaptation_workflow",
    name: "Asset Adaptation Workflow",
    description: "Adapt an existing asset into platform-specific aspect ratios and metadata packages.",
    mediaTypes: ["platform_variant", "thumbnail", "cover_image"],
    providerPreference: ["ffmpeg", "mock"],
    approvalReason: "Platform variants must be checked before publishing packages.",
    retryable: true,
  },
  {
    kind: "rendering_workflow",
    name: "Rendering Workflow",
    description: "Create a dry-run FFmpeg render plan with queue status, retries, logs, and recovery hooks.",
    mediaTypes: ["render_output", "video_clip"],
    providerPreference: ["ffmpeg", "local_worker", "mock"],
    approvalReason: "Live rendering is blocked until local worker execution is configured and approved.",
    retryable: true,
  },
  {
    kind: "subtitle_workflow",
    name: "Subtitle Workflow",
    description: "Generate subtitle timing plans, overlay style guidance, and SRT/VTT-ready text structure.",
    mediaTypes: ["subtitles"],
    providerPreference: ["ffmpeg", "mock"],
    approvalReason: "Subtitle overlays should be reviewed before public media export.",
    retryable: false,
  },
  {
    kind: "asset_optimization_workflow",
    name: "Asset Optimization Workflow",
    description: "Prepare compression, cropping, naming, tagging, and platform-readiness optimization plans.",
    mediaTypes: ["platform_variant", "render_output", "asset_template"],
    providerPreference: ["ffmpeg", "mock"],
    approvalReason: "Optimized assets remain manual package candidates until reviewed.",
    retryable: true,
  },
];

export function getMediaWorkflow(kind: MediaWorkflowKind) {
  return mediaWorkflows.find((workflow) => workflow.kind === kind) ?? mediaWorkflows[0];
}

export function defaultMediaTypeForWorkflow(kind: MediaWorkflowKind): MediaType {
  return getMediaWorkflow(kind).mediaTypes[0];
}
