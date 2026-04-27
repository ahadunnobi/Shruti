/**
 * Prompt 26 — AES-256-GCM field-level encryption
 * ================================================
 * Uses Node.js built-in `crypto` module — zero extra dependencies.
 *
 * Algorithm choice:
 *   AES-256-GCM   ← authenticated encryption (AEAD)
 *                    Provides confidentiality + integrity + tamper detection.
 *                    The `authTag` prevents bit-flipping attacks that plain
 *                    AES-256-CBC cannot detect.
 *
 * Stored format (base64-encoded, colon-separated):
 *   <iv_hex>:<authTag_hex>:<ciphertext_hex>
 *
 * Setup — add to .env.local:
 *   ENCRYPTION_KEY=<64 hex chars = 32 bytes>
 *
 * Generate a key:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES   = 12;   // 96-bit IV — recommended for GCM
const TAG_BYTES  = 16;   // 128-bit auth tag — GCM default

// ── Key loading ───────────────────────────────────────────────────────────────
function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY ?? "";
  if (hex.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be a 64-character hex string (32 bytes). " +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(hex, "hex");
}

// ── Encrypt ───────────────────────────────────────────────────────────────────
/**
 * Encrypts a plain-text string.
 * Returns a storable string in the format: `<iv>:<authTag>:<ciphertext>` (hex).
 */
export function encrypt(plaintext: string): string {
  const key    = getKey();
  const iv     = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final()
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex")
  ].join(":");
}

// ── Decrypt ───────────────────────────────────────────────────────────────────
/**
 * Decrypts a value produced by `encrypt()`.
 * Throws if the ciphertext has been tampered with (authTag mismatch).
 */
export function decrypt(stored: string): string {
  const parts = stored.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted value format — expected iv:authTag:ciphertext");
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;
  const key      = getKey();
  const iv       = Buffer.from(ivHex, "hex");
  const authTag  = Buffer.from(authTagHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, "hex")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}

// ── Convenience helpers ───────────────────────────────────────────────────────
/**
 * Returns true when a string looks like an encrypted value
 * (produced by this module). Safe to call even on plain strings.
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(":");
  return (
    parts.length === 3 &&
    parts[0].length === IV_BYTES * 2 &&
    parts[1].length === TAG_BYTES * 2
  );
}

/**
 * Encrypt only if the value is not already encrypted.
 * Useful for idempotent migrations on existing data.
 */
export function encryptIfNeeded(value: string): string {
  return isEncrypted(value) ? value : encrypt(value);
}
