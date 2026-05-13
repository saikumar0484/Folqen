import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveBrowserOpsMutationAccess } from "@/lib/browser-ops/api-handler";
import { runBrowserWorkflow } from "@/lib/browser-ops/service";
import { getMutationSafetyError } from "@/lib/security/request-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const access = resolveBrowserOpsMutationAccess({
    user,
    safetyError: user ? getMutationSafetyError(request, { key: `browser-workflow:${user.id}`, limit: 8, windowMs: 60_000 }) : null,
  });

  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  try {
    const result = await runBrowserWorkflow(await request.json().catch(() => null), access.user.id);
    return NextResponse.json({
      ok: result.status === "simulated",
      mode: result.mode,
      result,
      message:
        result.status === "simulated"
          ? "Browser workflow simulated in dry-run mode. No browser process, website contact, account session, upload, or scraping occurred."
          : "Browser workflow remained blocked or needs approval. No browser automation was executed.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid browser workflow request.", details: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ error: error instanceof Error ? error.message : "Browser workflow planning failed." }, { status: 500 });
  }
}
