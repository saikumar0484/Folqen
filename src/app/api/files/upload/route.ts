import { NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db";
import { canCaptureTextPreview, validateUploadCandidate } from "@/lib/files/validation";
import { getMutationSafetyError } from "@/lib/security/request-guards";
import { isGoogleDriveStorageConfigured, uploadPrivateFileToGoogleDrive } from "@/lib/storage/google-drive";

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

  const safetyError = getMutationSafetyError(request, { key: `file-upload:${user.id}`, limit: 15, windowMs: 60_000 });

  if (safetyError) {
    return NextResponse.json({ error: safetyError.error }, { status: safetyError.status });
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
  const driveConfigured = isGoogleDriveStorageConfigured();
  const driveUpload = driveConfigured
    ? await uploadPrivateFileToGoogleDrive({
        name: validation.sanitizedName,
        mimeType: validation.mimeType,
        sizeBytes: validation.sizeBytes,
        data: await file.arrayBuffer(),
      })
    : null;

  if (driveUpload && !driveUpload.ok) {
    await createAuditLog({
      actorId: user.id,
      action: "file.google_drive_upload_failed",
      target: fileId,
      riskLevel: "MEDIUM",
      metadata: {
        name: validation.sanitizedName,
        mimeType: validation.mimeType,
        sizeBytes: validation.sizeBytes,
        message: driveUpload.message,
      },
    });

    return NextResponse.json({ error: driveUpload.message, storageMode: "google_drive_private" }, { status: 502 });
  }

  const driveFile = driveUpload?.data;
  const storageMode = driveFile ? "google_drive_private" : "database_metadata_only";
  const binaryStored = Boolean(driveFile);

  const uploadedFile = await getDb().uploadedFile.create({
    data: {
      id: fileId,
      name: validation.sanitizedName,
      path: driveFile?.path ?? `db-metadata://${fileId}/${validation.sanitizedName}`,
      mimeType: validation.mimeType,
      sizeBytes: validation.sizeBytes,
      privacy: "private",
      tags: parseTags(formData?.get("tags") ?? null),
      metadata: {
        storageMode,
        binaryStored,
        textPreviewCaptured: Boolean(textPreview),
        textPreview,
        originalName: file.name,
        extension: validation.extension,
        driveFileId: driveFile?.driveFileId,
        driveWebViewLink: driveFile?.webViewLink,
        note: driveFile
          ? "File bytes were stored privately in the configured Google Drive folder. No public sharing link was created."
          : "MVP upload registration only. Google Drive storage is Not connected, so binary file bytes are not persisted.",
      },
    },
  });

  await createAuditLog({
    actorId: user.id,
    action: driveFile ? "file.google_drive_upload_stored" : "file.upload_registered",
    target: uploadedFile.id,
    riskLevel: "LOW",
    metadata: {
      name: uploadedFile.name,
      mimeType: uploadedFile.mimeType,
      sizeBytes: uploadedFile.sizeBytes,
      storageMode,
      binaryStored,
      driveFileId: driveFile?.driveFileId,
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
      storageMode,
      binaryStored,
    },
  });
}
