import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getAgentRegistrySnapshot } from "@/lib/orchestration/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    mode: "mock_safe",
    registry: getAgentRegistrySnapshot(),
  });
}
