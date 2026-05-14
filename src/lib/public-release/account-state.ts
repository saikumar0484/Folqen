import type { HonestStatus } from "@/lib/status-semantics";

export type CreatorAccountState =
  | "needs_setup"
  | "ready_for_first_workflow"
  | "has_real_history"
  | "blocked_by_approval"
  | "integration_not_connected";

export type SurfaceId =
  | "agents"
  | "analytics"
  | "automations"
  | "brand"
  | "browser"
  | "calendar"
  | "content"
  | "departments"
  | "errors"
  | "files"
  | "incidents"
  | "infrastructure"
  | "library"
  | "memory"
  | "monetization"
  | "notifications"
  | "pipeline"
  | "platforms"
  | "research"
  | "tools"
  | "upgrades"
  | "workflows";

export type EmptyStateModel = {
  state: CreatorAccountState;
  status: HonestStatus;
  title: string;
  description: string;
  suggestion?: string;
  actionLabel: string;
  actionHref: string;
};

type ResolveAccountStateInput = {
  hasWorkspace: boolean;
  hasRecords: boolean;
  blockedByApproval?: boolean;
  integrationConnected?: boolean;
};

export function resolveCreatorAccountState(input: ResolveAccountStateInput): CreatorAccountState {
  if (!input.hasWorkspace) return "needs_setup";
  if (input.blockedByApproval) return "blocked_by_approval";
  if (input.hasRecords) return "has_real_history";
  if (input.integrationConnected === false) return "integration_not_connected";
  return "ready_for_first_workflow";
}

const defaultCopyByState: Record<CreatorAccountState, Omit<EmptyStateModel, "state">> = {
  needs_setup: {
    status: "Not connected",
    title: "Complete onboarding to unlock your workspace",
    description: "Folqen is ready, but this account has no workspace yet.",
    suggestion: "Start guided onboarding and define your mission, niche, and first workflow objective.",
    actionLabel: "Start onboarding",
    actionHref: "/onboarding",
  },
  ready_for_first_workflow: {
    status: "Configured",
    title: "Run your first creator workflow",
    description: "Your workspace is configured and ready for Research -> Script -> Thumbnail -> YouTube draft.",
    suggestion: "Use one clear objective in the command dock to generate your first guided package.",
    actionLabel: "Open dashboard mission control",
    actionHref: "/dashboard",
  },
  has_real_history: {
    status: "Configured",
    title: "Operational history will appear as you create",
    description: "This view reflects real records from your account as you create and review content.",
    suggestion: "Keep running guided workflows and approvals to build traceable history.",
    actionLabel: "Run first workflow",
    actionHref: "/dashboard",
  },
  blocked_by_approval: {
    status: "Needs approval",
    title: "Action blocked until approval",
    description: "Folqen detected approval-gated actions for this surface.",
    suggestion: "Review pending approvals and continue once governance checks pass.",
    actionLabel: "Review approvals",
    actionHref: "/approvals",
  },
  integration_not_connected: {
    status: "Not connected",
    title: "Integration setup is still required",
    description: "This surface depends on integrations that are not connected in your account yet.",
    suggestion: "Connect providers only when needed. Safe draft workflows remain available.",
    actionLabel: "Open settings",
    actionHref: "/settings",
  },
};

const surfaceOverrides: Partial<Record<SurfaceId, Partial<Record<CreatorAccountState, Partial<EmptyStateModel>>>>> = {
  workflows: {
    ready_for_first_workflow: {
      title: "Create your first workflow run",
      description: "No workflow runs exist yet for this account.",
      actionLabel: "Start first run",
    },
  },
  analytics: {
    integration_not_connected: {
      title: "No analytics integrations connected yet",
      description: "Analytics cards stay empty until real workflow and platform records are available.",
      actionLabel: "Configure analytics sources",
    },
  },
  browser: {
    integration_not_connected: {
      title: "Web assistant is in early beta",
      description: "Use this space to preview guided web actions while full account connections are still being expanded.",
      suggestion: "Continue with creator workflows and return here when your web assistant setup is complete.",
    },
  },
  calendar: {
    integration_not_connected: {
      title: "Calendar integrations are not connected yet",
      description: "No schedule data exists for this account.",
      suggestion: "Complete onboarding and generate your first draft package before planning cadence.",
      actionLabel: "Open onboarding",
      actionHref: "/onboarding",
    },
  },
  pipeline: {
    ready_for_first_workflow: {
      title: "No pipeline activity yet",
      description: "Run your first guided workflow and pipeline events will appear automatically.",
    },
  },
  library: {
    ready_for_first_workflow: {
      title: "No assets or drafts yet",
      description: "Your library fills as soon as you run Research -> Script -> Thumbnail -> Draft.",
      actionLabel: "Run first workflow",
      actionHref: "/dashboard",
    },
  },
  platforms: {
    integration_not_connected: {
      title: "No platforms connected yet",
      description: "Folqen will not claim uploads without verified platform connections.",
      suggestion: "Connect only the platforms you need. Draft packages remain available.",
      actionLabel: "Open settings",
      actionHref: "/settings",
    },
  },
  tools: {
    integration_not_connected: {
      title: "No external tools connected yet",
      description: "Provider and execution tooling remain gated until credentials and approvals are configured.",
      actionLabel: "Configure tools in settings",
      actionHref: "/settings",
    },
  },
  files: {
    ready_for_first_workflow: {
      title: "No files uploaded yet",
      description: "Upload references or generate your first draft package to populate this workspace.",
      actionLabel: "Open file manager",
      actionHref: "/files",
    },
  },
  notifications: {
    ready_for_first_workflow: {
      title: "No notifications yet",
      description: "Notifications appear only when your account creates real events.",
      actionLabel: "Run first workflow",
      actionHref: "/dashboard",
    },
  },
  upgrades: {
    ready_for_first_workflow: {
      title: "No upgrade proposals yet",
      description: "Upgrade proposals are created only from real operational learnings.",
      actionLabel: "Open dashboard",
      actionHref: "/dashboard",
    },
  },
  brand: {
    needs_setup: {
      title: "Set your brand mission first",
      description: "Brand voice guidance is generated from your workspace objective and niche.",
      actionLabel: "Start onboarding",
      actionHref: "/onboarding",
    },
  },
  monetization: {
    integration_not_connected: {
      title: "Monetization connections are not configured",
      description: "Folqen keeps monetization controls blocked until platform and policy checks are configured.",
      actionLabel: "Review safety settings",
      actionHref: "/settings",
    },
  },
  errors: {
    ready_for_first_workflow: {
      title: "No errors recorded",
      description: "This account has no operational errors yet.",
      actionLabel: "Open dashboard",
      actionHref: "/dashboard",
    },
  },
  content: {
    ready_for_first_workflow: {
      title: "No content packages yet",
      description: "Generate your first script and thumbnail draft package from the command dock.",
      actionLabel: "Generate first package",
    },
  },
  research: {
    ready_for_first_workflow: {
      title: "No research briefs yet",
      description: "Start with one creator question and Folqen will prepare a strategic research brief.",
    },
  },
};

export function buildEmptyStateModel(surface: SurfaceId, state: CreatorAccountState): EmptyStateModel {
  const base = defaultCopyByState[state];
  const override = surfaceOverrides[surface]?.[state];

  return {
    state,
    status: override?.status ?? base.status,
    title: override?.title ?? base.title,
    description: override?.description ?? base.description,
    suggestion: override?.suggestion ?? base.suggestion,
    actionLabel: override?.actionLabel ?? base.actionLabel,
    actionHref: override?.actionHref ?? base.actionHref,
  };
}

