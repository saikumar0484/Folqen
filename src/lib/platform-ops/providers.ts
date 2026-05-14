import type { PlatformOpsProviderId, PlatformOpsProviderStatus } from "./types";

function configured(value?: string) {
  return Boolean(value && value.trim().length > 0);
}

export function getPlatformProviderStatuses(env: NodeJS.ProcessEnv = process.env): PlatformOpsProviderStatus[] {
  const n8nConfigured = configured(env.ORACLE_N8N_INSTANCE_URL) || configured(env.N8N_BASE_URL);
  const youtubeConfigured = configured(env.YOUTUBE_CLIENT_ID) && configured(env.YOUTUBE_CLIENT_SECRET);
  const instagramConfigured = configured(env.INSTAGRAM_CLIENT_ID) && configured(env.INSTAGRAM_CLIENT_SECRET);
  const threadsConfigured = configured(env.THREADS_CLIENT_ID) && configured(env.THREADS_CLIENT_SECRET);
  const tiktokConfigured = configured(env.TIKTOK_CLIENT_ID) && configured(env.TIKTOK_CLIENT_SECRET);
  const linkedinConfigured = configured(env.LINKEDIN_CLIENT_ID) && configured(env.LINKEDIN_CLIENT_SECRET);
  const xConfigured = configured(env.X_CLIENT_ID) && configured(env.X_CLIENT_SECRET);

  return [
    {
      id: "mock",
      label: "Mock Publishing Planner",
      status: "Mock",
      capabilities: ["adapt_metadata", "plan_schedule", "plan_retry", "manual_package"],
      reason: "Default dry-run provider. It never posts to a public account.",
      livePublishingEnabled: false,
    },
    {
      id: "n8n",
      label: "n8n Workflow Provider",
      status: n8nConfigured ? "Configured" : "Not connected",
      capabilities: ["future_workflow_trigger", "future_schedule_bridge", "future_retry_bridge"],
      reason: n8nConfigured ? "n8n URL is present, but publishing workflows remain blocked." : "n8n is not configured.",
      livePublishingEnabled: false,
    },
    {
      id: "youtube_api",
      label: "YouTube Data API",
      status: youtubeConfigured ? "Blocked" : "Not connected",
      capabilities: ["future_video_upload", "future_private_draft", "future_analytics_read"],
      reason: youtubeConfigured ? "Credentials appear present, but public publishing guard blocks execution." : "YouTube credentials are not configured.",
      livePublishingEnabled: false,
    },
    {
      id: "instagram_graph",
      label: "Instagram Graph API",
      status: instagramConfigured ? "Blocked" : "Not connected",
      capabilities: ["future_reel_publish", "future_media_container", "future_insights_read"],
      reason: instagramConfigured ? "Credentials appear present, but account automation is blocked." : "Instagram credentials are not configured.",
      livePublishingEnabled: false,
    },
    {
      id: "threads_api",
      label: "Threads API",
      status: threadsConfigured ? "Blocked" : "Not connected",
      capabilities: ["future_post_publish", "future_insights_read"],
      reason: threadsConfigured ? "Credentials appear present, but account automation is blocked." : "Threads credentials are not configured.",
      livePublishingEnabled: false,
    },
    {
      id: "tiktok_api",
      label: "TikTok API Placeholder",
      status: tiktokConfigured ? "Blocked" : "Not connected",
      capabilities: ["future_video_publish_placeholder", "manual_package"],
      reason: "Infrastructure placeholder only. Folqen must not depend on TikTok for India operations.",
      livePublishingEnabled: false,
    },
    {
      id: "linkedin_api",
      label: "LinkedIn API",
      status: linkedinConfigured ? "Blocked" : "Not connected",
      capabilities: ["future_article_post", "future_video_post", "future_analytics_read"],
      reason: linkedinConfigured ? "Credentials appear present, but publishing is blocked." : "LinkedIn credentials are not configured.",
      livePublishingEnabled: false,
    },
    {
      id: "x_api",
      label: "X/Twitter API",
      status: xConfigured ? "Blocked" : "Not connected",
      capabilities: ["future_tweet_publish", "future_thread_publish", "future_metrics_read"],
      reason: xConfigured ? "Credentials appear present, but publishing is blocked." : "X/Twitter credentials are not configured.",
      livePublishingEnabled: false,
    },
  ];
}

export function selectPlatformProvider(preferred: PlatformOpsProviderId[]) {
  const providers = getPlatformProviderStatuses();
  return preferred.map((id) => providers.find((provider) => provider.id === id)).find(Boolean) ?? providers[0];
}
