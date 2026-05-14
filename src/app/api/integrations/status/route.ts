import { NextResponse } from "next/server";
import { getIntegrationStatus } from "@/lib/integrations/status";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getIntegrationStatus());
}
