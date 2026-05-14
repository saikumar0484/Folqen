import type { MemoryCategory } from "./types";

export const memoryCategories: Array<{
  id: MemoryCategory;
  label: string;
  description: string;
  defaultTags: string[];
}> = [
  {
    id: "strategic",
    label: "Strategic Memory",
    description: "Successful content strategies, platform insights, audience patterns, and strategic decisions.",
    defaultTags: ["strategy", "platform", "audience"],
  },
  {
    id: "workflow",
    label: "Workflow Memory",
    description: "Successful workflows, failed workflows, retries, bottlenecks, incidents, and operational fixes.",
    defaultTags: ["workflow", "retry", "reliability"],
  },
  {
    id: "prompt",
    label: "Prompt Memory",
    description: "Prompt versions, scoring notes, optimization history, and safe prompt evolution records.",
    defaultTags: ["prompt", "versioning", "optimization"],
  },
  {
    id: "analytics",
    label: "Analytics Memory",
    description: "CTR, retention, engagement, platform performance, and audience response patterns.",
    defaultTags: ["analytics", "retention", "ctr"],
  },
  {
    id: "organizational",
    label: "Organizational Memory",
    description: "Department reports, incidents, operating decisions, approval context, and institutional notes.",
    defaultTags: ["organization", "decision", "incident"],
  },
];

export function getMemoryCategory(category: MemoryCategory) {
  return memoryCategories.find((candidate) => candidate.id === category) ?? memoryCategories[4];
}

export const reflectionWorkflowSteps = [
  "validate_reflection_scope",
  "retrieve_relevant_memory",
  "compare_previous_runs",
  "score_workflow_quality",
  "identify_bottlenecks",
  "generate_strategy_recommendations",
  "emit_memory_events",
  "queue_memory_followup",
] as const;
