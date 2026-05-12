import { randomUUID } from "crypto";
import type { JobsOptions, Queue } from "bullmq";

import { getRedisConnection, getRedisConfig, isRedisQueueEnabled } from "./redis";
import type { QueueEnqueueResult, QueueMode } from "./types";

export const ORCHESTRATION_QUEUES = {
  tasks: "folqen.tasks",
  workflows: "folqen.workflows",
  incidents: "folqen.incidents",
  memory: "folqen.memory",
  media: "folqen.media",
  publishing: "folqen.publishing",
  scheduling: "folqen.scheduling",
  publishingRetry: "folqen.publishing.retry",
  governance: "folqen.governance",
  sandbox: "folqen.sandbox",
  monitoring: "folqen.monitoring",
} as const;

type QueueName = (typeof ORCHESTRATION_QUEUES)[keyof typeof ORCHESTRATION_QUEUES];

const queueRegistry = new Map<QueueName, Queue>();

async function getQueue(queueName: QueueName) {
  if (!isRedisQueueEnabled()) {
    return null;
  }

  const existing = queueRegistry.get(queueName);
  if (existing) {
    return existing;
  }

  const connection = await getRedisConnection();
  if (!connection) {
    return null;
  }

  const { Queue } = await import("bullmq");
  const queue = new Queue(queueName, {
    connection,
    prefix: getRedisConfig().prefix,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 10_000 },
      removeOnComplete: 250,
      removeOnFail: 500,
    },
  });
  queueRegistry.set(queueName, queue);
  return queue;
}

export async function enqueueOrchestrationJob(input: {
  queueName: QueueName;
  name: string;
  data: Record<string, unknown>;
  options?: JobsOptions;
}): Promise<QueueEnqueueResult> {
  const mode: QueueMode = isRedisQueueEnabled() ? "live" : "mock";

  if (mode === "mock") {
    return {
      mode,
      queueName: input.queueName,
      jobId: `mock_job_${randomUUID()}`,
      status: "mocked",
    };
  }

  const queue = await getQueue(input.queueName);
  const job = await queue?.add(input.name, input.data, input.options);

  return {
    mode,
    queueName: input.queueName,
    jobId: job?.id?.toString() ?? `missing_job_${randomUUID()}`,
    status: "queued",
  };
}

export async function getQueueHealth() {
  const entries = Object.values(ORCHESTRATION_QUEUES);

  if (!isRedisQueueEnabled()) {
    return entries.map((name) => ({
      name,
      mode: "mock" as const,
      waiting: 0,
      active: 0,
      delayed: 0,
      failed: 0,
      completed: 0,
      status: "mock_safe" as const,
    }));
  }

  return Promise.all(
    entries.map(async (name) => {
      const queue = await getQueue(name);
      const counts = await queue?.getJobCounts("waiting", "active", "delayed", "failed", "completed");
      return {
        name,
        mode: "live" as const,
        waiting: counts?.waiting ?? 0,
        active: counts?.active ?? 0,
        delayed: counts?.delayed ?? 0,
        failed: counts?.failed ?? 0,
        completed: counts?.completed ?? 0,
        status: counts && counts.failed > 0 ? ("degraded" as const) : ("healthy" as const),
      };
    }),
  );
}
