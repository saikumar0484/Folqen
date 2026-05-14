import { NextResponse } from "next/server";
import { z } from "zod";

import { resetPasswordWithToken } from "@/lib/auth/password-reset";
import { getMutationSafetyError } from "@/lib/security/request-guards";

const resetPasswordSchema = z.object({
  token: z.string().min(12).max(300),
  newPassword: z.string().min(12, "Use at least 12 characters."),
});

export async function POST(request: Request) {
  const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const safetyError = getMutationSafetyError(request, { key: `reset-password:${clientKey}`, limit: 8, windowMs: 60_000 });

  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
  }

  const parsed = resetPasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Enter a valid password reset request." }, { status: 400 });
  }

  const result = await resetPasswordWithToken(parsed.data);

  if (!result.ok) {
    return NextResponse.json({ error: "This reset link is no longer valid. Request a fresh link to continue." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, message: "Your password is updated. You can now sign in to your creator workspace." });
}
