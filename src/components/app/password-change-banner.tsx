import Link from "next/link";
import { AlertTriangle, KeyRound } from "lucide-react";
import type { CurrentUser } from "@/lib/auth/current-user";

export function PasswordChangeBanner({ user }: { user: CurrentUser }) {
  if (!user.requiresPasswordChange) return null;

  return (
    <div className="mx-auto mt-4 w-full max-w-[1640px] rounded-2xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-300" />
          <span>Your workspace invite used a temporary password. Update it once to keep your account secure.</span>
        </div>
        <Link href="/settings" className="inline-flex items-center gap-2 rounded-lg border border-amber-300/30 bg-black/20 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:bg-black/35">
          <KeyRound className="h-3.5 w-3.5" />
          Update password
        </Link>
      </div>
    </div>
  );
}
