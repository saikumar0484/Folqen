import { z } from "zod";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { runOnboardingConversation } from "@/lib/public-release/conversation";
import { getMutationSafetyError } from "@/lib/security/request-guards";

const bodySchema = z.object({
  message: z.string().trim().min(8),
  draft: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const safetyError = getMutationSafetyError(request, { key: `onboarding-chat:${user.id}`, limit: 40, windowMs: 60_000 });
  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Provide an onboarding objective and valid draft payload." }, { status: 400 });
  }

  const result = runOnboardingConversation({
    message: parsed.data.message,
    draft: parsed.data.draft,
  });

  return NextResponse.json({ ok: true, result });
}

