import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { getEnv } from "@/lib/env";

export type EncryptedSecret = {
  algorithm: "aes-256-gcm";
  iv: string;
  tag: string;
  value: string;
};

function getKeyMaterial(explicitKey?: string) {
  const env = getEnv();
  return explicitKey ?? env.CREDENTIAL_ENCRYPTION_KEY ?? env.AUTH_SECRET;
}

export function isCredentialVaultConfigured(explicitKey?: string) {
  return Boolean(getKeyMaterial(explicitKey)?.trim());
}

function deriveKey(keyMaterial?: string) {
  if (!keyMaterial?.trim()) {
    throw new Error("Credential vault is not configured.");
  }

  return createHash("sha256").update(keyMaterial).digest();
}

export function encryptSecret(value: string, keyMaterial?: string): EncryptedSecret {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(keyMaterial), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);

  return {
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    value: encrypted.toString("base64"),
  };
}

export function decryptSecret(secret: EncryptedSecret, keyMaterial?: string) {
  const decipher = createDecipheriv("aes-256-gcm", deriveKey(keyMaterial), Buffer.from(secret.iv, "base64"));
  decipher.setAuthTag(Buffer.from(secret.tag, "base64"));

  return Buffer.concat([decipher.update(Buffer.from(secret.value, "base64")), decipher.final()]).toString("utf8");
}

export function maskSecret(value: string) {
  if (value.length <= 6) return "******";
  return `${value.slice(0, 3)}...${value.slice(-3)}`;
}
