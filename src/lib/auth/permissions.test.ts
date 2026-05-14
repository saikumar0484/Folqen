import assert from "node:assert/strict";
import test from "node:test";
import type { CurrentUser } from "@/lib/auth/current-user";
import { canCreateDraftContent, canCreatePostingPackage, canManageBetaAccess, canManageSystem, canOperateWorkspaces, canReviewApprovals, describeRoleLimit } from "@/lib/auth/permissions";

function user(role: CurrentUser["role"]): CurrentUser {
  return {
    id: role.toLowerCase(),
    email: `${role.toLowerCase()}@folqen.app`,
    name: role,
    role,
    requiresPasswordChange: false,
  };
}

test("only admins can manage system settings", () => {
  assert.equal(canManageSystem(user("ADMIN")), true);
  assert.equal(canManageSystem(user("OPERATOR")), false);
  assert.equal(canManageSystem(user("VIEWER")), false);
});

test("admins and operators can review approvals", () => {
  assert.equal(canReviewApprovals(user("ADMIN")), true);
  assert.equal(canReviewApprovals(user("OPERATOR")), true);
  assert.equal(canReviewApprovals(user("VIEWER")), false);
});

test("admins and operators can create posting packages", () => {
  assert.equal(canCreatePostingPackage(user("ADMIN")), true);
  assert.equal(canCreatePostingPackage(user("OPERATOR")), true);
  assert.equal(canCreatePostingPackage(user("VIEWER")), false);
});

test("admins and operators can create draft content", () => {
  assert.equal(canCreateDraftContent(user("ADMIN")), true);
  assert.equal(canCreateDraftContent(user("OPERATOR")), true);
  assert.equal(canCreateDraftContent(user("VIEWER")), false);
});

test("workspace operations are available to all signed-in beta users", () => {
  assert.equal(canOperateWorkspaces(user("ADMIN")), true);
  assert.equal(canOperateWorkspaces(user("OPERATOR")), true);
  assert.equal(canOperateWorkspaces(user("VIEWER")), true);
});

test("beta access controls are restricted to admins and operators", () => {
  assert.equal(canManageBetaAccess(user("ADMIN")), true);
  assert.equal(canManageBetaAccess(user("OPERATOR")), true);
  assert.equal(canManageBetaAccess(user("VIEWER")), false);
});

test("role limit messages are explicit", () => {
  assert.match(describeRoleLimit(user("VIEWER"), "approval") ?? "", /admins and operators/i);
  assert.match(describeRoleLimit(user("VIEWER"), "posting_package") ?? "", /posting packages/i);
  assert.match(describeRoleLimit(user("VIEWER"), "draft_content") ?? "", /draft content/i);
  assert.match(describeRoleLimit(user("OPERATOR"), "settings") ?? "", /admins/i);
  assert.equal(describeRoleLimit(user("ADMIN"), "settings"), null);
});
