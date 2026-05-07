"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { mutationFetch } from "@/lib/client/mutation-fetch";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await mutationFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
      aria-label="Logout"
      title="Logout"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
