import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { z } from "zod";

import { createBetaUser, listBetaUsers } from "@/lib/beta/access";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canManageBetaAccess } from "@/lib/auth/permissions";
import { getMutationSafetyError } from "@/lib/security/request-guards";

const createBetaUserSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(2).max(120).optional(),
  role: z.enum([UserRole.VIEWER, UserRole.OPERATOR]).default(UserRole.VIEWER),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }
  if (!canManageBetaAccess(user)) {
    return NextResponse.json({ error: "You don't have access to invite management." }, { status: 403 });
  }

  const users = await listBetaUsers();
  return NextResponse.json({ ok: true, users });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }
  if (!canManageBetaAccess(user)) {
    return NextResponse.json({ error: "You don't have access to invite management." }, { status: 403 });
  }

  const safetyError = getMutationSafetyError(request, { key: `beta-users-create:${user.id}`, limit: 12, windowMs: 60_000 });
  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
  }

  const parsed = createBetaUserSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid email and creator name." }, { status: 400 });
  }

  const result = await createBetaUser({
    ...parsed.data,
    actorId: user.id,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    user: result.user,
    temporaryPassword: result.temporaryPassword,
    note: "Share this temporary password securely. The creator will be asked to update it at first sign-in.",
  });
}
