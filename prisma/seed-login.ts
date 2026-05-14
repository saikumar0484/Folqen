import { Prisma, PrismaClient, UserRole } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

function toJsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function main() {
  const adminEmail = process.env.FOLQEN_ADMIN_EMAIL?.trim().toLowerCase() || "admin@folqen.app";
  const adminPassword = process.env.FOLQEN_ADMIN_PASSWORD?.trim() || "ChangeMe123!";
  const adminName = process.env.FOLQEN_ADMIN_NAME?.trim() || "Folqen Admin";

  const passwordHash = await hashPassword(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: UserRole.ADMIN,
      passwordHash,
    },
    create: {
      email: adminEmail,
      name: adminName,
      role: UserRole.ADMIN,
      passwordHash,
    },
    select: { id: true, email: true },
  });

  await prisma.setting.upsert({
    where: { key: "safety.defaults" },
    update: {
      value: toJsonValue({
        allowPublicPublish: false,
        requireHumanApproval: true,
        allowPaidTools: false,
        allowBrowserAutomation: false,
        defaultUploadPrivacy: "private",
      }),
    },
    create: {
      key: "safety.defaults",
      value: toJsonValue({
        allowPublicPublish: false,
        requireHumanApproval: true,
        allowPaidTools: false,
        allowBrowserAutomation: false,
        defaultUploadPrivacy: "private",
      }),
    },
  });

  await prisma.setting.upsert({
    where: { key: "beta.access.v1" },
    update: {
      value: toJsonValue({
        disabledUserIds: [],
        forcePasswordChangeUserIds: [],
      }),
    },
    create: {
      key: "beta.access.v1",
      value: toJsonValue({
        disabledUserIds: [],
        forcePasswordChangeUserIds: [],
      }),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "auth.login_bootstrap_completed",
      target: admin.email,
      riskLevel: "LOW",
      metadata: toJsonValue({
        inviteOnly: true,
        safeDefaultsApplied: true,
      }),
    },
  });

  console.log(`Folqen login bootstrap complete for ${admin.email}`);
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

