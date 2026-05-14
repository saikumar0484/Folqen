import { z } from "zod";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canOperateWorkspaces } from "@/lib/auth/permissions";
import { setActiveWorkspace } from "@/lib/public-release/workspace-service";
import { getMutationSafetyError } from "@/lib/security/request-guards";

const bodySchema = z.object({
  workspaceId: z.string().min(1),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }
  if (!canOperateWorkspaces(user)) {
    return NextResponse.json({ error: "Only admins and operators can switch workspaces." }, { status: 403 });
  }

  const safetyError = getMutationSafetyError(request, { key: `workspace-active:${user.id}`, limit: 24, windowMs: 60_000 });
  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
  }

  const payload = bodySchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) {
    return NextResponse.json({ error: "Select a valid workspace." }, { status: 400 });
  }

  const result = await setActiveWorkspace(user, payload.data.workspaceId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
