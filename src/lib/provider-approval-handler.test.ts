import { ApprovalStatus } from "@prisma/client";
import assert from "node:assert/strict";
import test from "node:test";
import type { CurrentUser } from "@/lib/auth/current-user";
import { type ApprovalRecord, requestProviderApproval } from "@/lib/provider-approval-handler";

function user(role: CurrentUser["role"]): CurrentUser {
  return {
    id: `${role.toLowerCase()}-user`,
    email: `${role.toLowerCase()}@example.com`,
    name: role,
    role,
  };
}

function createFakeDb(existingApproval: ApprovalRecord | null = null) {
  const calls = {
    findFirst: 0,
    create: 0,
    audit: 0,
    createdData: undefined as unknown,
    auditData: undefined as unknown,
  };

  return {
    calls,
    getDb: () => ({
      approval: {
        async findFirst() {
          calls.findFirst += 1;
          return existingApproval;
        },
        async create(input: { data: unknown }) {
          calls.create += 1;
          calls.createdData = input.data;
          return {
            ...(input.data as object),
            id: "approval-1",
            status: ApprovalStatus.PENDING,
          } as ApprovalRecord;
        },
      },
    }),
    async createAuditLog(input: unknown) {
      calls.audit += 1;
      calls.auditData = input;
    },
  };
}

test("provider approval request blocks anonymous users", async () => {
  const fake = createFakeDb();
  const result = await requestProviderApproval({
    user: null,
    body: { requestType: "openai_paid_agent" },
    getDb: fake.getDb,
    createAuditLog: fake.createAuditLog,
  });

  assert.equal(result.status, 401);
  assert.equal(fake.calls.findFirst, 0);
  assert.equal(fake.calls.create, 0);
  assert.equal(fake.calls.audit, 0);
});

test("provider approval request blocks viewers", async () => {
  const fake = createFakeDb();
  const result = await requestProviderApproval({
    user: user("VIEWER"),
    body: { requestType: "google_drive_storage" },
    getDb: fake.getDb,
    createAuditLog: fake.createAuditLog,
  });

  assert.equal(result.status, 403);
  assert.equal(fake.calls.findFirst, 0);
  assert.equal(fake.calls.create, 0);
  assert.equal(fake.calls.audit, 0);
});

test("provider approval request creates admin approval without secrets", async () => {
  const fake = createFakeDb();
  const result = await requestProviderApproval({
    user: user("ADMIN"),
    body: { requestType: "n8n_workflow_access" },
    getDb: fake.getDb,
    createAuditLog: fake.createAuditLog,
  });

  assert.equal(result.status, 200);
  assert.equal(fake.calls.findFirst, 1);
  assert.equal(fake.calls.create, 1);
  assert.equal(fake.calls.audit, 1);
  assert.deepEqual(JSON.stringify(fake.calls.createdData).includes("secret-value"), false);
  assert.match(JSON.stringify(fake.calls.createdData), /secretsIncluded":false/);
});

test("provider approval request reuses duplicate pending approval", async () => {
  const existing = {
    id: "existing-approval",
    type: "provider_setup",
    title: "Enable approval-gated OpenAI agent calls",
    status: ApprovalStatus.PENDING,
    riskLevel: "HIGH" as const,
  };
  const fake = createFakeDb(existing);
  const result = await requestProviderApproval({
    user: user("ADMIN"),
    body: { requestType: "openai_paid_agent" },
    getDb: fake.getDb,
    createAuditLog: fake.createAuditLog,
  });

  assert.equal(result.status, 200);
  assert.equal(fake.calls.findFirst, 1);
  assert.equal(fake.calls.create, 0);
  assert.equal(fake.calls.audit, 0);
  assert.match(JSON.stringify(result.body), /duplicate":true/);
});

test("provider approval request rejects invalid request types", async () => {
  const fake = createFakeDb();
  const result = await requestProviderApproval({
    user: user("ADMIN"),
    body: { requestType: "not_real" },
    getDb: fake.getDb,
    createAuditLog: fake.createAuditLog,
  });

  assert.equal(result.status, 400);
  assert.equal(fake.calls.findFirst, 0);
  assert.equal(fake.calls.create, 0);
});
