import { timingSafeEqual } from "node:crypto";

export const PREVIEW_DEMO_USER_ID = "preview-demo-admin";
export const PREVIEW_PUBLIC_USER_ID = "preview-public-viewer";

export type PreviewDemoUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN";
};

export type PreviewPublicUser = {
  id: string;
  email: string;
  name: string;
  role: "VIEWER";
};

function flag(source: NodeJS.ProcessEnv, key: string) {
  return source[key] === "true";
}

function isExplicitPreviewRuntime(source: NodeJS.ProcessEnv) {
  return source.FOLQEN_RUNTIME_PROFILE === "preview";
}

function constantTimeStringEqual(left: string, right: string) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);

  if (leftBytes.length !== rightBytes.length) {
    return false;
  }

  return timingSafeEqual(leftBytes, rightBytes);
}

export function isPreviewDemoAuthEnabled(source: NodeJS.ProcessEnv = process.env) {
  const previewRuntime = isExplicitPreviewRuntime(source);
  const executionDisabled =
    !flag(source, "ALLOW_PUBLIC_PUBLISH") &&
    !flag(source, "ALLOW_PAID_TOOLS") &&
    !flag(source, "ALLOW_BROWSER_AUTOMATION") &&
    source.ORCHESTRATION_EXECUTION_MODE !== "live" &&
    !flag(source, "ORCHESTRATION_WORKER_ENABLED") &&
    !flag(source, "ALLOW_LIVE_AI_EXECUTION") &&
    !flag(source, "ALLOW_CONTROLLED_MEDIA_EXECUTION") &&
    !flag(source, "ALLOW_LIVE_THUMBNAIL_RENDERING");

  return flag(source, "PREVIEW_DEMO_AUTH") && previewRuntime && flag(source, "PREVIEW_SAFE_MODE") && flag(source, "PREVIEW_FORCE_DRY_RUN") && executionDisabled;
}

export function isPreviewPublicModeEnabled(source: NodeJS.ProcessEnv = process.env) {
  const previewRuntime = isExplicitPreviewRuntime(source);
  const executionDisabled =
    !flag(source, "ALLOW_PUBLIC_PUBLISH") &&
    !flag(source, "ALLOW_PAID_TOOLS") &&
    !flag(source, "ALLOW_BROWSER_AUTOMATION") &&
    source.ORCHESTRATION_EXECUTION_MODE !== "live" &&
    !flag(source, "ORCHESTRATION_WORKER_ENABLED") &&
    !flag(source, "ALLOW_LIVE_AI_EXECUTION") &&
    !flag(source, "ALLOW_CONTROLLED_MEDIA_EXECUTION") &&
    !flag(source, "ALLOW_LIVE_THUMBNAIL_RENDERING");

  return flag(source, "PREVIEW_PUBLIC_MODE") && previewRuntime && flag(source, "PREVIEW_SAFE_MODE") && flag(source, "PREVIEW_FORCE_DRY_RUN") && executionDisabled;
}

export function getPreviewDemoUser(source: NodeJS.ProcessEnv = process.env): PreviewDemoUser {
  return {
    id: PREVIEW_DEMO_USER_ID,
    email: source.PREVIEW_DEMO_EMAIL?.trim().toLowerCase() || "admin@example.com",
    name: "Folqen Preview Admin",
    role: "ADMIN",
  };
}

export function getPreviewPublicUser(source: NodeJS.ProcessEnv = process.env): PreviewPublicUser {
  return {
    id: PREVIEW_PUBLIC_USER_ID,
    email: source.PREVIEW_PUBLIC_EMAIL?.trim().toLowerCase() || "preview@folqen.local",
    name: "Folqen Public Preview",
    role: "VIEWER",
  };
}

export function validatePreviewDemoCredentials(email: string, password: string, source: NodeJS.ProcessEnv = process.env) {
  if (!isPreviewDemoAuthEnabled(source)) {
    return false;
  }

  const demoUser = getPreviewDemoUser(source);
  const demoPassword = source.PREVIEW_DEMO_PASSWORD ?? "ChangeMe123!";

  return email.trim().toLowerCase() === demoUser.email && constantTimeStringEqual(password, demoPassword);
}
