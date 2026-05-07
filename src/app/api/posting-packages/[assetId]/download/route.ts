import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db";
import { createPostingPackageDownload, isManualPostingPackage } from "@/lib/posting-packages";

export async function GET(_request: Request, { params }: { params: Promise<{ assetId: string }> }) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const { assetId } = await params;
  const asset = await getDb().asset.findUnique({
    where: { id: assetId },
    select: {
      id: true,
      type: true,
      name: true,
      metadata: true,
      contentId: true,
    },
  });

  if (!asset || asset.type !== "posting_package" || !isManualPostingPackage(asset.metadata)) {
    return NextResponse.json({ error: "Manual posting package was not found." }, { status: 404 });
  }

  const download = createPostingPackageDownload(asset.metadata);

  await createAuditLog({
    actorId: user.id,
    action: "posting_package.downloaded",
    target: asset.id,
    riskLevel: "LOW",
    metadata: {
      contentId: asset.contentId,
      assetName: asset.name,
      platform: asset.metadata.platform,
      mode: "manual",
      note: "Package download only. No public publishing or platform upload happened.",
    },
  });

  return new NextResponse(download.body, {
    headers: {
      "Content-Disposition": `attachment; filename="${download.filename}"`,
      "Content-Type": "application/json; charset=utf-8",
      "X-Folqen-Action": "manual-package-download",
    },
  });
}
