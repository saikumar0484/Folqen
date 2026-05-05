"use client";

import { useState } from "react";
import { Bot, ImageIcon, Maximize2, Mic, Paperclip, Send, X } from "lucide-react";

const quickCommands = ["Create content package", "Review latest draft", "Show pending approvals", "Pause automation"];

export function MiniAgentChat() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open ? (
        <section className="mb-3 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-neon/25 bg-surface/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon text-primary-foreground shadow-glow">
              <Bot className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Mini Agent</div>
              <div className="truncate text-xs text-muted-foreground">Context aware mock assistant</div>
            </div>
            <a href="/agent" className="text-muted-foreground hover:text-foreground" aria-label="Open full chat">
              <Maximize2 className="h-4 w-4" />
            </a>
            <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close chat">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 p-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-6 text-muted-foreground">
              I can draft content packages, explain blockers, review mock analytics, and show why risky actions are stopped.
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickCommands.map((command) => (
                <button
                  key={command}
                  type="button"
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 text-left text-[11px] text-muted-foreground transition hover:bg-neon/[0.08] hover:text-foreground"
                >
                  {command}
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-dashed border-white/10 p-3 text-xs text-muted-foreground">
              Voice, image, file upload, and drag/drop are placeholders until validation is implemented.
            </div>
          </div>

          <form
            className="flex items-center gap-2 border-t border-white/10 p-3"
            onSubmit={(event) => {
              event.preventDefault();
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
              placeholder="Ask Folqen..."
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-neon/40"
            />
            <button type="submit" className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neon text-primary-foreground shadow-glow" aria-label="Send">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-14 items-center gap-3 rounded-2xl bg-neon px-4 font-medium text-primary-foreground shadow-glow transition hover:brightness-110"
      >
        <Bot className="h-5 w-5" />
        Ask Folqen
        <span className="h-2 w-2 rounded-full bg-primary-foreground/80" />
      </button>
    </div>
  );
}
