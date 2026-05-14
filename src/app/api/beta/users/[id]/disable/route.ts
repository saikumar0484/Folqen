import { NextResponse } from "next/server";
import { z } from "zod";

import { setBetaUserDisabled } from "@/lib/beta/access";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canManageBetaAccess } from "@/lib/auth/permissions";
import { getMutationSafetyError } from "@/lib/security/request-guards";

const bodySchema = z.object({
  disabled: z.boolean(),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }
  if (!canManageBetaAccess(user)) {
    return NextResponse.json({ error: "Only admins and operators can change beta access status." }, { status: 403 });
  }

  const safetyError = getMutationSafetyError(request, { key: `beta-users-disable:${user.id}`, limit: 20, windowMs: 60_000 });
  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid disable payload." }, { status: 400 });
  }

  const { id } = await context.params;
  const result = await setBetaUserDisabled(id, parsed.data.disabled, user.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
