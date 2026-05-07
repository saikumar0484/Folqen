"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ConfirmDialog() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button variant="outline" onClick={() => setOpen(true)}>Open Confirm Dialog</Button>
      {open && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"><div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-5"><h3 className="font-semibold">Confirm risky action</h3><p className="mt-2 text-sm text-zinc-400">This is a placeholder approval modal. No real action is executed.</p><div className="mt-4 flex justify-end gap-2"><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Confirm</Button></div></div></div>}
    </div>
  );
}
