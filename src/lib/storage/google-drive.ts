import { getEnv, type FolqenEnv } from "@/lib/env";
import type { ServiceResult } from "@/lib/services/types";

const tokenUrl = "https://oauth2.googleapis.com/token";
const uploadUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size,webViewLink";

type FetchLike = typeof fetch;

export type GoogleDriveUploadInput = {
  name: string;
  mimeType: string;
  sizeBytes: number;
  data: ArrayBuffer;
};

export type GoogleDriveUploadResult = {
  driveFileId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  webViewLink?: string;
  path: string;
};

function hasValue(value: string | undefined) {
  return Boolean(value?.trim());
}

export function isGoogleDriveStorageConfigured(env: FolqenEnv = getEnv()) {
  return (
    hasValue(env.GOOGLE_DRIVE_CLIENT_ID) &&
    hasValue(env.GOOGLE_DRIVE_CLIENT_SECRET) &&
    hasValue(env.GOOGLE_DRIVE_REFRESH_TOKEN) &&
    hasValue(env.GOOGLE_DRIVE_FOLDER_ID)
  );
}

async function getAccessToken(env: FolqenEnv, fetchImpl: FetchLike): Promise<ServiceResult<{ accessToken: string }>> {
  if (!isGoogleDriveStorageConfigured(env)) {
    return {
      ok: false,
      status: "not_connected",
      message: "Google Drive storage is Not connected. Configure OAuth client, refresh token, and private folder id first.",
    };
  }

  const response = await fetchImpl(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_DRIVE_CLIENT_ID as string,
      client_secret: env.GOOGLE_DRIVE_CLIENT_SECRET as string,
      refresh_token: env.GOOGLE_DRIVE_REFRESH_TOKEN as string,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      status: "failed",
      message: "Google OAuth token refresh failed. Check the Drive OAuth secrets and refresh token.",
    };
  }

  const body = (await response.json().catch(() => null)) as { access_token?: string } | null;

  if (!body?.access_token) {
    return {
      ok: false,
      status: "failed",
      message: "Google OAuth response did not include an access token.",
    };
  }

  return {
    ok: true,
    status: "configured",
    message: "Google Drive access token refreshed.",
    data: { accessToken: body.access_token },
  };
}

export async function uploadPrivateFileToGoogleDrive(
  input: GoogleDriveUploadInput,
  options: { env?: FolqenEnv; fetchImpl?: FetchLike } = {},
): Promise<ServiceResult<GoogleDriveUploadResult>> {
  const env = options.env ?? getEnv();
  const fetchImpl = options.fetchImpl ?? fetch;
  const token = await getAccessToken(env, fetchImpl);

  if (!token.ok || !token.data) {
    return {
      ok: false,
      status: token.status,
      message: token.message,
    };
  }

  const session = await fetchImpl(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.data.accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": input.mimeType,
      "X-Upload-Content-Length": String(input.sizeBytes),
    },
    body: JSON.stringify({
      name: input.name,
      parents: [env.GOOGLE_DRIVE_FOLDER_ID],
    }),
  });

  if (!session.ok) {
    return {
      ok: false,
      status: "failed",
      message: "Google Drive upload session could not be created.",
    };
  }

  const location = session.headers.get("location");

  if (!location) {
    return {
      ok: false,
      status: "failed",
      message: "Google Drive upload session did not return an upload URL.",
    };
  }

  const upload = await fetchImpl(location, {
    method: "PUT",
    headers: {
      "Content-Type": input.mimeType,
      "Content-Length": String(input.sizeBytes),
    },
    body: Buffer.from(input.data),
  });

  if (!upload.ok) {
    return {
      ok: false,
      status: "failed",
      message: "Google Drive file upload failed.",
    };
  }

  const file = (await upload.json().catch(() => null)) as {
    id?: string;
    name?: string;
    mimeType?: string;
    size?: string;
    webViewLink?: string;
  } | null;

  if (!file?.id) {
    return {
      ok: false,
      status: "failed",
      message: "Google Drive upload finished without a file id.",
    };
  }

  return {
    ok: true,
    status: "configured",
    message: "File stored privately in Google Drive.",
    data: {
      driveFileId: file.id,
      name: file.name ?? input.name,
      mimeType: file.mimeType ?? input.mimeType,
      sizeBytes: Number(file.size ?? input.sizeBytes),
      webViewLink: file.webViewLink,
      path: `google-drive://${file.id}`,
    },
  };
}
