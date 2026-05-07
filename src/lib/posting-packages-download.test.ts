import assert from "node:assert/strict";
import test from "node:test";
import { ContentStatus, PlatformName, ReviewStatus } from "@prisma/client";
import { createPostingPackageDownload, generateManualPostingPackage, isManualPostingPackage } from "@/lib/posting-packages";

const content = {
  id: "seed-content",
  title: "Bhangarh Fort: Legend, History, and Mystery",
  format: "short_vertical_video",
  status: ContentStatus.REVIEW,
  reviewStatus: ReviewStatus.PENDING,
  safetyStatus: ReviewStatus.PENDING,
  copyrightStatus: ReviewStatus.PENDING,
};

test("manual posting package metadata is recognizable", () => {
  const pkg = generateManualPostingPackage(content, PlatformName.YOUTUBE);

  assert.equal(isManualPostingPackage(pkg), true);
  assert.equal(isManualPostingPackage({ ...pkg, safety: { publicPublishing: "enabled" } }), false);
});

test("download body stays manual and explicit", () => {
  const pkg = generateManualPostingPackage(content, PlatformName.INSTAGRAM);
  const download = createPostingPackageDownload(pkg);
  const body = JSON.parse(download.body) as { mode: string; folqenNotice: string; platform: string };

  assert.match(download.filename, /^instagram-/);
  assert.equal(body.mode, "manual");
  assert.equal(body.platform, "INSTAGRAM");
  assert.match(body.folqenNotice, /does not publish/i);
});
