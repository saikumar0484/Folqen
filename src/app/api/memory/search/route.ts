import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveMemoryReadAccess } from "@/lib/memory/api-handler";
import { searchMemory } from "@/lib/memory/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const access = resolveMemoryReadAccess(await getCurrentUser());

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const url = new URL(request.url);
  const categories = url.searchParams.getAll("category");
  const tags = url.searchParams.getAll("tag");

  try {
    const result = await searchMemory({
      query: url.searchParams.get("q") ?? "",
      categories,
      tags,
      departmentId: url.searchParams.get("departmentId") ?? undefined,
      agentId: url.searchParams.get("agentId") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });

    return NextResponse.json({ ok: true, mode: "mock_safe", result });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid memory search request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: "Memory search failed." }, { status: 500 });
  }
}
