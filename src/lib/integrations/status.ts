import { getDatabaseStatus } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { getQueueHealth } from "@/lib/orchestration/queue";
import { getRedisConfig, getRedisStatus } from "@/lib/orchestration/redis";
import { getProviderConfig } from "@/lib/provider-config";

export async function getIntegrationStatus(selectedOpenAiModel?: string) {
  const env = getEnv();
  const [database, redis, queues] = await Promise.all([getDatabaseStatus(), getRedisStatus(), getQueueHealth()]);
  const providers = getProviderConfig(selectedOpenAiModel);

  return {
    database,
    deployment: {
      appBaseUrl: env.APP_BASE_URL ? "configured" : "not_connected",
      vercel: process.env.VERCEL ? "configured" : "not_connected",
    },
    worker: {
      oracleN8n: env.ORACLE_N8N_INSTANCE_URL ? "configured" : "not_connected",
      localWorker: env.LOCAL_WORKER_BASE_URL ? "configured" : "not_connected",
      n8nWebhook: env.N8N_WEBHOOK_URL ? "configured" : "not_connected",
    },
    tools: {
      comfyui: env.COMFYUI_BASE_URL ? "configured" : "not_connected",
      ffmpeg: env.FFMPEG_PATH ? "configured" : "not_connected",
      tts: env.TTS_PROVIDER_URL ? "configured" : "not_connected",
    },
    orchestration: {
      executionMode: getRedisConfig().executionMode,
      workerEnabled: getRedisConfig().workerEnabled,
      redis,
      queues,
      langGraph: "configured",
      crewAi: "coordination_plan_only",
      realPublishing: "blocked",
      paidTools: "blocked",
    },
    providers,
  };
}

export function getPublishingGuardStatus() {
  const env = getEnv();

  return {
    publicPublishing: env.ALLOW_PUBLIC_PUBLISH ? "enabled" : "blocked",
    paidTools: env.ALLOW_PAID_TOOLS ? "enabled" : "blocked",
    browserAutomation: env.ALLOW_BROWSER_AUTOMATION ? "enabled" : "blocked",
    humanApprovalRequired: env.REQUIRE_HUMAN_APPROVAL,
  };
}
