import assert from "node:assert/strict";
import test from "node:test";
import type { CurrentUser } from "@/lib/auth/current-user";
import { canCreateDraftContent, canCreatePostingPackage, canManageSystem, canReviewApprovals, describeRoleLimit } from "@/lib/auth/permissions";

function user(role: CurrentUser["role"]): CurrentUser {
  return {
    id: role.toLowerCase(),
    email: `${role.toLowerCase()}@folqen.app`,
    name: role,
    role,
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

test("role limit messages are explicit", () => {
  assert.match(describeRoleLimit(user("VIEWER"), "approval") ?? "", /admins and operators/i);
  assert.match(describeRoleLimit(user("VIEWER"), "posting_package") ?? "", /posting packages/i);
  assert.match(describeRoleLimit(user("VIEWER"), "draft_content") ?? "", /draft content/i);
  assert.match(describeRoleLimit(user("OPERATOR"), "settings") ?? "", /admins/i);
  assert.equal(describeRoleLimit(user("ADMIN"), "settings"), null);
});
