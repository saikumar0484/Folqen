import assert from "node:assert/strict";
import test from "node:test";
import { generateManualPostingPackage } from "@/lib/posting-packages";

const content = {
  id: "content-1",
  title: "Bhangarh Fort: Legend, History, and Mystery",
  format: "short_vertical_video",
  status: "REVIEW" as const,
  reviewStatus: "PENDING" as const,
  safetyStatus: "PENDING" as const,
  copyrightStatus: "PENDING" as const,
};

test("manual posting package never claims API upload", () => {
  const pkg = generateManualPostingPackage(content, "YOUTUBE");

  assert.equal(pkg.mode, "manual");
  assert.match(pkg.checklist.join(" "), /API is Not connected/i);
  assert.equal(pkg.safety.publicPublishing, "blocked_by_default");
});

test("manual posting package includes platform-specific metadata", () => {
  const pkg = generateManualPostingPackage(content, "INSTAGRAM");

  assert.equal(pkg.platformLabel, "Instagram");
  assert.ok(pkg.hashtags.includes("#Reels"));
  assert.match(pkg.description, /Review all claims/i);
});
