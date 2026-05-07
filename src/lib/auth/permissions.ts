import type { CurrentUser } from "@/lib/auth/current-user";

export function canManageSystem(user: CurrentUser) {
  return user.role === "ADMIN";
}

export function canReviewApprovals(user: CurrentUser) {
  return user.role === "ADMIN" || user.role === "OPERATOR";
}

export function canCreatePostingPackage(user: CurrentUser) {
  return user.role === "ADMIN" || user.role === "OPERATOR";
}

export function describeRoleLimit(user: CurrentUser, action: "approval" | "posting_package" | "settings") {
  if (action === "settings" && !canManageSystem(user)) {
    return "Only admins can change system settings.";
  }

  if (action === "approval" && !canReviewApprovals(user)) {
    return "Only admins and operators can review approvals.";
  }

  if (action === "posting_package" && !canCreatePostingPackage(user)) {
    return "Only admins and operators can create posting packages.";
  }

  return null;
}
