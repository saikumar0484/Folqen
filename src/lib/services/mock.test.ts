import assert from "node:assert/strict";
import test from "node:test";
import { getFolqenServices } from "@/lib/services/mock";

test("mock publishing never publishes publicly", async () => {
  const services = getFolqenServices();
  const result = await services.publishing.publishPublicly({
    contentId: "content-1",
    platform: "YOUTUBE",
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, "not_connected");
  assert.match(result.message, /blocked/i);
});

test("mock posting package stays manual", async () => {
  const services = getFolqenServices();
  const result = await services.publishing.createPostingPackage({
    contentId: "content-1",
    platform: "YOUTUBE",
  });

  assert.equal(result.ok, true);
  assert.equal(result.data?.mode, "manual");
});

test("mock storage validates but does not store", async () => {
  const services = getFolqenServices();
  const validation = await services.storage.validateUpload({
    name: "script.md",
    mimeType: "text/markdown",
    sizeBytes: 100,
  });
  const storage = await services.storage.storeUpload({
    name: "script.md",
    mimeType: "text/markdown",
    sizeBytes: 100,
  });

  assert.equal(validation.ok, true);
  assert.equal(storage.ok, false);
  assert.equal(storage.status, "not_connected");
});

test("mock workflow execution remains blocked", async () => {
  const services = getFolqenServices();
  const result = await services.workflow.triggerWorkflow({
    workflowId: "publish-package",
    payload: { contentId: "content-1" },
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, "not_connected");
});
