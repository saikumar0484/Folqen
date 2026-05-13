import assert from "node:assert/strict";
import test from "node:test";
import { isGoogleDriveStorageConfigured, uploadPrivateFileToGoogleDrive } from "@/lib/storage/google-drive";
import type { FolqenEnv } from "@/lib/env";

const baseEnv: FolqenEnv = {
  ALLOW_PUBLIC_PUBLISH: false,
  REQUIRE_HUMAN_APPROVAL: true,
  ALLOW_PAID_TOOLS: false,
  ALLOW_BROWSER_AUTOMATION: false,
  DEFAULT_UPLOAD_PRIVACY: "private",
  SELF_IMPROVEMENT_ENABLED: true,
  AUTO_EXECUTE_UPGRADES: false,
  REQUIRE_UPGRADE_APPROVAL: true,
  ALLOW_PAID_RESEARCH_TOOLS: false,
  MAX_MONTHLY_RESEARCH_COST_INR: 0,
  BULLMQ_PREFIX: "folqen",
  ORCHESTRATION_EXECUTION_MODE: "mock",
  ORCHESTRATION_WORKER_ENABLED: false,
  ALLOW_LIVE_AI_EXECUTION: false,
  LIVE_AI_ACTIVATION_STAGE: 0,
  AI_RUNTIME_KILL_SWITCH: false,
  AI_RUNTIME_EMERGENCY_STOP: false,
  MEMORY_EMBEDDINGS_PROVIDER: "mock",
  MEMORY_EMBEDDING_DIMENSIONS: 1536,
};

const driveEnv: FolqenEnv = {
  ...baseEnv,
  GOOGLE_DRIVE_CLIENT_ID: "client-id",
  GOOGLE_DRIVE_CLIENT_SECRET: "client-secret",
  GOOGLE_DRIVE_REFRESH_TOKEN: "refresh-token",
  GOOGLE_DRIVE_FOLDER_ID: "folder-id",
};

test("Google Drive storage reports not connected without every secret", () => {
  assert.equal(isGoogleDriveStorageConfigured(baseEnv), false);
  assert.equal(isGoogleDriveStorageConfigured({ ...driveEnv, GOOGLE_DRIVE_REFRESH_TOKEN: "" }), false);
  assert.equal(isGoogleDriveStorageConfigured(driveEnv), true);
});

test("Google Drive upload returns not connected without secrets", async () => {
  const result = await uploadPrivateFileToGoogleDrive(
    {
      name: "story.txt",
      mimeType: "text/plain",
      sizeBytes: 5,
      data: new TextEncoder().encode("story").buffer,
    },
    {
      env: baseEnv,
      fetchImpl: async () => {
        throw new Error("fetch should not be called");
      },
    },
  );

  assert.equal(result.ok, false);
  assert.equal(result.status, "not_connected");
});

test("Google Drive upload uses token refresh and resumable private folder upload", async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const fetchImpl = async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });

    if (String(url).includes("oauth2.googleapis.com/token")) {
      return new Response(JSON.stringify({ access_token: "access-token" }), { status: 200 });
    }

    if (String(url).includes("uploadType=resumable")) {
      return new Response(null, {
        status: 200,
        headers: { location: "https://upload.example/session" },
      });
    }

    return new Response(
      JSON.stringify({
        id: "drive-file-id",
        name: "story.txt",
        mimeType: "text/plain",
        size: "5",
        webViewLink: "https://drive.google.com/file/d/drive-file-id/view",
      }),
      { status: 200 },
    );
  };

  const result = await uploadPrivateFileToGoogleDrive(
    {
      name: "story.txt",
      mimeType: "text/plain",
      sizeBytes: 5,
      data: new TextEncoder().encode("story").buffer,
    },
    { env: driveEnv, fetchImpl: fetchImpl as typeof fetch },
  );

  assert.equal(result.ok, true);
  assert.equal(result.data?.path, "google-drive://drive-file-id");
  assert.equal(calls.length, 3);
  assert.match(String(calls[0].init.body), /grant_type=refresh_token/);
  assert.match(String(calls[1].init.body), /folder-id/);
  assert.equal(calls[1].init.headers && "Authorization" in calls[1].init.headers, true);
  assert.equal(String(calls[2].url), "https://upload.example/session");
});

test("Google Drive upload does not expose configured secrets in failure messages", async () => {
  const result = await uploadPrivateFileToGoogleDrive(
    {
      name: "story.txt",
      mimeType: "text/plain",
      sizeBytes: 5,
      data: new TextEncoder().encode("story").buffer,
    },
    {
      env: driveEnv,
      fetchImpl: async () => new Response("nope", { status: 401 }),
    },
  );

  const serialized = JSON.stringify(result);

  assert.equal(result.ok, false);
  assert.doesNotMatch(serialized, /client-secret/);
  assert.doesNotMatch(serialized, /refresh-token/);
});
