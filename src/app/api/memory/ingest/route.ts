import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveMemoryMutationAccess } from "@/lib/memory/api-handler";
import { ingestMemory } from "@/lib/memory/service";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveMemoryMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `memory-ingest:${user.id}`, limit: 20, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const result = await ingestMemory(await request.json().catch(() => null), access.user.id);
    return NextResponse.json({
      ok: true,
      mode: "mock_safe",
      result,
      message: "Organizational memory was captured without live embeddings or workflow mutation.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid memory ingestion request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Memory ingestion failed." }, { status: 500 });
  }
}
