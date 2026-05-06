import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getDb() {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!prisma) {
    prisma = new PrismaClient();
  }

  return prisma;
}

export async function getDatabaseStatus() {
  if (!hasDatabaseUrl()) {
    return {
      status: "not_connected" as const,
      message: "DATABASE_URL is not configured.",
    };
  }

  try {
    await getDb().$queryRaw`SELECT 1`;

    return {
      status: "live" as const,
      message: "Database connection check passed.",
    };
  } catch {
    return {
      status: "failed" as const,
      message: "DATABASE_URL is configured, but the connection check failed.",
    };
  }
}
