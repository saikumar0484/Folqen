import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { runLiveThumbnailRender } from "@/lib/media/live-thumbnail-rendering";
import { getWorkspaceOverview } from "@/lib/public-release/workspace-service";
import { getMutationSafetyError } from "@/lib/security/request-guards";
import { toHonestStatus } from "@/lib/status-semantics";
import { runControlledLiveExecution } from "@/lib/live-execution/service";

const bodySchema = z.object({
  workspaceId: z.string().optional(),
  objective: z.string().min(8).max(1500).optional(),
  platformTarget: z.enum(["YOUTUBE"]).default("YOUTUBE"),
  approvals: z
    .object({
      research: z.string().optional(),
      content: z.string().optional(),
      thumbnail: z.string().optional(),
    })
    .optional(),
  thumbnailPrompt: z.string().min(12).max(2500).optional(),
});

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function getStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function buildYouTubeDraftPackage(args: {
  objective: string;
  scriptStructuredOutput: unknown;
  thumbnailPreviewUrl?: string;
}) {
  const content = asObject(args.scriptStructuredOutput);
  const drafts = content ? getStringArray(content.drafts) : [];
  const recommendations = content ? getStringArray(content.recommendations) : [];

  const primaryScript = drafts[0] ?? `Hook: ${args.objective}\n\nScript:\n1) Open with a high-curiosity question.\n2) Separate folklore from verified facts.\n3) End with a discussion prompt.`;

  const shortTitleBase = args.objective.replace(/\s+/g, " ").trim().slice(0, 70);
  const title = `${shortTitleBase} | Urban Legend Breakdown`;
  const description = [
    `Objective: ${args.objective}`,
    "This is a draft-safe package generated in governed beta mode.",
    "Publishing remains blocked until explicit approval and platform setup.",
  ].join("\n\n");

  const tags = Array.from(
    new Set(
      [
        "urban legends",
        "mystery shorts",
        "folklore",
        "horror storytelling",
        ...recommendations.slice(0, 5).map((item) => item.toLowerCase()),
      ].map((item) => item.replace(/[^\w\s-]/g, "").trim()),
    ),
  )
    .filter(Boolean)
    .slice(0, 15);

  return {
    platform: "YOUTUBE",
    mode: "draft_only",
    title,
    description,
    tags,
    script: primaryScript,
    thumbnail: {
      previewUrl: args.thumbnailPreviewUrl ?? null,
      status: args.thumbnailPreviewUrl ? "generated" : "pending_or_blocked",
    },
  };
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const safetyError = getMutationSafetyError(request, { key: `beta-first-run:${user.id}`, limit: 10, windowMs: 60_000 });
  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide a valid first-run request payload." }, { status: 400 });
  }

  const overview = await getWorkspaceOverview(user);
  const workspace =
    (parsed.data.workspaceId && overview.workspaces.find((item) => item.id === parsed.data.workspaceId)) ||
    overview.activeWorkspace ||
    overview.workspaces[0] ||
    null;

  const objective = parsed.data.objective?.trim() || workspace?.objective || "Build a horror storytelling shorts channel system.";
  const trace: Array<{ step: string; status: string; detail: string }> = [];

  const research = await runControlledLiveExecution({
    objective,
    providerId: "gemini",
    departmentId: "research",
    workflowKind: "structured_generation",
    taskType: "planning",
    researchWorkflowKind: "content_ideation",
    approvalId: parsed.data.approvals?.research,
  });
  trace.push({
    step: "research",
    status: toHonestStatus(research.readiness.status),
    detail: research.validation.warnings[0] ?? (research.status === "completed_live" ? "Research output generated." : "Research blocked by governance or readiness gates."),
  });

  const scriptRun = await runControlledLiveExecution({
    objective,
    providerId: "gemini",
    departmentId: "content",
    workflowKind: "structured_generation",
    taskType: "structured_output",
    contentWorkflowKind: "script_generation",
    approvalId: parsed.data.approvals?.content,
  });
  trace.push({
    step: "script",
    status: toHonestStatus(scriptRun.readiness.status),
    detail: scriptRun.validation.warnings[0] ?? (scriptRun.status === "completed_live" ? "Script drafts generated." : "Script generation blocked by governance or readiness gates."),
  });

  const thumbnailPrompt =
    parsed.data.thumbnailPrompt ??
    `Create a cinematic YouTube Shorts thumbnail for: ${objective}. Include strong contrast, readable title space, mystery atmosphere, and safe documentary tone.`;

  const thumbnailRun = await runLiveThumbnailRender(
    {
      objective,
      approvalId: parsed.data.approvals?.thumbnail ?? "missing_approval",
      prompt: thumbnailPrompt,
      tags: ["beta-v1", "youtube-shorts", "horror-storytelling"],
      aspectRatio: "16:9",
      outputFormat: "image/png",
      estimatedRenderSeconds: 45,
      estimatedGpuMinutes: 0.8,
    },
    user.id,
  );
  trace.push({
    step: "thumbnail",
    status: toHonestStatus(thumbnailRun.governance.status),
    detail:
      thumbnailRun.validation.warnings[0] ??
      (thumbnailRun.status === "completed_live" ? "Thumbnail generated through controlled provider." : "Thumbnail blocked by approval, budget, or provider gates."),
  });

  const youtubeDraftPackage = buildYouTubeDraftPackage({
    objective,
    scriptStructuredOutput: scriptRun.structuredOutput,
    thumbnailPreviewUrl: thumbnailRun.liveThumbnail?.previewUrl,
  });

  return NextResponse.json({
    ok: true,
    workflowKind: "beta_v1_first_run",
    workspace: workspace
      ? {
          id: workspace.id,
          name: workspace.name,
          nicheTemplateId: workspace.nicheTemplateId,
        }
      : null,
    researchBrief: research.structuredOutput ?? null,
    scripts: scriptRun.structuredOutput ?? null,
    thumbnailDraft: {
      runId: thumbnailRun.runId,
      status: toHonestStatus(thumbnailRun.governance.status),
      previewUrl: thumbnailRun.liveThumbnail?.previewUrl ?? null,
      validation: thumbnailRun.validation,
    },
    youtubeDraftPackage,
    statuses: {
      research: toHonestStatus(research.readiness.status),
      script: toHonestStatus(scriptRun.readiness.status),
      thumbnail: toHonestStatus(thumbnailRun.governance.status),
      package: "Configured",
    },
    trace,
    safety: {
      publishing: "Blocked",
      browserAutomation: "Blocked",
      unrestrictedRendering: "Blocked",
      autonomousRetries: "Blocked",
      workflowMutation: "Blocked",
    },
  });
}
