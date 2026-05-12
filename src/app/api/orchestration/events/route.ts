import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getRecentEvents } from "@/lib/orchestration/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 50);

  return NextResponse.json({
    ok: true,
    mode: "mock_safe",
    events: getRecentEvents(Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 50),
  });
}
