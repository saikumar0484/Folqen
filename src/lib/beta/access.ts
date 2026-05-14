import { randomBytes } from "crypto";
import { Prisma, UserRole } from "@prisma/client";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

const betaAccessSettingKey = "beta.access.v1";

const betaAccessStateSchema = z.object({
  disabledUserIds: z.array(z.string()).default([]),
  forcePasswordChangeUserIds: z.array(z.string()).default([]),
});

type BetaAccessState = z.infer<typeof betaAccessStateSchema>;

export type BetaUserSummary = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  disabled: boolean;
  forcePasswordChange: boolean;
};

export type CreateBetaUserInput = {
  email: string;
  name?: string;
  role?: UserRole;
  actorId: string;
};

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function uniq(values: string[]) {
  return Array.from(new Set(values));
}

async function readState(): Promise<BetaAccessState> {
  if (!hasDatabaseUrl()) {
    return { disabledUserIds: [], forcePasswordChangeUserIds: [] };
  }

  const row = await getDb().setting.findUnique({
    where: { key: betaAccessSettingKey },
    select: { value: true },
  });

  const parsed = betaAccessStateSchema.safeParse(row?.value);
  return parsed.success ? parsed.data : { disabledUserIds: [], forcePasswordChangeUserIds: [] };
}

async function writeState(next: BetaAccessState) {
  if (!hasDatabaseUrl()) return;
  await getDb().setting.upsert({
    where: { key: betaAccessSettingKey },
    create: {
      key: betaAccessSettingKey,
      value: toJsonValue(next),
    },
    update: {
      value: toJsonValue(next),
      version: { increment: 1 },
    },
  });
}

function generateTemporaryPassword() {
  return `Folqen-${randomBytes(6).toString("base64url")}!`;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function isBetaUserDisabled(userId: string) {
  const state = await readState();
  return state.disabledUserIds.includes(userId);
}

export async function requiresBetaPasswordChange(userId: string) {
  const state = await readState();
  return state.forcePasswordChangeUserIds.includes(userId);
}

export async function clearForcePasswordChange(userId: string) {
  const state = await readState();
  if (!state.forcePasswordChangeUserIds.includes(userId)) return;
  await writeState({
    ...state,
    forcePasswordChangeUserIds: state.forcePasswordChangeUserIds.filter((id) => id !== userId),
  });
}

export async function listBetaUsers(): Promise<BetaUserSummary[]> {
  if (!hasDatabaseUrl()) return [];

  const [state, users] = await Promise.all([
    readState(),
    getDb().user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    }),
  ]);

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    disabled: state.disabledUserIds.includes(user.id),
    forcePasswordChange: state.forcePasswordChangeUserIds.includes(user.id),
  }));
}

export async function createBetaUser(input: CreateBetaUserInput) {
  if (!hasDatabaseUrl()) {
    return { ok: false as const, error: "Invite management is temporarily unavailable." };
  }

  const email = normalizeEmail(input.email);
  const existing = await getDb().user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return { ok: false as const, error: "That email already has workspace access." };
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);
  const role = input.role === "OPERATOR" ? "OPERATOR" : "VIEWER";

  const user = await getDb().user.create({
    data: {
      email,
      name: input.name?.trim() || null,
      role,
      passwordHash,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
  });

  const state = await readState();
  await writeState({
    disabledUserIds: state.disabledUserIds.filter((id) => id !== user.id),
    forcePasswordChangeUserIds: uniq([...state.forcePasswordChangeUserIds, user.id]),
  });

  await createAuditLog({
    actorId: input.actorId,
    action: "beta_user.created",
    target: user.id,
    riskLevel: "MEDIUM",
    metadata: toJsonValue({
      email: user.email,
      role: user.role,
      forcePasswordChange: true,
      inviteOnly: true,
    }),
  });

  return {
    ok: true as const,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      disabled: false,
      forcePasswordChange: true,
    } satisfies BetaUserSummary,
    temporaryPassword,
  };
}

export async function setBetaUserDisabled(userId: string, disabled: boolean, actorId: string) {
  if (!hasDatabaseUrl()) {
    return { ok: false as const, error: "Invite management is temporarily unavailable." };
  }

  const user = await getDb().user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
  if (!user) return { ok: false as const, error: "We couldn't find that invite." };


  const state = await readState();
  const disabledUserIds = disabled ? uniq([...state.disabledUserIds, userId]) : state.disabledUserIds.filter((id) => id !== userId);
  await writeState({ ...state, disabledUserIds });

  await createAuditLog({
    actorId,
    action: disabled ? "beta_user.disabled" : "beta_user.enabled",
    target: userId,
    riskLevel: "MEDIUM",
    metadata: toJsonValue({
      email: user.email,
      disabled,
      inviteOnly: true,
    }),
  });

  return { ok: true as const };
}

export async function resetBetaUserPassword(userId: string, actorId: string) {
  if (!hasDatabaseUrl()) {
    return { ok: false as const, error: "Password reset is temporarily unavailable." };
  }

  const user = await getDb().user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  if (!user) return { ok: false as const, error: "We couldn't find that invite." };

  const temporaryPassword = generateTemporaryPassword();
  await getDb().user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(temporaryPassword) },
  });

  const state = await readState();
  await writeState({
    ...state,
    forcePasswordChangeUserIds: uniq([...state.forcePasswordChangeUserIds, userId]),
  });

  await createAuditLog({
    actorId,
    action: "beta_user.password_reset",
    target: userId,
    riskLevel: "HIGH",
    metadata: toJsonValue({
      email: user.email,
      forcePasswordChange: true,
      inviteOnly: true,
    }),
  });

  return { ok: true as const, temporaryPassword };
}
