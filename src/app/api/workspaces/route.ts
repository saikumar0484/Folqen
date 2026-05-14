import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canOperateWorkspaces } from "@/lib/auth/permissions";
import { runOnboardingConversation } from "@/lib/public-release/conversation";
import { createWorkspaceFromDraft, getWorkspaceOverview } from "@/lib/public-release/workspace-service";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const overview = await getWorkspaceOverview(user);
  return NextResponse.json({ ok: true, ...overview, canOperate: canOperateWorkspaces(user) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }
  if (!canOperateWorkspaces(user)) {
    return NextResponse.json({ error: "Only admins and operators can create workspaces." }, { status: 403 });
  }

  const safetyError = getMutationSafetyError(request, { key: `workspace-create:${user.id}`, limit: 8, windowMs: 60_000 });
  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
  }

  const body = (await request.json().catch(() => null)) as { draft?: Record<string, unknown>; objective?: string } | null;
  if (!body?.draft || typeof body.objective !== "string") {
    return NextResponse.json({ error: "Objective and onboarding draft are required." }, { status: 400 });
  }

  const result = runOnboardingConversation({
    message: body.objective,
    draft: body.draft,
  });

  const workspace = await createWorkspaceFromDraft(user, result.draft);
  return NextResponse.json({ ok: true, workspace });
}
