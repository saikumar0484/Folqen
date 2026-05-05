import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

export function GET() {
  const env = getEnv();

  return NextResponse.json({
    app: "Folqen",
    status: "ok",
    safety: {
      allowPublicPublish: env.ALLOW_PUBLIC_PUBLISH,
      requireHumanApproval: env.REQUIRE_HUMAN_APPROVAL,
      allowPaidTools: env.ALLOW_PAID_TOOLS,
      allowBrowserAutomation: env.ALLOW_BROWSER_AUTOMATION,
      defaultUploadPrivacy: env.DEFAULT_UPLOAD_PRIVACY,
    },
    integrations: {
      n8n: env.N8N_WEBHOOK_URL ? "configured" : "not_connected",
      comfyui: env.COMFYUI_BASE_URL ? "configured" : "not_connected",
      ffmpeg: env.FFMPEG_PATH ? "configured" : "not_connected",
    },
  });
}
