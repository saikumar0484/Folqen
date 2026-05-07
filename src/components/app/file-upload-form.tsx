"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { UploadCloud } from "lucide-react";

export function FileUploadForm({ accept }: { accept: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [tags, setTags] = useState("research,draft");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    const file = inputRef.current?.files?.[0];
    setMessage(null);
    setError(null);

    if (!file) {
      setError("Choose a file first.");
      return;
    }

    startTransition(async () => {
      const body = new FormData();
      body.append("file", file);
      body.append("tags", tags);

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body,
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string; reasons?: string[]; file?: { name: string; binaryStored: boolean } };

      if (!response.ok || !result.file) {
        setError([result.error, ...(result.reasons ?? [])].filter(Boolean).join(" "));
        return;
      }

      setMessage(`${result.file.name} registered privately. Binary storage is still Not connected.`);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    });
  }

  return (
    <div className="rounded-3xl border border-neon/20 bg-neon/[0.06] p-4">
      <div className="flex items-center gap-2">
        <UploadCloud className="h-4 w-4 text-neon" />
        <h2 className="font-display text-lg font-semibold">Register upload</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Files are validated and tracked privately in Supabase. Binary object storage remains Not connected until Supabase Storage is configured.
      </p>
      <div className="mt-4 space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="block w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-neon file:px-3 file:py-2 file:text-xs file:font-medium file:text-primary-foreground"
        />
        <input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="Tags, comma separated"
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-neon/40"
        />
        <button
          type="button"
          disabled={isPending}
          onClick={submit}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neon px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-60"
        >
          <UploadCloud className="h-4 w-4" />
          {isPending ? "Checking..." : "Validate and register"}
        </button>
        {message ? <p className="rounded-xl border border-neon/20 bg-neon/10 p-3 text-xs leading-5 text-neon">{message}</p> : null}
        {error ? <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-xs leading-5 text-rose-200">{error}</p> : null}
      </div>
    </div>
  );
}
