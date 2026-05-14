import { createHash, randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { createAuditLog } from "@/lib/audit";
import { clearForcePasswordChange } from "@/lib/beta/access";
import { getDb, hasDatabaseUrl } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

const passwordResetSettingKey = "auth.password_reset.v1";
const resetWindowMs = 60 * 60 * 1000;

const resetStateSchema = z.object({
  tickets: z
    .array(
      z.object({
        tokenHash: z.string(),
        userId: z.string(),
        expiresAt: z.number(),
        usedAt: z.number().nullable().default(null),
      }),
    )
    .default([]),
});

type ResetState = z.infer<typeof resetStateSchema>;

function toJsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createToken() {
  return randomBytes(24).toString("base64url");
}

async function readState() {
  if (!hasDatabaseUrl()) {
    return { tickets: [] } satisfies ResetState;
  }

  const row = await getDb().setting.findUnique({
    where: { key: passwordResetSettingKey },
    select: { value: true },
  });
  const parsed = resetStateSchema.safeParse(row?.value);
  return parsed.success ? parsed.data : ({ tickets: [] } satisfies ResetState);
}

async function writeState(state: ResetState) {
  if (!hasDatabaseUrl()) return;

  await getDb().setting.upsert({
    where: { key: passwordResetSettingKey },
    create: {
      key: passwordResetSettingKey,
      value: toJsonValue(state),
    },
    update: {
      value: toJsonValue(state),
      version: { increment: 1 },
    },
  });
}

function pruneTickets(state: ResetState) {
  const now = Date.now();
  return {
    tickets: state.tickets.filter((ticket) => ticket.expiresAt > now && ticket.usedAt === null),
  } satisfies ResetState;
}

export async function requestPasswordReset(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const dbConnected = hasDatabaseUrl();

  if (!dbConnected) {
    return { ok: true as const, status: "accepted" as const };
  }

  const user = await getDb().user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true },
  });

  if (!user) {
    await createAuditLog({
      action: "auth.password_reset_requested_unknown_email",
      target: normalizedEmail,
      riskLevel: "LOW",
      metadata: toJsonValue({ inviteOnlyBeta: true }),
    });
    return { ok: true as const, status: "accepted" as const };
  }

  const token = createToken();
  const tokenHash = hashToken(token);
  const expiresAt = Date.now() + resetWindowMs;

  const state = pruneTickets(await readState());
  const nextState: ResetState = {
    tickets: [
      ...state.tickets.filter((ticket) => ticket.userId !== user.id),
      { tokenHash, userId: user.id, expiresAt, usedAt: null },
    ],
  };
  await writeState(nextState);

  await createAuditLog({
    actorId: user.id,
    action: "auth.password_reset_requested",
    target: user.email,
    riskLevel: "MEDIUM",
    metadata: toJsonValue({ expiresAt }),
  });

  return {
    ok: true as const,
    status: "accepted" as const,
    resetLinkPath: `/reset-password?token=${encodeURIComponent(token)}`,
  };
}

export async function resetPasswordWithToken(input: { token: string; newPassword: string }) {
  if (!hasDatabaseUrl()) {
    return { ok: false as const, reason: "unavailable" as const };
  }

  const tokenHash = hashToken(input.token);
  const state = pruneTickets(await readState());
  const ticket = state.tickets.find((item) => item.tokenHash === tokenHash);

  if (!ticket) {
    return { ok: false as const, reason: "invalid_or_expired" as const };
  }

  const user = await getDb().user.findUnique({
    where: { id: ticket.userId },
    select: { id: true, email: true },
  });

  if (!user) {
    return { ok: false as const, reason: "invalid_or_expired" as const };
  }

  await getDb().user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(input.newPassword),
    },
  });

  await clearForcePasswordChange(user.id);

  await writeState({
    tickets: state.tickets.map((item) => (item.tokenHash === tokenHash ? { ...item, usedAt: Date.now() } : item)),
  });

  await createAuditLog({
    actorId: user.id,
    action: "auth.password_reset_completed",
    target: user.email,
    riskLevel: "MEDIUM",
    metadata: toJsonValue({ resetViaToken: true }),
  });

  return { ok: true as const };
}
