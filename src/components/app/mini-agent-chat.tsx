"use client";

import { useState } from "react";
import { Bot, ImageIcon, Loader2, Maximize2, Mic, Paperclip, Send, Sparkles, X } from "lucide-react";

const quickCommands = [
  "Create a horror shorts workflow",
  "Explain my latest draft package",
  "Show what needs approval next",
  "Improve my thumbnail prompt",
];

export function MiniAgentChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open ? (
        <section className="glass-heavy mb-3 w-[min(420px,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-white/20 shadow-[0_24px_80px_rgba(0,0,0,0.52)] md:w-[min(420px,calc(100vw-2rem))]">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon text-primary-foreground">
              <Bot className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Folqen AI Dock</div>
              <div className="truncate text-xs text-muted-foreground">Conversational-first creator guidance</div>
            </div>
            <a href="/agent" className="text-muted-foreground hover:text-foreground" aria-label="Open full chat">
              <Maximize2 className="h-4 w-4" />
            </a>
            <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close chat">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[56vh] space-y-3 overflow-auto p-4 sm:max-h-[52vh]">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-6 text-muted-foreground">
              I can guide onboarding, explain workflow results, refine scripts and thumbnails, and keep your beta run safe with clear approval boundaries.
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {quickCommands.map((command) => (
                <button
                  key={command}
                  type="button"
                  onClick={() => setMessage(command)}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 text-left text-[11px] text-muted-foreground transition hover:bg-white/[0.07] hover:text-foreground"
                >
                  {command}
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-dashed border-white/10 p-3 text-xs text-muted-foreground">
              Voice, image, and file inputs are still safe placeholders. Live browser execution, autonomous publishing, and unrestricted provider execution remain blocked.
            </div>
          </div>

          <form
            className="flex items-center gap-2 border-t border-white/10 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!message.trim()) return;
              setSending(true);
              setTimeout(() => setSending(false), 900);
              setMessage("");
            }}
          >
            <button type="button" className="text-muted-foreground" aria-label="Voice input placeholder">
              <Mic className="h-4 w-4" />
            </button>
            <button type="button" className="text-muted-foreground" aria-label="Image upload placeholder">
              <ImageIcon className="h-4 w-4" />
            </button>
            <button type="button" className="text-muted-foreground" aria-label="File upload placeholder">
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask Folqen to guide your next creator action..."
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-neon/40"
            />
            <button
              type="submit"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neon text-primary-foreground shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
              aria-label="Send"
              disabled={sending}
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </section>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-14 items-center gap-3 rounded-2xl border border-white/30 bg-[#132019]/88 px-4 font-medium text-foreground shadow-[0_12px_34px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition hover:border-neon/45 hover:bg-[#18271f]/92"
      >
        <span className="pulse-dot h-2 w-2 rounded-full bg-neon" />
        <Bot className="h-5 w-5 text-neon" />
        <span className="hidden sm:inline">Ask Folqen</span>
        <Sparkles className="h-4 w-4 text-neon sm:hidden" />
      </button>
    </div>
  );
}

