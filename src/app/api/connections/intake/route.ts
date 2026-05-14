import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canManageSystem } from "@/lib/auth/permissions";
import { getConnectionDefinition, type ConnectionProviderId } from "@/lib/connections/definitions";
import { saveConnectionCredentials } from "@/lib/credentials/store";
import { getMutationSafetyError } from "@/lib/security/request-guards";

const intakeSchema = z.object({
  provider: z.string().refine((value) => Boolean(getConnectionDefinition(value)), "Unknown provider."),
  values: z.record(z.string().max(4000)).default({}),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  if (!canManageSystem(user)) {
    return NextResponse.json({ error: "Only admins can save provider connection details." }, { status: 403 });
  }

  const safetyError = getMutationSafetyError(request, { key: `connection-intake:${user.id}`, limit: 8, windowMs: 60_000 });

  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
  }

  const parsed = intakeSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Connection details are invalid." }, { status: 400 });
  }

  try {
    const result = await saveConnectionCredentials({
      provider: parsed.data.provider as ConnectionProviderId,
      values: parsed.data.values,
      actorEmail: user.email,
    });

    await createAuditLog({
      actorId: user.id,
      action: "connection.credentials_saved",
      target: result.provider,
      riskLevel: "HIGH",
      metadata: {
        provider: result.provider,
        storedSecretFields: result.storedSecretFields,
        storedNonSecretFields: result.storedNonSecretFields,
        secretsStoredEncrypted: true,
        publicPublishing: "blocked",
        paidTools: "blocked",
      },
    });

    return NextResponse.json({
      ok: true,
      provider: result.provider,
      storedSecretFields: result.storedSecretFields,
      storedNonSecretFields: result.storedNonSecretFields,
      message: "Connection details saved encrypted. Use the provider test before enabling real work.",
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Connection details could not be saved." }, { status: 400 });
  }
}
