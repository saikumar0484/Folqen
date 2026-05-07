import { getDb } from "@/lib/db";
import { getConnectionDefinition, type ConnectionProviderId } from "@/lib/connections/definitions";
import { decryptSecret, encryptSecret, isCredentialVaultConfigured, maskSecret, type EncryptedSecret } from "@/lib/credentials/vault";

type StoredCredentialValue = {
  provider: ConnectionProviderId;
  nonSecretValues: Record<string, string>;
  secrets: Record<string, EncryptedSecret>;
  secretPreview: Record<string, string>;
  updatedAt: string;
  updatedBy: string;
};

function settingKey(provider: ConnectionProviderId) {
  return `connection.credentials.${provider}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isStoredCredentialValue(value: unknown): value is StoredCredentialValue {
  return isRecord(value) && typeof value.provider === "string" && isRecord(value.nonSecretValues) && isRecord(value.secrets);
}

export function assertCredentialVaultReady() {
  if (!isCredentialVaultConfigured()) {
    throw new Error("Credential vault is not configured. Configure AUTH_SECRET or CREDENTIAL_ENCRYPTION_KEY before saving provider secrets.");
  }
}

export async function saveConnectionCredentials({
  provider,
  values,
  actorEmail,
}: {
  provider: ConnectionProviderId;
  values: Record<string, string>;
  actorEmail: string;
}) {
  const definition = getConnectionDefinition(provider);

  if (!definition) {
    throw new Error("Unknown provider.");
  }

  assertCredentialVaultReady();

  const nonSecretValues: Record<string, string> = {};
  const secrets: Record<string, EncryptedSecret> = {};
  const secretPreview: Record<string, string> = {};

  for (const field of definition.fields) {
    const value = values[field.name]?.trim() ?? "";

    if (field.required && !value) {
      throw new Error(`${field.label} is required.`);
    }

    if (!value) continue;

    if (field.secret) {
      secrets[field.name] = encryptSecret(value);
      secretPreview[field.name] = maskSecret(value);
    } else {
      nonSecretValues[field.name] = value;
    }
  }

  const stored: StoredCredentialValue = {
    provider,
    nonSecretValues,
    secrets,
    secretPreview,
    updatedAt: new Date().toISOString(),
    updatedBy: actorEmail,
  };

  await getDb().setting.upsert({
    where: { key: settingKey(provider) },
    create: { key: settingKey(provider), value: stored },
    update: { value: stored, version: { increment: 1 } },
  });

  return {
    provider,
    storedSecretFields: Object.keys(secrets),
    storedNonSecretFields: Object.keys(nonSecretValues),
  };
}

export async function getConnectionCredentials(provider: ConnectionProviderId) {
  const record = await getDb().setting.findUnique({ where: { key: settingKey(provider) } });

  if (!isStoredCredentialValue(record?.value)) {
    return null;
  }

  const secrets = Object.fromEntries(Object.entries(record.value.secrets).map(([key, value]) => [key, decryptSecret(value as EncryptedSecret)]));

  return {
    provider,
    values: {
      ...record.value.nonSecretValues,
      ...secrets,
    },
    secretPreview: record.value.secretPreview,
    updatedAt: record.value.updatedAt,
  };
}
