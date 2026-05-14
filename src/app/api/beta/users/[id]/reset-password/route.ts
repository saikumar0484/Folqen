import { NextResponse } from "next/server";

import { resetBetaUserPassword } from "@/lib/beta/access";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canManageBetaAccess } from "@/lib/auth/permissions";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }
  if (!canManageBetaAccess(user)) {
    return NextResponse.json({ error: "Only admins and operators can reset beta user passwords." }, { status: 403 });
  }

  const safetyError = getMutationSafetyError(request, { key: `beta-users-reset:${user.id}`, limit: 12, windowMs: 60_000 });
  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
  }

  const { id } = await context.params;
  const result = await resetBetaUserPassword(id, user.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    temporaryPassword: result.temporaryPassword,
    note: "User must change this password at next login.",
  });
}
