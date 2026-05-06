import type { CurrentUser } from "@/lib/auth/current-user";

export function canManageSystem(user: CurrentUser) {
  return user.role === "ADMIN";
}

export function canReviewApprovals(user: CurrentUser) {
  return user.role === "ADMIN" || user.role === "OPERATOR";
}
