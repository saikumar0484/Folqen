import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db";
import { canCaptureTextPreview, validateUploadCandidate } from "@/lib/files/validation";

function parseTags(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];

  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 12),
    ),
  );
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
  }

  const validation = validateUploadCandidate({
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
  });

  if (!validation.allowed) {
    return NextResponse.json({ error: "File blocked by validation.", reasons: validation.reasons }, { status: 400 });
  }

  const fileId = `upload-${crypto.randomUUID()}`;
  const textPreview = canCaptureTextPreview(validation.mimeType, validation.sizeBytes) ? (await file.text()).slice(0, 12000) : null;

  const uploadedFile = await getDb().uploadedFile.create({
    data: {
      id: fileId,
      name: validation.sanitizedName,
      path: `db-metadata://${fileId}/${validation.sanitizedName}`,
      mimeType: validation.mimeType,
      sizeBytes: validation.sizeBytes,
      privacy: "private",
      tags: parseTags(formData?.get("tags") ?? null),
      metadata: {
        storageMode: "database_metadata_only",
        binaryStored: false,
        textPreviewCaptured: Boolean(textPreview),
        textPreview,
        originalName: file.name,
        extension: validation.extension,
        note: "MVP upload registration only. Supabase Storage is not configured yet, so binary file bytes are not persisted.",
      },
    },
  });

  await createAuditLog({
    actorId: user.id,
    action: "file.upload_registered",
    target: uploadedFile.id,
    riskLevel: "LOW",
    metadata: {
      name: uploadedFile.name,
      mimeType: uploadedFile.mimeType,
      sizeBytes: uploadedFile.sizeBytes,
      storageMode: "database_metadata_only",
      binaryStored: false,
    },
  });

  return NextResponse.json({
    ok: true,
    file: {
      id: uploadedFile.id,
      name: uploadedFile.name,
      mimeType: uploadedFile.mimeType,
      sizeBytes: uploadedFile.sizeBytes,
      privacy: uploadedFile.privacy,
      tags: uploadedFile.tags,
      storageMode: "database_metadata_only",
      binaryStored: false,
    },
  });
}
