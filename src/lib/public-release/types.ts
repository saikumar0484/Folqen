export type NicheTemplateId =
  | "horror_shorts"
  | "ai_news"
  | "tech_explainers"
  | "motivation_edits"
  | "educational_shorts"
  | "faceless_automation";

export type BetaPlatform = "YOUTUBE" | "INSTAGRAM" | "FACEBOOK" | "SNAPCHAT" | "THREADS" | "LINKEDIN" | "SUBSTACK" | "BLUESKY" | "LEMON8" | "KICK";

export type WorkforceRole = {
  id: string;
  title: string;
  focus: string;
};

export type WorkflowTemplate = {
  id: string;
  name: string;
  summary: string;
  department: string;
};

export type NicheTemplate = {
  id: NicheTemplateId;
  label: string;
  positioning: string;
  defaultPlatforms: BetaPlatform[];
  workforce: WorkforceRole[];
  workflows: WorkflowTemplate[];
  strategyStarter: string[];
};

export type WorkspaceProfile = {
  id: string;
  name: string;
  objective: string;
  nicheTemplateId: NicheTemplateId;
  primaryPlatforms: BetaPlatform[];
  operationalProfile: "guided" | "balanced" | "aggressive";
  workforcePreset: WorkforceRole[];
  workflowPreset: WorkflowTemplate[];
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OnboardingDraft = {
  objective: string;
  workspaceName: string;
  nicheTemplateId: NicheTemplateId;
  targetPlatforms: BetaPlatform[];
  postingCadence: string;
  audienceFocus: string;
  tone: string;
  operationalProfile: "guided" | "balanced" | "aggressive";
};

export type OnboardingConversationResult = {
  assistantMessage: string;
  followUps: string[];
  draft: OnboardingDraft;
  recommendedTemplate: NicheTemplate;
  recommendedWorkflows: WorkflowTemplate[];
  recommendedWorkforce: WorkforceRole[];
};

