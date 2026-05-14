import { NextResponse } from "next/server";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import { getMutationSafetyError } from "@/lib/security/request-guards";

const requestAccessSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email(),
  focus: z.string().trim().min(3).max(240),
});

export async function POST(request: Request) {
  const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const safetyError = getMutationSafetyError(request, { key: `beta-access-request:${clientKey}`, limit: 5, windowMs: 60_000 });

  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
  }

  const parsed = requestAccessSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete your name, email, and creator focus." }, { status: 400 });
  }

  await createAuditLog({
    action: "beta.access_requested",
    target: parsed.data.email.trim().toLowerCase(),
    riskLevel: "LOW",
    metadata: {
      name: parsed.data.name,
      focus: parsed.data.focus,
      source: "join_beta_form",
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Thanks. Your beta request is in, and we'll follow up with invite details.",
  });
}
