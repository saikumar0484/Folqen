import type { CurrentUser } from "@/lib/auth/current-user";
import { canReviewApprovals } from "@/lib/auth/permissions";

export function resolveGovernanceMutationAccess(input: { user: CurrentUser | null; safetyError?: { status: number; error: string } | null }) {
  if (!input.user) {
    return { ok: false as const, status: 401, error: "Login required." };
  }

  if (!canReviewApprovals(input.user)) {
    return { ok: false as const, status: 403, error: "Only admins and operators can use governance controls." };
  }

  if (input.safetyError) {
    return { ok: false as const, status: input.safetyError.status, error: input.safetyError.error };
  }

  return { ok: true as const, user: input.user };
}

export function resolveGovernanceReadAccess(user: CurrentUser | null) {
  if (!user) {
    return { ok: false as const, status: 401, error: "Login required." };
  }

  return { ok: true as const, user };
}
