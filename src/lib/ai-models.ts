export type AiModelOption = {
  id: string;
  label: string;
  category: "frontier" | "cost_optimized" | "coding" | "legacy" | "custom";
  note: string;
};

export const openAiModelOptions: AiModelOption[] = [
  {
    id: "gpt-5.2",
    label: "GPT-5.2",
    category: "frontier",
    note: "Best default for complex agentic work, planning, coding, and high-quality content reasoning.",
  },
  {
    id: "gpt-5.2-pro",
    label: "GPT-5.2 Pro",
    category: "frontier",
    note: "Higher-compute option for difficult research, strategy, and long reasoning tasks.",
  },
  {
    id: "gpt-5-mini",
    label: "GPT-5 mini",
    category: "cost_optimized",
    note: "Lower-cost option for routine chat, summaries, and simple content drafts.",
  },
  {
    id: "gpt-5-nano",
    label: "GPT-5 nano",
    category: "cost_optimized",
    note: "Fastest low-cost option for classification and simple structured tasks.",
  },
  {
    id: "gpt-5.2-codex",
    label: "GPT-5.2 Codex",
    category: "coding",
    note: "Coding-specialized option for implementation planning and code edits.",
  },
  {
    id: "gpt-4.1",
    label: "GPT-4.1",
    category: "legacy",
    note: "Non-reasoning fallback for broad text tasks when a project needs it.",
  },
];

export const defaultOpenAiModel = "gpt-5-mini";

export function normalizeModelId(modelId: string | null | undefined) {
  const trimmed = modelId?.trim();
  if (!trimmed) return defaultOpenAiModel;

  return trimmed;
}

export function isKnownOpenAiModel(modelId: string) {
  return openAiModelOptions.some((model) => model.id === modelId);
}
