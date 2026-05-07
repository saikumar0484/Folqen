"use client";

import { useState, useTransition } from "react";
import { Bot, Send, UserRound } from "lucide-react";
import { useToast } from "@/components/app/toast-provider";
import { mutationFetch } from "@/lib/client/mutation-fetch";

type ChatMessage = {
  id: string;
  role: string;
  content: string;
  createdAt: string | Date;
};

export function AgentChatPanel({ initialMessages }: { initialMessages: ChatMessage[] }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState(initialMessages);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isActionPending, startActionTransition] = useTransition();

  function createContentPackage() {
    const topic = content.trim() || "Indian urban legend short";
    setError(null);
    setActionMessage(null);
    startActionTransition(async () => {
      const response = await mutationFetch("/api/agent/content-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string; content?: { title: string; message: string } };

      if (!response.ok || !body.content) {
        setError(body.error ?? "Could not create draft package.");
        toast({ title: "Draft package blocked", description: body.error ?? "Could not create draft package.", tone: "error" });
        return;
      }

      setActionMessage(`${body.content.title}: ${body.content.message}`);
      toast({
        title: "Mock draft package created",
        description: "Human review is required before any public use.",
        tone: "success",
      });
      setContent("");
    });
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Persistent chat</div>
          <h2 className="mt-1 font-display text-xl font-semibold">Folqen agent conversation</h2>
          <p className="mt-2 text-sm text-muted-foreground">Messages save to Supabase. Replies are still mock until a real LLM provider is configured.</p>
        </div>

        <div className="max-h-[560px] space-y-3 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">
              No saved messages yet. Ask for a script, approval summary, or safe content package.
            </div>
          ) : null}
          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <article key={message.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser ? (
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neon text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </span>
                ) : null}
                <div className={`max-w-[82%] rounded-2xl border p-3 text-sm leading-6 ${isUser ? "border-neon/20 bg-neon/10" : "border-white/10 bg-white/[0.03]"}`}>
                  {message.content}
                </div>
                {isUser ? (
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                    <UserRound className="h-4 w-4" />
                  </span>
                ) : null}
              </article>
            );
          })}
        </div>

        <form
          className="flex gap-2 border-t border-white/10 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            const text = content.trim();
            if (!text) return;
            setError(null);
            startTransition(async () => {
              const response = await mutationFetch("/api/agent/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: text, pageContext: "agent" }),
              });
              const body = (await response.json().catch(() => ({}))) as { error?: string; messages?: ChatMessage[] };

              if (!response.ok || !body.messages) {
                setError(body.error ?? "Message failed.");
                toast({ title: "Message failed", description: body.error ?? "Message failed.", tone: "error" });
                return;
              }

              setMessages((current) => [...current, ...body.messages!]);
              toast({ title: "Agent reply saved", description: "This is still a mock-agent response.", tone: "success" });
              setContent("");
            });
          }}
        >
          <input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Ask Folqen to draft, review, summarize, or explain..."
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-neon/40"
          />
          <button type="submit" disabled={isPending} className="inline-flex items-center gap-2 rounded-xl bg-neon px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-60">
            <Send className="h-4 w-4" />
            Send
          </button>
        </form>
        {error ? <p className="px-5 pb-4 text-sm text-rose-200">{error}</p> : null}
      </div>

      <aside className="space-y-3">
        <button
          type="button"
          onClick={createContentPackage}
          disabled={isActionPending}
          className="w-full rounded-2xl border border-neon/30 bg-neon/10 p-4 text-left text-sm text-neon transition hover:bg-neon/[0.14] disabled:opacity-60"
        >
          {isActionPending ? "Creating draft..." : "Create draft package from typed topic"}
        </button>
        {actionMessage ? <div className="rounded-2xl border border-neon/20 bg-neon/10 p-4 text-xs leading-5 text-neon">{actionMessage}</div> : null}
        {["Create content package", "Review latest draft", "Show pending approvals", "Explain analytics"].map((command) => (
          <button
            key={command}
            type="button"
            onClick={() => setContent(command)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left text-sm text-muted-foreground transition hover:bg-neon/[0.08] hover:text-foreground"
          >
            {command}
          </button>
        ))}
        <div className="rounded-2xl border border-dashed border-white/10 p-4 text-xs leading-5 text-muted-foreground">
          Voice, image, and file inputs remain placeholders until upload validation is built.
        </div>
      </aside>
    </section>
  );
}
