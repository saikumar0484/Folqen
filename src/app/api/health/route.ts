import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { getIntegrationStatus } from "@/lib/integrations/status";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = getEnv();
  const integrations = await getIntegrationStatus();

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
    integrations,
  });
}
