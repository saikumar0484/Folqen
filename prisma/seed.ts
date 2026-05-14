import {
  ApprovalStatus,
  ConnectionStatus,
  ContentStatus,
  PlatformName,
  PrismaClient,
  ProviderStatus,
  ReviewStatus,
  RiskLevel,
  TaskStatus,
  ToolType,
  UpgradeStatus,
  UserRole,
} from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.FOLQEN_ADMIN_EMAIL?.trim().toLowerCase() || "admin@folqen.app";
  const adminPassword = process.env.FOLQEN_ADMIN_PASSWORD?.trim() || "ChangeMe123!";
  const seededAdminPasswordHash = await hashPassword(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Folqen Admin",
      role: UserRole.ADMIN,
      passwordHash: seededAdminPasswordHash,
    },
    create: {
      email: adminEmail,
      name: "Folqen Admin",
      passwordHash: seededAdminPasswordHash,
      role: UserRole.ADMIN,
    },
  });

  await prisma.setting.upsert({
    where: { key: "safety.defaults" },
    update: {
      value: {
        allowPublicPublish: false,
        requireHumanApproval: true,
        allowPaidTools: false,
        allowBrowserAutomation: false,
        defaultUploadPrivacy: "private",
      },
    },
    create: {
      key: "safety.defaults",
      value: {
        allowPublicPublish: false,
        requireHumanApproval: true,
        allowPaidTools: false,
        allowBrowserAutomation: false,
        defaultUploadPrivacy: "private",
      },
    },
  });

  await prisma.contentItem.upsert({
    where: { id: "seed-content-bhangarh" },
    update: {
      status: ContentStatus.REVIEW,
      reviewStatus: ReviewStatus.PENDING,
      safetyStatus: ReviewStatus.PENDING,
      copyrightStatus: ReviewStatus.PENDING,
    },
    create: {
      id: "seed-content-bhangarh",
      title: "Bhangarh Fort: Legend, History, and Mystery",
      format: "short_vertical_video",
      status: ContentStatus.REVIEW,
      reviewStatus: ReviewStatus.PENDING,
      safetyStatus: ReviewStatus.PENDING,
      copyrightStatus: ReviewStatus.PENDING,
      platformTargets: [PlatformName.YOUTUBE, PlatformName.INSTAGRAM, PlatformName.FACEBOOK],
      metadata: {
        niche: "India folklore",
        packageMode: "manual_posting_package",
        publicPublishing: "blocked_by_default",
      },
    },
  });

  await prisma.agentTask.upsert({
    where: { id: "seed-task-bhangarh-script" },
    update: {
      status: TaskStatus.RUNNING,
      riskLevel: RiskLevel.LOW,
    },
    create: {
      id: "seed-task-bhangarh-script",
      title: "Draft Bhangarh short script",
      description: "Create a short, factual mystery script with folklore clearly labeled as legend.",
      status: TaskStatus.RUNNING,
      riskLevel: RiskLevel.LOW,
      contentId: "seed-content-bhangarh",
      metadata: {
        owner: "mock_agent",
        nextStep: "human review",
      },
    },
  });

  await prisma.approval.upsert({
    where: { id: "seed-approval-bhangarh-review" },
    update: {
      status: ApprovalStatus.PENDING,
      riskLevel: RiskLevel.MEDIUM,
    },
    create: {
      id: "seed-approval-bhangarh-review",
      type: "content_review",
      title: "Review Bhangarh short before publishing",
      status: ApprovalStatus.PENDING,
      riskLevel: RiskLevel.MEDIUM,
      reason: "Public publishing remains blocked until human approval, safety, copyright, and review checks pass.",
      requestedBy: "mock_agent",
      contentId: "seed-content-bhangarh",
    },
  });

  const platformSeeds = [
    PlatformName.YOUTUBE,
    PlatformName.INSTAGRAM,
    PlatformName.FACEBOOK,
    PlatformName.SNAPCHAT,
    PlatformName.THREADS,
    PlatformName.SUBSTACK,
    PlatformName.LINKEDIN,
    PlatformName.BLUESKY,
    PlatformName.LEMON8,
    PlatformName.KICK,
  ];

  for (const platform of platformSeeds) {
    await prisma.platformConnection.upsert({
      where: { id: `seed-platform-${platform.toLowerCase()}` },
      update: {
        status: ConnectionStatus.NOT_CONNECTED,
      },
      create: {
        id: `seed-platform-${platform.toLowerCase()}`,
        platform,
        status: ConnectionStatus.NOT_CONNECTED,
        authMethod: "manual_package_until_configured",
        capabilities: {
          manualPostingPackage: true,
          apiUpload: false,
        },
      },
    });
  }

  const providerSeeds = [
    {
      id: "n8n-local",
      name: "n8n self-hosted on Oracle Free Tier",
      type: ToolType.WORKFLOW,
      capabilities: ["workflow_trigger"],
      costModel: "local/free",
      commercialUse: "allowed",
    },
    {
      id: "postgres-free",
      name: "Free Postgres database",
      type: ToolType.STORAGE,
      capabilities: ["relational_database"],
      costModel: "free tier",
      commercialUse: "provider dependent",
    },
    {
      id: "ffmpeg-local",
      name: "FFmpeg local render worker",
      type: ToolType.RENDER,
      capabilities: ["rendering", "local_execution"],
      costModel: "local/free",
      commercialUse: "allowed",
    },
  ];

  for (const provider of providerSeeds) {
    await prisma.providerRegistryItem.upsert({
      where: { id: provider.id },
      update: {
        status: ProviderStatus.NOT_CONNECTED,
        capabilities: provider.capabilities,
      },
      create: {
        id: provider.id,
        name: provider.name,
        type: provider.type,
        status: ProviderStatus.NOT_CONNECTED,
        version: "seed",
        capabilities: provider.capabilities,
        costModel: provider.costModel,
        commercialUse: provider.commercialUse,
      },
    });
  }

  await prisma.toolLimit.upsert({
    where: { id: "seed-tool-n8n-free-worker" },
    update: {
      usedValue: 0,
    },
    create: {
      id: "seed-tool-n8n-free-worker",
      toolId: "n8n-local",
      toolType: ToolType.WORKFLOW,
      label: "Oracle n8n workflow executions",
      limitValue: null,
      usedValue: 0,
      metadata: {
        budget: "Oracle Free Tier",
        status: "not_connected_until_webhook_configured",
      },
    },
  });

  await prisma.analyticsRecord.upsert({
    where: { id: "seed-analytics-mock-views" },
    update: {
      value: 0,
    },
    create: {
      id: "seed-analytics-mock-views",
      platform: PlatformName.YOUTUBE,
      metric: "views",
      value: 0,
      period: "seed",
      metadata: {
        source: "mock_until_platform_analytics_connected",
      },
    },
  });

  const proposal = await prisma.upgradeProposal.upsert({
    where: { id: "seed-upgrade-oracle-worker" },
    update: {
      status: UpgradeStatus.NEEDS_HUMAN_REVIEW,
    },
    create: {
      id: "seed-upgrade-oracle-worker",
      title: "Connect Oracle Free Tier n8n worker",
      summary: "Use the existing self-hosted n8n instance as Folqen's workflow worker while keeping Vercel lightweight.",
      category: "Infrastructure",
      status: UpgradeStatus.NEEDS_HUMAN_REVIEW,
      riskScore: 4,
      costScore: 1,
      benefitScore: 8,
      testingPlan: "Add webhook URL as a secret, call the Folqen n8n test endpoint, verify n8n receives a health-check event.",
      rollbackPlan: "Remove N8N_WEBHOOK_URL and N8N_WEBHOOK_SECRET from env; Folqen returns to Not connected/manual package mode.",
      requiredApproval: true,
      metadata: {
        touchesCredentials: true,
        publicPublishing: false,
        paidTools: false,
      },
    },
  });

  await prisma.researchFinding.upsert({
    where: { id: "seed-finding-vercel-worker-split" },
    update: {
      confidence: 0.8,
    },
    create: {
      id: "seed-finding-vercel-worker-split",
      proposalId: proposal.id,
      title: "Keep heavy automation outside Vercel Functions",
      summary: "Vercel is ideal for the app shell and APIs, while long-running workflows and media jobs should run on self-hosted n8n/local workers.",
      confidence: 0.8,
    },
  });

  await prisma.notification.upsert({
    where: { id: "seed-notification-deployment-plan" },
    update: {
      read: false,
    },
    create: {
      id: "seed-notification-deployment-plan",
      userId: admin.id,
      title: "Deployment plan selected",
      body: "Folqen will use Vercel for the app, a free Postgres database, and Oracle Free Tier n8n as the worker.",
      riskLevel: RiskLevel.LOW,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "seed.demo_data_created",
      target: "folqen-mvp",
      riskLevel: RiskLevel.LOW,
      metadata: {
        liveIntegrations: false,
        publicPublishing: "disabled",
        paidTools: "disabled",
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
