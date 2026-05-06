import { getDatabaseStatus } from "@/lib/db";
import { getEnv } from "@/lib/env";

export async function getIntegrationStatus() {
  const env = getEnv();
  const database = await getDatabaseStatus();

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
    },
  };
}
