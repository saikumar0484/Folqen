import assert from "node:assert/strict";
import test from "node:test";
import { MAX_UPLOAD_SIZE_BYTES, validateUploadCandidate } from "@/lib/files/validation";

test("allows a supported private content file candidate", () => {
  const result = validateUploadCandidate({
    name: "bhangarh-script.md",
    mimeType: "text/markdown",
    sizeBytes: 2048,
  });

  assert.equal(result.allowed, true);
  if (result.allowed) {
    assert.equal(result.extension, ".md");
    assert.equal(result.sanitizedName, "bhangarh-script.md");
  }
});

test("blocks path traversal names", () => {
  const result = validateUploadCandidate({
    name: "../secret.env",
    mimeType: "text/plain",
    sizeBytes: 100,
  });

  assert.equal(result.allowed, false);
  if (!result.allowed) {
    assert.ok(result.reasons.some((reason) => reason.includes("path traversal")));
  }
});

test("blocks MIME and extension mismatch", () => {
  const result = validateUploadCandidate({
    name: "thumbnail.exe",
    mimeType: "image/png",
    sizeBytes: 1000,
  });

  assert.equal(result.allowed, false);
  if (!result.allowed) {
    assert.ok(result.reasons.some((reason) => reason.includes("extension")));
  }
});

test("blocks files above the MVP size limit", () => {
  const result = validateUploadCandidate({
    name: "long-render.mp4",
    mimeType: "video/mp4",
    sizeBytes: MAX_UPLOAD_SIZE_BYTES + 1,
  });

  assert.equal(result.allowed, false);
  if (!result.allowed) {
    assert.ok(result.reasons.some((reason) => reason.includes("100 MB")));
  }
});

test("blocks unsupported file types", () => {
  const result = validateUploadCandidate({
    name: "unknown.bin",
    mimeType: "application/octet-stream",
    sizeBytes: 100,
  });

  assert.equal(result.allowed, false);
  if (!result.allowed) {
    assert.ok(result.reasons.some((reason) => reason.includes("not allowed")));
  }
});
