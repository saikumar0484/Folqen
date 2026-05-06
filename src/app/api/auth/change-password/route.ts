import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canManageSystem } from "@/lib/auth/permissions";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getDb } from "@/lib/db";

const passwordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(12, "Use at least 12 characters."),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  if (!canManageSystem(user)) {
    return NextResponse.json({ error: "Only admins can change the admin password." }, { status: 403 });
  }

  const parsed = passwordSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid password request." }, { status: 400 });
  }

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return NextResponse.json({ error: "New password must be different from the current password." }, { status: 400 });
  }

  const dbUser = await getDb().user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!dbUser || !(await verifyPassword(parsed.data.currentPassword, dbUser.passwordHash))) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  await getDb().user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });

  await createAuditLog({
    actorId: user.id,
    action: "auth.password_changed",
    target: user.email,
    riskLevel: "MEDIUM",
    metadata: { source: "settings_page" },
  });

  return NextResponse.json({ ok: true });
}
