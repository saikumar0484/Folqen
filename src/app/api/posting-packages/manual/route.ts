import { NextResponse } from "next/server";
import { PlatformName } from "@prisma/client";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canCreatePostingPackage } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";
import { generateManualPostingPackage } from "@/lib/posting-packages";
import { getMutationSafetyError } from "@/lib/security/request-guards";

const requestSchema = z.object({
  contentId: z.string().min(1),
  platform: z.nativeEnum(PlatformName),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  if (!canCreatePostingPackage(user)) {
    return NextResponse.json({ error: "Only admins and operators can create posting packages." }, { status: 403 });
  }

  const safetyError = getMutationSafetyError(request, { key: `posting-package:${user.id}`, limit: 20, windowMs: 60_000 });

  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a content item and platform." }, { status: 400 });
  }

  const content = await getDb().contentItem.findUnique({
    where: { id: parsed.data.contentId },
  });

  if (!content) {
    return NextResponse.json({ error: "Content item was not found." }, { status: 404 });
  }

  const postingPackage = generateManualPostingPackage(content, parsed.data.platform);

  const asset = await getDb().asset.create({
    data: {
      contentId: content.id,
      type: "posting_package",
      name: `${postingPackage.platformLabel} manual posting package`,
      path: `manual://${postingPackage.packageId}`,
      mimeType: "application/json",
      metadata: postingPackage,
    },
  });

  await createAuditLog({
    actorId: user.id,
    action: "posting_package.created",
    target: asset.id,
    riskLevel: "LOW",
    metadata: {
      contentId: content.id,
      platform: parsed.data.platform,
      mode: "manual",
      note: "Manual package created only. No platform upload or public publishing happened.",
    },
  });

  return NextResponse.json({ ok: true, assetId: asset.id, postingPackage });
}
