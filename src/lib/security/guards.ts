export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired" | "not_required";
export type ReviewStatus = "pending" | "passed" | "failed";
export type CopyrightStatus = "unknown" | "clear" | "blocked" | "needs_review";
export type ContentSafetyStatus = "pending" | "passed" | "failed";

export type GuardResult = {
  allowed: boolean;
  reasons: string[];
};

export type PublishingGuardInput = {
  settings?: {
    allowPublicPublish?: boolean;
    requireHumanApproval?: boolean;
  };
  approvalStatus?: ApprovalStatus;
  contentSafetyStatus?: ContentSafetyStatus;
  copyrightStatus?: CopyrightStatus;
  reviewStatus?: ReviewStatus;
};

export type PaidToolGuardInput = {
  settings?: {
    allowPaidTools?: boolean;
  };
  approvalStatus?: ApprovalStatus;
};

export type UpgradeGuardInput = {
  settings?: {
    autoExecuteUpgrades?: boolean;
    requireUpgradeApproval?: boolean;
    allowPaidTools?: boolean;
  };
  approvalStatus?: ApprovalStatus;
  touchesPaidTool?: boolean;
  hasTestingPlan?: boolean;
  hasRollbackPlan?: boolean;
};

function result(reasons: string[]): GuardResult {
  return {
    allowed: reasons.length === 0,
    reasons,
  };
}

export function canPublishPublicly(input: PublishingGuardInput = {}): GuardResult {
  const reasons: string[] = [];
  const settings = input.settings ?? {};

  if (settings.allowPublicPublish !== true) {
    reasons.push("Public publishing is disabled by default.");
  }

  if (settings.requireHumanApproval !== true) {
    reasons.push("Human approval must remain required for public publishing.");
  }

  if (input.approvalStatus !== "approved") {
    reasons.push("Human approval status is not approved.");
  }

  if (input.contentSafetyStatus !== "passed") {
    reasons.push("Content safety review has not passed.");
  }

  if (input.copyrightStatus !== "clear") {
    reasons.push("Copyright status is not clear.");
  }

  if (input.reviewStatus !== "passed") {
    reasons.push("Editorial review has not passed.");
  }

  return result(reasons);
}

export function canUsePaidTool(input: PaidToolGuardInput = {}): GuardResult {
  const reasons: string[] = [];

  if (input.settings?.allowPaidTools !== true) {
    reasons.push("Paid tools are disabled by default.");
  }

  if (input.approvalStatus !== "approved") {
    reasons.push("Human approval status is not approved.");
  }

  return result(reasons);
}

export function canExecuteUpgrade(input: UpgradeGuardInput = {}): GuardResult {
  const reasons: string[] = [];
  const settings = input.settings ?? {};

  if (settings.autoExecuteUpgrades !== true) {
    reasons.push("Automatic upgrade execution is disabled by default.");
  }

  if (settings.requireUpgradeApproval !== true) {
    reasons.push("Upgrade approval must remain required.");
  }

  if (input.approvalStatus !== "approved") {
    reasons.push("Upgrade approval status is not approved.");
  }

  if (input.hasTestingPlan !== true) {
    reasons.push("Upgrade testing plan is missing.");
  }

  if (input.hasRollbackPlan !== true) {
    reasons.push("Upgrade rollback plan is missing.");
  }

  if (input.touchesPaidTool === true && settings.allowPaidTools !== true) {
    reasons.push("Paid-tool upgrades require paid-tool permission.");
  }

  return result(reasons);
}
