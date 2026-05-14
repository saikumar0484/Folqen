import { getDatabaseStatus } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { getPublishingGuardStatus } from "@/lib/integrations/status";
import { listAgents, listDepartments } from "./registry";
import { getQueueHealth } from "./queue";
import { getRedisStatus } from "./redis";

export async function getOrchestrationMonitoringSnapshot() {
  const env = getEnv();
  const [database, redis, queues] = await Promise.all([getDatabaseStatus(), getRedisStatus(), getQueueHealth()]);
  const agents = listAgents();
  const departments = listDepartments();

  return {
    executionMode: env.ORCHESTRATION_EXECUTION_MODE,
    workerEnabled: env.ORCHESTRATION_WORKER_ENABLED,
    safety: getPublishingGuardStatus(),
    database,
    redis,
    queues,
    departments: {
      total: departments.length,
      active: departments.length,
    },
    agents: {
      total: agents.length,
      active: agents.filter((agent) => agent.status === "active").length,
      degraded: agents.filter((agent) => agent.status === "degraded").length,
      offline: agents.filter((agent) => agent.status === "offline").length,
    },
    observability: {
      auditLogs: "configured_when_database_available",
      eventLogs: "configured_when_database_available",
      tracing: "hook_ready",
      metrics: "mock_safe",
    },
  };
}
