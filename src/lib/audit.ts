import type { Prisma, RiskLevel } from "@prisma/client";
import { getDb, hasDatabaseUrl } from "@/lib/db";

type AuditInput = {
  actorId?: string | null;
  action: string;
  target?: string | null;
  riskLevel?: RiskLevel;
  metadata?: Prisma.InputJsonValue;
};

export async function createAuditLog({ actorId, action, target, riskLevel = "LOW", metadata }: AuditInput) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  return getDb().auditLog.create({
    data: {
      actorId,
      action,
      target,
      riskLevel,
      metadata,
    },
  });
}
