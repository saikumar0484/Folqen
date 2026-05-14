import { NextResponse } from "next/server";
import { z } from "zod";

import { getMutationSafetyError } from "@/lib/security/request-guards";
import { requestPasswordReset } from "@/lib/auth/password-reset";

const requestResetSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const safetyError = getMutationSafetyError(request, { key: `request-reset:${clientKey}`, limit: 6, windowMs: 60_000 });

  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
  }

  const parsed = requestResetSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const result = await requestPasswordReset(parsed.data.email);
  return NextResponse.json({
    ok: true,
    message: "If that email is in Folqen, reset instructions are on the way.",
    previewLink: process.env.NODE_ENV === "development" ? result.resetLinkPath : undefined,
  });
}
