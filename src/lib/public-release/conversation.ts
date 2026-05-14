import { z } from "zod";
import { getNicheTemplate } from "@/lib/public-release/templates";
import type { NicheTemplateId, OnboardingConversationResult, OnboardingDraft } from "@/lib/public-release/types";

const onboardingDraftSchema = z.object({
  objective: z.string().trim().min(8),
  workspaceName: z.string().trim().min(2),
  nicheTemplateId: z.enum(["horror_shorts", "ai_news", "tech_explainers", "motivation_edits", "educational_shorts", "faceless_automation"]),
  targetPlatforms: z.array(z.enum(["YOUTUBE", "INSTAGRAM", "FACEBOOK", "SNAPCHAT", "THREADS", "LINKEDIN", "SUBSTACK", "BLUESKY", "LEMON8", "KICK"])).min(1),
  postingCadence: z.string().trim().min(2),
  audienceFocus: z.string().trim().min(2),
  tone: z.string().trim().min(2),
  operationalProfile: z.enum(["guided", "balanced", "aggressive"]),
});

export type OnboardingDraftInput = z.input<typeof onboardingDraftSchema>;

const keywordTemplateMap: Array<{ match: RegExp; templateId: NicheTemplateId }> = [
  { match: /(horror|mystery|urban legend|folklore|scary|haunted)/i, templateId: "horror_shorts" },
  { match: /(ai news|model update|openai|gemini|claude|llm)/i, templateId: "ai_news" },
  { match: /(tech|software|developer|programming|saas)/i, templateId: "tech_explainers" },
  { match: /(motivation|mindset|discipline|self improvement)/i, templateId: "motivation_edits" },
  { match: /(education|learning|student|study)/i, templateId: "educational_shorts" },
  { match: /(faceless|automation|batch|repurpose)/i, templateId: "faceless_automation" },
];

function recommendTemplateId(objective: string) {
  const match = keywordTemplateMap.find((item) => item.match.test(objective));
  return match?.templateId ?? "horror_shorts";
}

export function buildDefaultOnboardingDraft(objective = "I want to grow a horror storytelling shorts channel."): OnboardingDraft {
  const templateId = recommendTemplateId(objective);
  const template = getNicheTemplate(templateId);
  return {
    objective,
    workspaceName: `${template.label} Workspace`,
    nicheTemplateId: template.id,
    targetPlatforms: template.defaultPlatforms,
    postingCadence: "5 shorts per week",
    audienceFocus: "18-34 short-form viewers interested in mystery and storytelling",
    tone: template.id === "horror_shorts" ? "immersive, suspenseful, documentary-style caution" : "clear, energetic, creator-friendly",
    operationalProfile: "guided",
  };
}

export function runOnboardingConversation(input: {
  message: string;
  draft?: Partial<OnboardingDraftInput>;
}): OnboardingConversationResult {
  const draftSeed = { ...buildDefaultOnboardingDraft(input.message), ...(input.draft ?? {}) };
  const parsed = onboardingDraftSchema.safeParse(draftSeed);
  const draft = parsed.success ? parsed.data : buildDefaultOnboardingDraft(input.message);
  const template = getNicheTemplate(draft.nicheTemplateId);

  const assistantMessage = [
    `Great direction. I configured Folqen for **${template.label}** with a **${draft.operationalProfile}** operating profile.`,
    "I prepared your initial AI workforce, workflow stack, and platform setup plan in preview-safe mode.",
    "No publishing, rendering, or unrestricted automation will be enabled until approvals are explicitly granted.",
  ].join(" ");

  return {
    assistantMessage,
    followUps: [
      "What posting cadence do you want for week one?",
      "Should we optimize for YouTube Shorts first, or split focus across Instagram and Facebook too?",
      "Do you want a dramatic suspense tone or a documentary investigation tone?",
      "Should Folqen run guided mode first, or balanced mode with broader workflow autonomy?",
    ],
    draft,
    recommendedTemplate: template,
    recommendedWorkflows: template.workflows,
    recommendedWorkforce: template.workforce,
  };
}

