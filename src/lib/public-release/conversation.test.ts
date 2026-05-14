import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDefaultOnboardingDraft, runOnboardingConversation } from "@/lib/public-release/conversation";

describe("public release onboarding conversation", () => {
  it("maps horror channel objective to the horror template", () => {
    const result = runOnboardingConversation({
      message: "I want to grow a horror storytelling shorts channel.",
    });

    assert.equal(result.recommendedTemplate.id, "horror_shorts");
    assert.equal(result.recommendedWorkflows.length > 0, true);
    assert.equal(result.recommendedWorkforce.length > 0, true);
    assert.equal(result.followUps.length, 4);
  });

  it("builds a safe default onboarding draft", () => {
    const draft = buildDefaultOnboardingDraft("I want an AI news channel");
    assert.equal(draft.nicheTemplateId, "ai_news");
    assert.equal(draft.targetPlatforms.length > 0, true);
    assert.equal(draft.operationalProfile, "guided");
  });
});
