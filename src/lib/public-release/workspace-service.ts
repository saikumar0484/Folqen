import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import type { CurrentUser } from "@/lib/auth/current-user";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { getNicheTemplate, nicheTemplates } from "@/lib/public-release/templates";
import type { OnboardingDraft, WorkspaceProfile } from "@/lib/public-release/types";

const workspaceRegistryKey = "workspaces.registry.v1";
const workspaceActiveByUserKey = "workspaces.active.by-user.v1";

const workspaceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  objective: z.string().min(1),
  nicheTemplateId: z.enum(["horror_shorts", "ai_news", "tech_explainers", "motivation_edits", "educational_shorts", "faceless_automation"]),
  primaryPlatforms: z.array(z.enum(["YOUTUBE", "INSTAGRAM", "FACEBOOK", "SNAPCHAT", "THREADS", "LINKEDIN", "SUBSTACK", "BLUESKY", "LEMON8", "KICK"])).min(1),
  operationalProfile: z.enum(["guided", "balanced", "aggressive"]),
  workforcePreset: z.array(z.object({ id: z.string(), title: z.string(), focus: z.string() })),
  workflowPreset: z.array(z.object({ id: z.string(), name: z.string(), summary: z.string(), department: z.string() })),
  onboardingCompleted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const workspaceRegistrySchema = z.object({
  workspaces: z.array(workspaceSchema),
});

const activeMapSchema = z.record(z.string(), z.string());

function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function readSetting<T>(key: string, parser: z.ZodType<T>, fallback: T): Promise<T> {
  if (!hasDatabaseUrl()) return fallback;
  const row = await getDb().setting.findUnique({ where: { key }, select: { value: true } });
  if (!row) return fallback;
  const parsed = parser.safeParse(row.value);
  return parsed.success ? parsed.data : fallback;
}

async function writeSetting(key: string, value: unknown) {
  if (!hasDatabaseUrl()) return;
  await getDb().setting.upsert({
    where: { key },
    create: { key, value: toInputJsonValue(value) },
    update: {
      value: toInputJsonValue(value),
      version: {
        increment: 1,
      },
    },
  });
}

export async function getWorkspaceRegistry() {
  const empty = { workspaces: [] as WorkspaceProfile[] };
  return readSetting(workspaceRegistryKey, workspaceRegistrySchema, empty);
}

export async function getActiveWorkspaceIdForUser(userId: string) {
  const activeMap = await readSetting(workspaceActiveByUserKey, activeMapSchema, {});
  return activeMap[userId] ?? null;
}

export async function getWorkspaceOverview(user: CurrentUser) {
  const registry = await getWorkspaceRegistry();
  const activeId = await getActiveWorkspaceIdForUser(user.id);
  const active = registry.workspaces.find((workspace) => workspace.id === activeId) ?? registry.workspaces[0] ?? null;

  return {
    workspaces: registry.workspaces,
    activeWorkspace: active,
    hasWorkspace: Boolean(active),
    templates: nicheTemplates.map((template) => ({ id: template.id, label: template.label, positioning: template.positioning })),
  };
}

export async function setActiveWorkspace(user: CurrentUser, workspaceId: string) {
  const registry = await getWorkspaceRegistry();
  const exists = registry.workspaces.some((workspace) => workspace.id === workspaceId);
  if (!exists) {
    return { ok: false as const, error: "Workspace not found." };
  }
  const activeMap = await readSetting(workspaceActiveByUserKey, activeMapSchema, {});
  activeMap[user.id] = workspaceId;
  await writeSetting(workspaceActiveByUserKey, activeMap);
  return { ok: true as const };
}

export async function createWorkspaceFromDraft(user: CurrentUser, draft: OnboardingDraft) {
  const template = getNicheTemplate(draft.nicheTemplateId);
  const now = new Date().toISOString();
  const workspace: WorkspaceProfile = {
    id: `ws_${randomUUID().slice(0, 12)}`,
    name: draft.workspaceName.trim() || `${template.label} Workspace`,
    objective: draft.objective.trim(),
    nicheTemplateId: template.id,
    primaryPlatforms: draft.targetPlatforms.length ? draft.targetPlatforms : template.defaultPlatforms,
    operationalProfile: draft.operationalProfile,
    workforcePreset: template.workforce,
    workflowPreset: template.workflows,
    onboardingCompleted: true,
    createdAt: now,
    updatedAt: now,
  };

  const registry = await getWorkspaceRegistry();
  const nextRegistry = { workspaces: [workspace, ...registry.workspaces] };
  await writeSetting(workspaceRegistryKey, nextRegistry);

  const activeMap = await readSetting(workspaceActiveByUserKey, activeMapSchema, {});
  activeMap[user.id] = workspace.id;
  await writeSetting(workspaceActiveByUserKey, activeMap);

  if (hasDatabaseUrl()) {
    await getDb().auditLog.create({
      data: {
        actorId: user.id,
        action: "workspace.created",
        target: workspace.id,
        riskLevel: "LOW",
        metadata: {
          workspaceName: workspace.name,
          templateId: workspace.nicheTemplateId,
          operationalProfile: workspace.operationalProfile,
          previewSafe: true,
        },
      },
    });
  }

  return workspace;
}
