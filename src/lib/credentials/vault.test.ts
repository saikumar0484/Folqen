import assert from "node:assert/strict";
import test from "node:test";
import { decryptSecret, encryptSecret, isCredentialVaultConfigured, maskSecret } from "@/lib/credentials/vault";

test("credential vault encrypts and decrypts without exposing plaintext", () => {
  const key = "test-vault-key-material";
  const secret = encryptSecret("super-secret-value", key);

  assert.notEqual(secret.value, "super-secret-value");
  assert.equal(decryptSecret(secret, key), "super-secret-value");
});

test("credential vault detects configured key material", () => {
  assert.equal(isCredentialVaultConfigured("abc"), true);
  assert.equal(isCredentialVaultConfigured(""), false);
});

test("credential masking avoids full secret exposure", () => {
  assert.equal(maskSecret("short"), "******");
  assert.equal(maskSecret("sk-test-secret"), "sk-...ret");
});
