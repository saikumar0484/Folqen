import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { emitOrchestrationEvent } from "@/lib/orchestration/event-bus";
import { captureWorkflowMemory } from "@/lib/orchestration/memory-hooks";
import { enqueueOrchestrationJob, ORCHESTRATION_QUEUES } from "@/lib/orchestration/queue";
import { runReflectionGraph } from "./flows";
import { getMemoryProviderStatus, createMockEmbeddingSignature } from "./providers";
import { getMemoryCategory, memoryCategories, reflectionWorkflowSteps } from "./registry";
import type {
  ExperimentInput,
  ExperimentResult,
  MemoryDashboard,
  MemoryEntryInput,
  MemoryEntryView,
  MemoryIngestionResult,
  MemorySearchInput,
  MemorySearchResult,
  PromptVersionInput,
  PromptVersionResult,
  ReflectionInput,
  ReflectionResult,
} from "./types";

const memoryCategorySchema = z.enum(["strategic", "workflow", "prompt", "analytics", "organizational"]);

export const memoryIngestionSchema = z.object({
  category: memoryCategorySchema,
  title: z.string().min(3).max(180),
  summary: z.string().min(3).max(600),
  content: z.string().min(3).max(8000),
  tags: z.array(z.string().min(1).max(48)).default([]),
  scope: z.enum(["organization", "department", "agent", "workflow", "content", "experiment"]).default("organization"),
  subjectType: z.string().min(1).max(80).optional(),
  subjectId: z.string().min(1).max(140).optional(),
  departmentId: z.string().min(1).max(120).optional(),
  agentId: z.string().min(1).max(120).optional(),
  importance: z.coerce.number().min(0).max(1).default(0.6),
  confidence: z.coerce.number().min(0).max(1).default(0.7),
  sourceType: z.string().min(1).max(80).default("manual"),
  sourceId: z.string().min(1).max(140).optional(),
  metadata: z.record(z.unknown()).default({}),
});

export const memorySearchSchema = z.object({
  query: z.string().min(2).max(500),
  categories: z.array(memoryCategorySchema).default([]),
  departmentId: z.string().min(1).max(120).optional(),
  agentId: z.string().min(1).max(120).optional(),
  tags: z.array(z.string().min(1).max(48)).default([]),
  limit: z.coerce.number().int().min(1).max(25).default(8),
});

export const reflectionSchema = z.object({
  objective: z.string().min(8).max(1000),
  reflectionKind: z.enum(["workflow_reflection", "strategy_reflection", "analytics_reflection", "prompt_reflection", "incident_reflection"]).default("strategy_reflection"),
  workflowRunId: z.string().min(1).max(140).optional(),
  memoryIds: z.array(z.string().min(1).max(140)).default([]),
  categories: z.array(memoryCategorySchema).default(["strategic", "workflow", "analytics"]),
  departmentId: z.string().min(1).max(120).optional(),
});

export const experimentSchema = z.object({
  experimentType: z.enum(["ab_test", "workflow_comparison", "prompt_comparison", "hook_comparison", "metadata_comparison"]),
  name: z.string().min(3).max(180),
  hypothesis: z.string().min(6).max(1000),
  memoryId: z.string().min(1).max(140).optional(),
  metricFocus: z.string().min(1).max(80).default("quality_score"),
  variants: z
    .array(
      z.object({
        key: z.string().min(1).max(40),
        label: z.string().min(1).max(100),
        description: z.string().min(3).max(1000),
        metrics: z.record(z.coerce.number()).optional(),
      }),
    )
    .min(2)
    .max(6),
});

export const promptVersionSchema = z.object({
  key: z.string().min(2).max(120),
  content: z.string().min(10).max(12000),
  performanceScore: z.coerce.number().min(0).max(1).optional(),
  optimizationNotes: z.string().max(1000).optional(),
  active: z.boolean().default(false),
});

const globalStore = globalThis as typeof globalThis & {
  folqenMemoryEntries?: MemoryEntryView[];
  folqenMemoryReflections?: ReflectionResult[];
  folqenExperiments?: ExperimentResult[];
};

const memoryStore = globalStore.folqenMemoryEntries ?? [];
const reflectionStore = globalStore.folqenMemoryReflections ?? [];
const experimentStore = globalStore.folqenExperiments ?? [];
globalStore.folqenMemoryEntries = memoryStore;
globalStore.folqenMemoryReflections = reflectionStore;
globalStore.folqenExperiments = experimentStore;

function jsonSafe(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function normalizeTags(input: MemoryEntryInput) {
  const categoryTags = getMemoryCategory(input.category).defaultTags;
  return Array.from(new Set([...(input.tags ?? []), ...categoryTags].map((tag) => tag.toLowerCase().trim()).filter(Boolean))).slice(0, 18);
}

function toMemoryView(input: MemoryEntryInput, id = `mem_${randomUUID()}`): MemoryEntryView {
  return {
    id,
    category: input.category,
    scope: input.scope ?? "organization",
    title: input.title,
    summary: input.summary,
    content: input.content,
    tags: normalizeTags(input),
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    departmentId: input.departmentId,
    agentId: input.agentId,
    importance: input.importance ?? 0.6,
    confidence: input.confidence ?? 0.7,
    sourceType: input.sourceType ?? "manual",
    sourceId: input.sourceId,
    embeddingStatus: "Mock",
    createdAt: new Date().toISOString(),
  };
}

function textTokens(value: string) {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2),
  );
}

function scoreMemory(query: string, memory: MemoryEntryView, tags: string[]) {
  const queryTokens = textTokens(`${query} ${tags.join(" ")}`);
  const memoryTokens = textTokens(`${memory.title} ${memory.summary} ${memory.content} ${memory.tags.join(" ")}`);
  const overlap = Array.from(queryTokens).filter((token) => memoryTokens.has(token)).length;
  const tagBoost = tags.filter((tag) => memory.tags.includes(tag.toLowerCase())).length * 0.15;
  const categoryBoost = memory.importance * 0.2 + memory.confidence * 0.2;
  const signature = createMockEmbeddingSignature(query).reduce((sum, value, index) => sum + value * createMockEmbeddingSignature(memory.content)[index], 0) / 16;
  return Number(Math.min(1, overlap * 0.12 + tagBoost + categoryBoost + signature * 0.2).toFixed(3));
}

async function listPersistedMemories(limit = 20): Promise<MemoryEntryView[]> {
  if (!hasDatabaseUrl()) return [];

  try {
    const rows = await getDb().memoryEntry.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        category: true,
        scope: true,
        title: true,
        summary: true,
        content: true,
        tags: true,
        subjectType: true,
        subjectId: true,
        departmentId: true,
        agentId: true,
        importance: true,
        confidence: true,
        sourceType: true,
        sourceId: true,
        embeddingStatus: true,
        createdAt: true,
      },
    });

    return rows.map((row) => ({
      id: row.id,
      category: row.category as MemoryEntryView["category"],
      scope: row.scope as MemoryEntryView["scope"],
      title: row.title,
      summary: row.summary,
      content: row.content,
      tags: row.tags,
      subjectType: row.subjectType ?? undefined,
      subjectId: row.subjectId ?? undefined,
      departmentId: row.departmentId ?? undefined,
      agentId: row.agentId ?? undefined,
      importance: row.importance,
      confidence: row.confidence,
      sourceType: row.sourceType,
      sourceId: row.sourceId ?? undefined,
      embeddingStatus: row.embeddingStatus === "mock" ? "Mock" : "Configured",
      createdAt: row.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function ingestMemory(rawInput: unknown, actorId?: string): Promise<MemoryIngestionResult> {
  const input = memoryIngestionSchema.parse(rawInput) as MemoryEntryInput;
  const providerStatus = getMemoryProviderStatus();
  const memory = toMemoryView(input);
  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.memory,
    name: "memory.ingest",
    data: { memoryId: memory.id, category: memory.category, mockSafe: true },
  });

  memoryStore.unshift(memory);
  memoryStore.splice(100);

  const event = await emitOrchestrationEvent({
    type: "memory.entry.ingested",
    severity: "info",
    source: "organizational-memory",
    departmentId: input.departmentId as never,
    agentId: input.agentId,
    message: `Memory ingested: ${input.title}.`,
    metadata: {
      category: input.category,
      providerStatus: providerStatus.status,
      liveEmbeddingsEnabled: false,
      queueJobId: queue.jobId,
    },
  });

  let persisted = false;
  if (hasDatabaseUrl()) {
    try {
      await getDb().memoryEntry.create({
        data: {
          id: memory.id,
          category: input.category,
          scope: input.scope ?? "organization",
          subjectType: input.subjectType,
          subjectId: input.subjectId,
          departmentId: input.departmentId,
          agentId: input.agentId,
          title: input.title,
          summary: input.summary,
          content: input.content,
          tags: memory.tags,
          importance: input.importance ?? 0.6,
          confidence: input.confidence ?? 0.7,
          sourceType: input.sourceType ?? "manual",
          sourceId: input.sourceId,
          embeddingModel: "mock-deterministic-signature",
          embeddingStatus: "mock",
          metadata: jsonSafe({ ...input.metadata, mockEmbeddingSignature: createMockEmbeddingSignature(input.content) }),
        },
      });
      persisted = true;
    } catch {
      persisted = false;
    }
  }

  await createAuditLog({
    actorId,
    action: "memory.entry_ingested",
    target: memory.id,
    riskLevel: "LOW",
    metadata: jsonSafe({ category: input.category, persisted, liveEmbeddingsEnabled: false }),
  });

  return {
    memory,
    queueJobId: queue.jobId,
    eventId: event.id,
    persisted,
    providerStatus,
    semanticStatus: "Mock",
    message: "Memory captured with mock-safe semantic metadata. No live embeddings provider was called.",
  };
}

export async function searchMemory(rawInput: unknown): Promise<MemorySearchResult> {
  const input = memorySearchSchema.parse(rawInput) as Required<MemorySearchInput>;
  const providerStatus = getMemoryProviderStatus();
  const persisted = await listPersistedMemories(50);
  const source = [...persisted, ...memoryStore].filter((memory, index, all) => all.findIndex((candidate) => candidate.id === memory.id) === index);
  const filtered = source.filter((memory) => {
    const categoryOk = input.categories.length === 0 || input.categories.includes(memory.category);
    const departmentOk = !input.departmentId || memory.departmentId === input.departmentId;
    const agentOk = !input.agentId || memory.agentId === input.agentId;
    const tagsOk = input.tags.length === 0 || input.tags.some((tag) => memory.tags.includes(tag.toLowerCase()));
    return categoryOk && departmentOk && agentOk && tagsOk;
  });

  const items = filtered
    .map((memory) => ({ ...memory, retrievalScore: scoreMemory(input.query, memory, input.tags) }))
    .sort((a, b) => (b.retrievalScore ?? 0) - (a.retrievalScore ?? 0))
    .slice(0, input.limit);

  return {
    query: input.query,
    mode: "mock_semantic",
    providerStatus,
    items,
    inspectedTags: input.tags,
    message: "Semantic retrieval used mock-safe lexical/vector-signature scoring only.",
  };
}

export async function runReflection(rawInput: unknown, actorId?: string): Promise<ReflectionResult> {
  const input = reflectionSchema.parse(rawInput) as ReflectionInput;
  const graph = await runReflectionGraph(input);
  const search = await searchMemory({
    query: input.objective,
    categories: graph.categories,
    departmentId: input.departmentId,
    limit: 6,
  });
  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.memory,
    name: "memory.reflect",
    data: { objective: input.objective, workflowRunId: input.workflowRunId, mockSafe: true },
  });
  const comparedMemoryIds = Array.from(new Set([...(input.memoryIds ?? []), ...search.items.map((item) => item.id)])).slice(0, 10);
  const qualityScore = Number(Math.min(0.95, 0.55 + search.items.length * 0.05 + comparedMemoryIds.length * 0.025).toFixed(2));
  const result: ReflectionResult = {
    reflectionId: `refl_${randomUUID()}`,
    status: "metadata_only",
    mode: "dry_run",
    qualityScore,
    bottlenecks: [
      "Live embeddings are not connected, so retrieval is mock-semantic.",
      "Strategy changes are recommendations only and do not mutate workflows.",
      input.workflowRunId ? "Workflow run needs human review before reuse." : "No specific workflow run was provided for deep comparison.",
    ],
    recommendations: [
      "Convert high-confidence repeated patterns into prompt memory after approval.",
      "Attach analytics snapshots to every topic and hook experiment.",
      "Use failed workflow notes as retry guardrails before queue execution.",
    ],
    strategyEvolution: [
      "Prioritize sourced India-focused folklore where memory shows strong retention potential.",
      "Prefer manual posting packages while platform APIs remain not connected.",
      "Keep reflection outputs as proposals until a human approves strategy changes.",
    ],
    comparedMemoryIds,
    queueJobId: queue.jobId,
    memoryCaptureStatus: "Mock",
    providerStatus: getMemoryProviderStatus(),
    mutationStatus: graph.mutationStatus,
    createdAt: new Date().toISOString(),
  };

  reflectionStore.unshift(result);
  reflectionStore.splice(50);

  if (hasDatabaseUrl()) {
    try {
      const row = await getDb().memoryReflection.create({
        data: {
          id: result.reflectionId,
          memoryId: comparedMemoryIds[0],
          workflowRunId: input.workflowRunId,
          reflectionType: input.reflectionKind ?? "strategy_reflection",
          summary: input.objective,
          qualityScore: result.qualityScore,
          bottlenecks: jsonSafe(result.bottlenecks),
          recommendations: jsonSafe(result.recommendations),
          strategyNotes: jsonSafe(result.strategyEvolution),
          metadata: jsonSafe({ mode: result.mode, comparedMemoryIds, providerStatus: result.providerStatus.status }),
        },
      });
      result.status = row.id ? "completed" : "metadata_only";
    } catch {
      result.status = "metadata_only";
    }
  }

  await emitOrchestrationEvent({
    type: "memory.reflection.completed",
    severity: "info",
    source: "reflection-engine",
    workflowRunId: input.workflowRunId,
    message: "Dry-run reflection completed without workflow mutation.",
    metadata: { reflectionId: result.reflectionId, qualityScore: result.qualityScore, mutationStatus: result.mutationStatus },
  });

  await captureWorkflowMemory({
    id: result.reflectionId,
    name: "Organizational reflection",
    objective: input.objective,
    departmentId: "organizational_memory",
    status: "completed",
    assignedAgents: ["organizational_memory_agent", "reflection_engine", "strategy_evolution_agent"],
    steps: [...reflectionWorkflowSteps],
    approvalCheckpoint: {
      id: `approval_${result.reflectionId}`,
      reason: "Strategy changes are recommendations only until human approval.",
      riskLevel: "medium",
      requiredRole: "owner",
      status: "pending",
    },
    correlationId: result.reflectionId,
    graphTrace: graph.graphTrace,
    crewPlan: ["Memory agent retrieves context", "Reflection engine scores runs", "Strategy agent drafts improvements"],
    queueJobId: result.queueJobId,
    createdAt: result.createdAt,
  });

  await createAuditLog({
    actorId,
    action: "memory.reflection_run",
    target: result.reflectionId,
    riskLevel: "LOW",
    metadata: jsonSafe({ mutationStatus: result.mutationStatus, providerStatus: result.providerStatus.status }),
  });

  return result;
}

export async function createExperiment(rawInput: unknown, actorId?: string): Promise<ExperimentResult> {
  const input = experimentSchema.parse(rawInput) as ExperimentInput;
  const queue = await enqueueOrchestrationJob({
    queueName: ORCHESTRATION_QUEUES.memory,
    name: "memory.experiment.track",
    data: { experimentType: input.experimentType, mockSafe: true },
  });
  const scored = input.variants.map((variant) => {
    const metricValues = Object.values(variant.metrics ?? {});
    const score = metricValues.length ? metricValues.reduce((sum, value) => sum + value, 0) / metricValues.length : scoreMemory(input.hypothesis, toMemoryView({
      category: "prompt",
      title: variant.label,
      summary: variant.description,
      content: variant.description,
      tags: [],
      scope: "experiment",
      importance: 0.6,
      confidence: 0.6,
      sourceType: "experiment_variant",
      sourceId: variant.key,
      metadata: {},
    }), []);
    return { variant, score };
  });
  const winner = scored.sort((a, b) => b.score - a.score)[0];
  const result: ExperimentResult = {
    experimentId: `exp_${randomUUID()}`,
    status: "analyzed",
    experimentType: input.experimentType,
    winnerKey: winner?.variant.key,
    confidence: Number(Math.min(0.9, 0.5 + (winner?.score ?? 0) * 0.35).toFixed(2)),
    recommendation: winner ? `Keep "${winner.variant.label}" as the current leader, but require human review before rollout.` : "Track at least two variants before selecting a leader.",
    persisted: false,
    queueJobId: queue.jobId,
    mutationStatus: "no_automatic_rollout",
  };

  experimentStore.unshift(result);
  experimentStore.splice(50);

  if (hasDatabaseUrl()) {
    try {
      await getDb().experimentRecord.create({
        data: {
          id: result.experimentId,
          memoryId: input.memoryId,
          experimentType: input.experimentType,
          name: input.name,
          hypothesis: input.hypothesis,
          variants: jsonSafe(input.variants),
          metrics: jsonSafe({ metricFocus: input.metricFocus, scored: scored.map((item) => ({ key: item.variant.key, score: item.score })) }),
          status: result.status,
          winnerKey: result.winnerKey,
          confidence: result.confidence,
          recommendation: result.recommendation,
          metadata: jsonSafe({ mutationStatus: result.mutationStatus }),
        },
      });
      result.persisted = true;
    } catch {
      result.persisted = false;
    }
  }

  await createAuditLog({
    actorId,
    action: "memory.experiment_created",
    target: result.experimentId,
    riskLevel: "LOW",
    metadata: jsonSafe({ experimentType: input.experimentType, mutationStatus: result.mutationStatus }),
  });

  return result;
}

export async function createPromptVersion(rawInput: unknown, actorId?: string): Promise<PromptVersionResult> {
  const input = promptVersionSchema.parse(rawInput) as PromptVersionInput;
  let version = 1;
  let promptId: string | undefined;
  let status: PromptVersionResult["status"] = "metadata_only";

  if (hasDatabaseUrl()) {
    try {
      const latest = await getDb().promptVersion.findFirst({
        where: { key: input.key },
        orderBy: { version: "desc" },
        select: { version: true },
      });
      version = (latest?.version ?? 0) + 1;
      const created = await getDb().promptVersion.create({
        data: {
          key: input.key,
          version,
          content: input.content,
          active: input.active ?? false,
          metadata: jsonSafe({
            performanceScore: input.performanceScore,
            optimizationNotes: input.optimizationNotes,
            approvalRequired: true,
            liveProviderExecution: false,
          }),
        },
      });
      promptId = created.id;
      status = "created";
    } catch {
      status = "metadata_only";
    }
  }

  await ingestMemory(
    {
      category: "prompt",
      title: `Prompt version: ${input.key} v${version}`,
      summary: input.optimizationNotes || "Prompt version captured for future optimization review.",
      content: input.content,
      tags: ["prompt", input.key],
      sourceType: "prompt_version",
      sourceId: promptId,
      metadata: { performanceScore: input.performanceScore, active: input.active ?? false },
    },
    actorId,
  );

  return {
    promptId,
    key: input.key,
    version,
    status,
    approvalStatus: "Needs approval",
    message: "Prompt version captured. It is not automatically promoted into live workflows.",
  };
}

export async function getMemoryDashboard(): Promise<MemoryDashboard> {
  const memories = await listPersistedMemories(20);
  const allMemories = [...memories, ...memoryStore].filter((memory, index, all) => all.findIndex((candidate) => candidate.id === memory.id) === index);
  const providerStatus = getMemoryProviderStatus();

  return {
    categories: memoryCategories.map((category) => ({
      id: category.id,
      label: category.label,
      description: category.description,
      count: allMemories.filter((memory) => memory.category === category.id).length,
      status: providerStatus.status === "Mock" ? "Mock" : "Not connected",
    })),
    providerStatus,
    semanticSearch: {
      status: "Mock",
      mode: "mock_semantic",
      pgvectorReady: true,
      liveEmbeddingsEnabled: false,
    },
    recentMemories: allMemories.slice(0, 8),
    recentReflections: reflectionStore.slice(0, 5),
    experiments: experimentStore.slice(0, 5),
    recommendations: [
      "Attach every intelligence workflow result to memory before strategy review.",
      "Use prompt experiments for hooks and metadata before connecting paid providers.",
      "Promote strategy evolution only through approval checkpoints.",
    ],
  };
}
