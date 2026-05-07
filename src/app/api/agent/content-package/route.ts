import { NextResponse } from "next/server";
import { ContentStatus, PlatformName, ReviewStatus, RiskLevel, TaskStatus } from "@prisma/client";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/current-user";
import { canCreateDraftContent } from "@/lib/auth/permissions";
import { getDb } from "@/lib/db";

const requestSchema = z.object({
  topic: z.string().min(4).max(140),
  format: z.string().min(3).max(80).default("short_vertical_video"),
});

function cleanTopic(topic: string) {
  return topic.trim().replace(/\s+/g, " ");
}

function createDraftMetadata(topic: string) {
  return {
    source: "folqen_mock_agent",
    liveAiProvider: false,
    publicPublishing: "blocked_by_default",
    packageMode: "manual_posting_package",
    draft: {
      hook: `What really happened behind the legend of ${topic}?`,
      scriptBeats: [
        "Open with a mystery question and location context.",
        "Separate documented history from folklore claims.",
        "Retell the legend with clear 'locals say' language.",
        "Close with a safe question for comments without claiming proof.",
      ],
      thumbnailIdea: `Dark ruins, neon green title text, and a subtle question mark motif for ${topic}.`,
      caption: `A Folqen mystery draft about ${topic}. Folklore is presented as legend, not verified fact.`,
      safetyNote: "Requires human review, safety review, and copyright clearance before public posting.",
    },
  };
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  if (!canCreateDraftContent(user)) {
    return NextResponse.json({ error: "Only admins and operators can create draft content packages." }, { status: 403 });
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a topic between 4 and 140 characters." }, { status: 400 });
  }

  const topic = cleanTopic(parsed.data.topic);
  const metadata = createDraftMetadata(topic);

  const content = await getDb().contentItem.create({
    data: {
      title: topic,
      format: parsed.data.format,
      status: ContentStatus.DRAFT,
      reviewStatus: ReviewStatus.PENDING,
      safetyStatus: ReviewStatus.PENDING,
      copyrightStatus: ReviewStatus.PENDING,
      platformTargets: [PlatformName.YOUTUBE, PlatformName.INSTAGRAM, PlatformName.FACEBOOK],
      metadata,
      tasks: {
        create: {
          title: `Prepare safe draft package for ${topic}`,
          description: "Mock-agent generated planning task. No real AI provider, render tool, or publishing integration was used.",
          status: TaskStatus.COMPLETED,
          riskLevel: RiskLevel.LOW,
          metadata: {
            liveAiProvider: false,
            nextStep: "human_review",
          },
        },
      },
      approvals: {
        create: {
          type: "content_review",
          title: `Review draft package: ${topic}`,
          status: "PENDING",
          riskLevel: RiskLevel.MEDIUM,
          reason: "Human review is required before public publishing or platform upload.",
          requestedBy: "folqen_mock_agent",
        },
      },
    },
  });

  await createAuditLog({
    actorId: user.id,
    action: "agent.content_package_created",
    target: content.id,
    riskLevel: "LOW",
    metadata: {
      topic,
      liveAiProvider: false,
      publicPublishing: "blocked",
      paidTools: "blocked",
    },
  });

  return NextResponse.json({
    ok: true,
    content: {
      id: content.id,
      title: content.title,
      status: content.status,
      message: "Draft package created with mock-agent planning only. Review is required before any public use.",
    },
  });
}
