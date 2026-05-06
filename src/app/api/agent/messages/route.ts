import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db";

const messageSchema = z.object({
  content: z.string().min(1).max(2000),
  pageContext: z.string().max(80).optional(),
});

function createMockAgentReply(content: string) {
  const lower = content.toLowerCase();

  if (lower.includes("publish") || lower.includes("post")) {
    return "I can prepare a manual posting package, but public publishing is blocked until approval, safety review, copyright clearance, and review status all pass.";
  }

  if (lower.includes("approval")) {
    return "I found the approval queue. I can help summarize pending decisions, but the human keeps final control over risky actions.";
  }

  if (lower.includes("script") || lower.includes("content")) {
    return "I can draft a folklore content package with hook, script, caption, hashtags, thumbnail idea, and a safety note. Live rendering and platform upload remain Not connected.";
  }

  return "I saved your message. Folqen can help plan content, explain blockers, review approvals, and prepare safe next steps while integrations remain clearly marked.";
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const messages = await getDb().agentMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const parsed = messageSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Write a message before sending." }, { status: 400 });
  }

  const reply = createMockAgentReply(parsed.data.content);

  const [userMessage, agentMessage] = await getDb().$transaction([
    getDb().agentMessage.create({
      data: {
        userId: user.id,
        role: "user",
        content: parsed.data.content,
        metadata: { pageContext: parsed.data.pageContext ?? "agent" },
      },
    }),
    getDb().agentMessage.create({
      data: {
        userId: user.id,
        role: "assistant",
        content: reply,
        metadata: {
          model: "mock-agent",
          liveTools: false,
          publicPublishing: "blocked",
        },
      },
    }),
  ]);

  await createAuditLog({
    actorId: user.id,
    action: "agent.message_saved",
    target: agentMessage.id,
    riskLevel: "LOW",
    metadata: { pageContext: parsed.data.pageContext ?? "agent" },
  });

  return NextResponse.json({ messages: [userMessage, agentMessage] });
}
