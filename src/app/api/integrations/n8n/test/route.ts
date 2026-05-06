import { NextResponse } from "next/server";
import { testN8nWebhook } from "@/lib/integrations/n8n";

export const dynamic = "force-dynamic";

export async function POST() {
  const result = await testN8nWebhook();

  return NextResponse.json(result, {
    status: result.status === "failed" ? 502 : 200,
  });
}
