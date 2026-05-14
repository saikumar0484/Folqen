import assert from "node:assert/strict";
import test from "node:test";
import { classifyDatabaseConnectionError } from "@/lib/db";

test("database diagnostics classify common Prisma connection failures without raw messages", () => {
  assert.deepEqual(classifyDatabaseConnectionError({ code: "P1000", message: "Authentication failed" }), {
    category: "authentication_failed",
    code: "P1000",
  });
  assert.deepEqual(classifyDatabaseConnectionError({ code: "P1001", message: "Can't reach database server" }), {
    category: "server_unreachable",
    code: "P1001",
  });
  assert.deepEqual(classifyDatabaseConnectionError(new Error("Timed out fetching a new connection")), {
    category: "timeout",
    code: undefined,
  });
});
