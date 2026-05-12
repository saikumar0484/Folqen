import { Worker } from "bullmq";

import { getEnv } from "@/lib/env";
import { ORCHESTRATION_QUEUES } from "@/lib/orchestration/queue";
import { getRedisConnection, getRedisConfig, isRedisQueueEnabled } from "@/lib/orchestration/redis";

async function startWorker() {
  const env = getEnv();

  if (!isRedisQueueEnabled() || !env.ORCHESTRATION_WORKER_ENABLED) {
    console.log("[folqen-worker] Disabled. Set REDIS_URL, ORCHESTRATION_EXECUTION_MODE=live, and ORCHESTRATION_WORKER_ENABLED=true.");
    return;
  }

  const connection = await getRedisConnection();
  if (!connection) {
    console.log("[folqen-worker] Redis connection unavailable.");
    return;
  }

  const queueNames = Object.values(ORCHESTRATION_QUEUES);
  const workers = queueNames.map(
    (queueName) =>
      new Worker(
        queueName,
        async (job) => ({
          ok: true,
          mode: "mock_safe",
          queueName,
          jobId: job.id,
          message: "Worker acknowledged orchestration job. Real provider execution remains disabled.",
        }),
        {
          connection,
          prefix: getRedisConfig().prefix,
          concurrency: 5,
        },
      ),
  );

  workers.forEach((worker) => {
    worker.on("completed", (job) => {
      console.log(`[folqen-worker] ${worker.name} completed job ${job.id}.`);
    });
    worker.on("failed", (job, error) => {
      console.error(`[folqen-worker] ${worker.name} failed job ${job?.id}: ${error.message}`);
    });
  });

  console.log(`[folqen-worker] Started ${workers.length} orchestration workers.`);
}

void startWorker();
