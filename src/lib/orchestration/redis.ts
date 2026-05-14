import type { Redis } from "ioredis";
import { getEnv } from "@/lib/env";

let redisClient: Redis | null = null;

export function getRedisConfig() {
  const env = getEnv();

  return {
    url: env.REDIS_URL,
    prefix: env.BULLMQ_PREFIX,
    executionMode: env.ORCHESTRATION_EXECUTION_MODE,
    workerEnabled: env.ORCHESTRATION_WORKER_ENABLED,
  };
}

export function isRedisQueueEnabled() {
  const env = getEnv();

  return Boolean(env.REDIS_URL) && env.ORCHESTRATION_EXECUTION_MODE === "live";
}

export async function getRedisConnection() {
  const env = getEnv();

  if (!isRedisQueueEnabled() || !env.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    const { default: IORedis } = await import("ioredis");
    redisClient = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
    });
  }

  return redisClient;
}

export async function getRedisStatus() {
  const config = getRedisConfig();

  if (!config.url) {
    return {
      status: "not_connected" as const,
      mode: "mock" as const,
      message: "Redis is not connected. Queue execution is using mock-safe mode.",
    };
  }

  if (!isRedisQueueEnabled()) {
    return {
      status: "configured_mocked" as const,
      mode: "mock" as const,
      message: "Redis URL is configured, but orchestration live mode is disabled.",
    };
  }

  try {
    const connection = await getRedisConnection();
    const ping = await connection?.ping();
    return {
      status: ping === "PONG" ? ("connected" as const) : ("degraded" as const),
      mode: "live" as const,
      message: ping === "PONG" ? "Redis is connected for BullMQ orchestration." : "Redis did not return PONG.",
    };
  } catch (error) {
    return {
      status: "error" as const,
      mode: "live" as const,
      message: error instanceof Error ? error.message : "Redis connection failed.",
    };
  }
}
