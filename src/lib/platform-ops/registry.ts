import type { PlatformOpsPlatform, PlatformOpsWorkflowKind, PlatformProfile, PublishingWorkflowDefinition } from "./types";

export const platformProfiles: PlatformProfile[] = [
  {
    id: "YOUTUBE",
    label: "YouTube",
    tier: "primary",
    defaultAspectRatios: ["16:9", "9:16"],
    maxTitleLength: 100,
    maxCaptionLength: 5000,
    hashtagLimit: 15,
    apiProviderId: "youtube_api",
    manualFallback: true,
    notes: ["Private draft upload is a future adapter; public publish remains blocked.", "Best for long mystery docs and Shorts."],
  },
  {
    id: "INSTAGRAM",
    label: "Instagram",
    tier: "primary",
    defaultAspectRatios: ["9:16", "1:1", "4:5"],
    maxTitleLength: 80,
    maxCaptionLength: 2200,
    hashtagLimit: 30,
    apiProviderId: "instagram_graph",
    manualFallback: true,
    notes: ["Manual Reel package is the default until Graph API credentials and permissions are approved."],
  },
  {
    id: "THREADS",
    label: "Threads",
    tier: "primary",
    defaultAspectRatios: ["1:1", "4:5"],
    maxTitleLength: 80,
    maxCaptionLength: 500,
    hashtagLimit: 6,
    apiProviderId: "threads_api",
    manualFallback: true,
    notes: ["Designed for short mystery hooks and discussion prompts."],
  },
  {
    id: "TIKTOK",
    label: "TikTok",
    tier: "requested_placeholder",
    defaultAspectRatios: ["9:16"],
    maxTitleLength: 90,
    maxCaptionLength: 2200,
    hashtagLimit: 12,
    apiProviderId: "tiktok_api",
    manualFallback: true,
    notes: ["Infrastructure placeholder only. Folqen must not depend on TikTok for India distribution."],
  },
  {
    id: "LINKEDIN",
    label: "LinkedIn",
    tier: "secondary",
    defaultAspectRatios: ["16:9", "1:1"],
    maxTitleLength: 150,
    maxCaptionLength: 3000,
    hashtagLimit: 8,
    apiProviderId: "linkedin_api",
    manualFallback: true,
    notes: ["Use for documentary production notes, research threads, and brand credibility posts."],
  },
  {
    id: "X_TWITTER",
    label: "X/Twitter",
    tier: "secondary",
    defaultAspectRatios: ["16:9", "1:1"],
    maxTitleLength: 120,
    maxCaptionLength: 280,
    hashtagLimit: 4,
    apiProviderId: "x_api",
    manualFallback: true,
    notes: ["Use concise hooks and source-safe claims. API access remains not connected."],
  },
];

export const publishingWorkflows: PublishingWorkflowDefinition[] = [
  {
    kind: "scheduled_publishing",
    name: "Scheduled Publishing",
    description: "Creates a future publishing plan with approval gates, schedule metadata, queue records, and manual package fallback.",
    queue: "scheduling",
    approvalReason: "Scheduling is publishing-adjacent and must be reviewed before any account action.",
    retryable: true,
  },
  {
    kind: "multi_platform_distribution",
    name: "Multi-Platform Distribution",
    description: "Builds platform-specific deployment plans for YouTube, Instagram, Threads, TikTok placeholder, LinkedIn, and X/Twitter.",
    queue: "publishing",
    approvalReason: "Multi-platform deployment touches public distribution and requires human approval.",
    retryable: true,
  },
  {
    kind: "publishing_retry_recovery",
    name: "Publishing Retry Recovery",
    description: "Plans idempotent retry and escalation steps for failed or blocked publish jobs without touching accounts.",
    queue: "retry",
    approvalReason: "Retry plans can affect public distribution when real adapters exist.",
    retryable: true,
  },
  {
    kind: "failed_upload_recovery",
    name: "Failed Upload Recovery",
    description: "Diagnoses failed uploads, prepares recovery tasks, and switches to manual posting package mode.",
    queue: "retry",
    approvalReason: "Upload recovery can reveal account or policy problems and must be reviewed before live execution.",
    retryable: true,
  },
  {
    kind: "platform_adaptation",
    name: "Platform Adaptation Workflow",
    description: "Adapts titles, captions, hashtags, aspect ratios, metadata, and templates per platform.",
    queue: "publishing",
    approvalReason: "Adapted metadata needs review before public use.",
    retryable: false,
  },
  {
    kind: "analytics_collection",
    name: "Analytics Collection Workflow",
    description: "Plans future analytics ingestion, manual import mapping, metrics, and workflow linkage.",
    queue: "publishing",
    approvalReason: "Analytics API collection requires account permissions in a future slice.",
    retryable: true,
  },
  {
    kind: "engagement_monitoring",
    name: "Engagement Monitoring Workflow",
    description: "Plans CTR, retention, engagement, policy, monetization, warning, and strike monitoring hooks.",
    queue: "publishing",
    approvalReason: "Engagement monitoring requires platform account read permissions later.",
    retryable: true,
  },
];

export function getPlatformProfile(platform: PlatformOpsPlatform) {
  const profile = platformProfiles.find((item) => item.id === platform);
  if (!profile) throw new Error(`Unknown platform: ${platform}`);
  return profile;
}

export function getPublishingWorkflow(kind: PlatformOpsWorkflowKind) {
  const workflow = publishingWorkflows.find((item) => item.kind === kind);
  if (!workflow) throw new Error(`Unknown publishing workflow: ${kind}`);
  return workflow;
}
