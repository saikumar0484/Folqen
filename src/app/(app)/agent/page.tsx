import { AgentChatPanel } from "@/components/app/agent-chat-panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AgentPage() {
  const user = await getCurrentUser();
  const messages = user
    ? await getDb().agentMessage.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
        take: 50,
      })
    : [];

  return (
    <div className="space-y-5 pb-24">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-neon">Persistent mock agent</div>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Agent chat</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Chat history now saves to Supabase. Responses are intentionally mock until a real AI provider is configured and approved.
            </p>
          </div>
          <StatusBadge tone="warning">Mock LLM</StatusBadge>
        </div>
      </div>

      <AgentChatPanel
        initialMessages={messages.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          createdAt: message.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
