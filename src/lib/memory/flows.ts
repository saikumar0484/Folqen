import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import { createCorrelationId } from "@/lib/orchestration/event-bus";
import { reflectionWorkflowSteps } from "./registry";
import type { MemoryCategory, ReflectionInput, ReflectionKind } from "./types";

export type ReflectionGraphResult = {
  objective: string;
  reflectionKind: ReflectionKind;
  categories: MemoryCategory[];
  graphTrace: string[];
  qualityInputs: string[];
  mutationStatus: "no_workflow_mutation";
  correlationId: string;
};

const defaultCategories: MemoryCategory[] = ["strategic", "workflow", "analytics"];

function normalizeReflectionInput(input: ReflectionInput): Required<Pick<ReflectionInput, "objective" | "reflectionKind" | "categories">> & ReflectionInput {
  return {
    ...input,
    objective: input.objective,
    reflectionKind: input.reflectionKind ?? "strategy_reflection",
    categories: input.categories?.length ? input.categories : defaultCategories,
  };
}

const ReflectionGraphState = Annotation.Root({
  input: Annotation<ReturnType<typeof normalizeReflectionInput>>({
    reducer: (_current, update) => update,
    default: () => normalizeReflectionInput({ objective: "Reflect on Folqen operations." }),
  }),
  graphTrace: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),
  qualityInputs: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),
  mutationStatus: Annotation<"no_workflow_mutation">({
    reducer: (_current, update) => update,
    default: () => "no_workflow_mutation",
  }),
  correlationId: Annotation<string>({
    reducer: (_current, update) => update,
    default: () => createCorrelationId("memory"),
  }),
});

function createReflectionGraph() {
  return new StateGraph(ReflectionGraphState)
    .addNode("validate_scope", (state) => ({
      graphTrace: [`${reflectionWorkflowSteps[0]}: ${state.input.reflectionKind} scoped to ${state.input.categories.join(", ")}.`],
      qualityInputs: ["validated_scope"],
    }))
    .addNode("retrieve_context", (state) => ({
      graphTrace: [`${reflectionWorkflowSteps[1]}: contextual retrieval requested in mock-semantic mode.`],
      qualityInputs: state.input.categories.map((category) => `category:${category}`),
    }))
    .addNode("compare_runs", (state) => ({
      graphTrace: [`${reflectionWorkflowSteps[2]}: previous runs and memory ids compared when available.`],
      qualityInputs: state.input.workflowRunId ? [`workflow:${state.input.workflowRunId}`] : ["workflow:unspecified"],
    }))
    .addNode("score_quality", () => ({
      graphTrace: [`${reflectionWorkflowSteps[3]}: quality score prepared as dry-run metadata.`],
      qualityInputs: ["quality_score"],
    }))
    .addNode("recommend", () => ({
      graphTrace: [`${reflectionWorkflowSteps[5]}: optimization suggestions generated without automatic rollout.`],
      mutationStatus: "no_workflow_mutation" as const,
    }))
    .addEdge(START, "validate_scope")
    .addEdge("validate_scope", "retrieve_context")
    .addEdge("retrieve_context", "compare_runs")
    .addEdge("compare_runs", "score_quality")
    .addEdge("score_quality", "recommend")
    .addEdge("recommend", END)
    .compile();
}

export async function runReflectionGraph(input: ReflectionInput): Promise<ReflectionGraphResult> {
  const normalized = normalizeReflectionInput(input);
  const graph = createReflectionGraph();
  const result = await graph.invoke({
    input: normalized,
    correlationId: createCorrelationId("memory"),
  });

  return {
    objective: normalized.objective,
    reflectionKind: normalized.reflectionKind,
    categories: normalized.categories,
    graphTrace: result.graphTrace,
    qualityInputs: result.qualityInputs,
    mutationStatus: result.mutationStatus,
    correlationId: result.correlationId,
  };
}
