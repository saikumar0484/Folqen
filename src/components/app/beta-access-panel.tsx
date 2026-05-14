"use client";

import { useEffect, useState, useTransition } from "react";
import type { UserRole } from "@prisma/client";
import { AlertTriangle, KeyRound, Plus, ShieldCheck, UserMinus, UserPlus, Users } from "lucide-react";

import { useToast } from "@/components/app/toast-provider";
import { mutationFetch } from "@/lib/client/mutation-fetch";

type BetaUserSummary = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  disabled: boolean;
  forcePasswordChange: boolean;
};

type BetaUsersResponse = {
  ok: boolean;
  users: BetaUserSummary[];
};

export function BetaAccessPanel() {
  const { toast } = useToast();
  const [users, setUsers] = useState<BetaUserSummary[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("VIEWER");
  const [createdCredential, setCreatedCredential] = useState<{ email: string; password: string } | null>(null);
  const [loading, startTransition] = useTransition();
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoadingUsers(true);
      const response = await fetch("/api/beta/users", { cache: "no-store" });
      const body = (await response.json().catch(() => null)) as BetaUsersResponse | { error?: string } | null;
      if (!alive) return;
      if (response.ok && body && "ok" in body) {
        setUsers(body.users);
      }
      setLoadingUsers(false);
    };
    void load();
    return () => {
      alive = false;
    };
  }, []);

  function updateLocalUser(userId: string, patch: Partial<BetaUserSummary>) {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, ...patch } : user)));
  }

  async function refreshUsers() {
    const response = await fetch("/api/beta/users", { cache: "no-store" });
    const body = (await response.json().catch(() => null)) as BetaUsersResponse | null;
    if (response.ok && body?.ok) {
      setUsers(body.users);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Invite-only beta access</div>
          <h2 className="mt-1 font-display text-xl font-semibold">Beta user management</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Create invite-only beta users, disable access, and reset temporary passwords. Public signup remains disabled.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl border border-neon/20 bg-neon/10 px-3 py-2 text-xs text-neon">
          <ShieldCheck className="h-4 w-4" />
          Admin/operator protected
        </span>
      </div>

      <form
        className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-[1.4fr_1fr_0.8fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          setCreatedCredential(null);
          startTransition(async () => {
            const response = await mutationFetch("/api/beta/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, name: name || undefined, role }),
            });
            const body = (await response.json().catch(() => ({}))) as { error?: string; user?: BetaUserSummary; temporaryPassword?: string };

            if (!response.ok || !body.user || !body.temporaryPassword) {
              toast({ title: "Invite failed", description: body.error ?? "Unable to create beta user.", tone: "error" });
              return;
            }

            setUsers((prev) => [body.user!, ...prev]);
            setCreatedCredential({ email: body.user.email, password: body.temporaryPassword });
            setEmail("");
            setName("");
            setRole("VIEWER");
            toast({ title: "Beta user created", description: "Temporary password generated. Share it securely.", tone: "success" });
          });
        }}
      >
        <label className="space-y-1.5">
          <span className="text-xs text-muted-foreground">Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-neon/40"
            placeholder="creator@domain.com"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs text-muted-foreground">Name (optional)</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-neon/40"
            placeholder="Creator name"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-xs text-muted-foreground">Role</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className="w-full rounded-xl border border-white/10 bg-surface px-3 py-2 text-sm outline-none focus:border-neon/40"
          >
            <option value="VIEWER">Viewer</option>
            <option value="OPERATOR">Operator</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-[42px] items-center justify-center gap-2 self-end rounded-xl bg-neon px-4 text-sm font-semibold text-black disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {loading ? "Inviting..." : "Invite"}
        </button>
      </form>

      {createdCredential ? (
        <div className="mt-4 rounded-2xl border border-amber-300/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          <div className="inline-flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            Temporary credentials (show once)
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div>Email: {createdCredential.email}</div>
            <div>Password: {createdCredential.password}</div>
            <div className="text-amber-200/90">User must change this password on first login.</div>
          </div>
        </div>
      ) : null}

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
          <Users className="h-4 w-4 text-neon" />
          Beta users
        </div>
        {loadingUsers ? (
          <div className="text-sm text-muted-foreground">Loading beta users...</div>
        ) : users.length === 0 ? (
          <div className="text-sm text-muted-foreground">No beta users yet.</div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{user.name ?? user.email}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {user.email} / {user.role}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                    {user.disabled ? <span className="rounded border border-rose-400/30 bg-rose-500/10 px-1.5 py-0.5 text-rose-200">Disabled</span> : null}
                    {user.forcePasswordChange ? (
                      <span className="rounded border border-amber-300/30 bg-amber-500/10 px-1.5 py-0.5 text-amber-100">Must change password</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.04] px-2.5 py-1.5 text-xs transition hover:bg-white/[0.08]"
                    onClick={() => {
                      startTransition(async () => {
                        const response = await mutationFetch(`/api/beta/users/${user.id}/reset-password`, { method: "POST" });
                        const body = (await response.json().catch(() => ({}))) as { error?: string; temporaryPassword?: string };
                        if (!response.ok || !body.temporaryPassword) {
                          toast({ title: "Reset failed", description: body.error ?? "Unable to reset password.", tone: "error" });
                          return;
                        }
                        updateLocalUser(user.id, { forcePasswordChange: true });
                        setCreatedCredential({ email: user.email, password: body.temporaryPassword });
                        toast({ title: "Password reset", description: "Temporary password regenerated.", tone: "success" });
                      });
                    }}
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Reset password
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.04] px-2.5 py-1.5 text-xs transition hover:bg-white/[0.08]"
                    onClick={() => {
                      startTransition(async () => {
                        const response = await mutationFetch(`/api/beta/users/${user.id}/disable`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ disabled: !user.disabled }),
                        });
                        const body = (await response.json().catch(() => ({}))) as { error?: string };
                        if (!response.ok) {
                          toast({ title: "Update failed", description: body.error ?? "Unable to update user status.", tone: "error" });
                          return;
                        }
                        await refreshUsers();
                        toast({
                          title: user.disabled ? "User enabled" : "User disabled",
                          description: user.disabled ? "Beta access restored." : "Login blocked for this account.",
                          tone: "success",
                        });
                      });
                    }}
                  >
                    {user.disabled ? <UserPlus className="h-3.5 w-3.5" /> : <UserMinus className="h-3.5 w-3.5" />}
                    {user.disabled ? "Enable" : "Disable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
