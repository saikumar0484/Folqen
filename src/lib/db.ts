import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

export function classifyDatabaseConnectionError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error && typeof error.code === "string" ? error.code : undefined;
  const message = error instanceof Error ? error.message : "";

  if (code === "P1000" || /authentication failed/i.test(message)) {
    return { category: "authentication_failed", code };
  }

  if (code === "P1001" || /can't reach database server/i.test(message)) {
    return { category: "server_unreachable", code };
  }

  if (code === "P1013" || /invalid database string/i.test(message)) {
    return { category: "invalid_connection_string", code };
  }

  if (code === "P1017" || /server has closed the connection/i.test(message)) {
    return { category: "connection_closed", code };
  }

  if (/timeout|timed out/i.test(message)) {
    return { category: "timeout", code };
  }

  if (/ssl|tls|certificate/i.test(message)) {
    return { category: "ssl_or_tls", code };
  }

  return { category: "unknown", code };
}

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
  } catch (error) {
    const diagnostic = classifyDatabaseConnectionError(error);

    return {
      status: "failed" as const,
      message: "DATABASE_URL is configured, but the connection check failed.",
      diagnostic,
    };
  }
}
