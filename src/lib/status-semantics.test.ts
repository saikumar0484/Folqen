import assert from "node:assert/strict";
import test from "node:test";

import { toHonestStatus } from "@/lib/status-semantics";

test("status semantics normalize user-facing states to honest labels", () => {
  assert.equal(toHonestStatus("mock"), "Configured");
  assert.equal(toHonestStatus("LIVE"), "Configured");
  assert.equal(toHonestStatus("needs_approval"), "Needs approval");
  assert.equal(toHonestStatus("not_connected"), "Not connected");
  assert.equal(toHonestStatus("quarantined"), "Blocked");
  assert.equal(toHonestStatus("unknown_state"), "Not connected");
});
