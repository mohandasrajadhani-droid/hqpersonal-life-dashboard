import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Master Encryption Key management
const DATA_DIR = path.join(process.cwd(), 'data');
const KEY_FILE = path.join(DATA_DIR, '.encryption_key');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
  }
}

/**
 * Returns a 32-byte (256-bit) master encryption key.
 * Prioritizes process.env.ENCRYPTION_SECRET if provided.
 * Otherwise, loads or securely generates a persistent random 32-byte key in data/.encryption_key.
 */
export function getMasterEncryptionKey(): Buffer {
  if (process.env.ENCRYPTION_SECRET && process.env.ENCRYPTION_SECRET.length >= 16) {
    return crypto.createHash('sha256').update(process.env.ENCRYPTION_SECRET).digest();
  }

  ensureDataDir();
  if (fs.existsSync(KEY_FILE)) {
    try {
      const raw = fs.readFileSync(KEY_FILE, 'utf8').trim();
      if (raw.length === 64) {
        return Buffer.from(raw, 'hex');
      }
    } catch {
      // Fall through to generate new key
    }
  }

  const newKey = crypto.randomBytes(32);
  try {
    fs.writeFileSync(KEY_FILE, newKey.toString('hex'), { mode: 0o600 });
  } catch (err) {
    console.error('Warning: could not write encryption key file, using in-memory key', err);
  }
  return newKey;
}

/**
 * Encrypt arbitrary string with AES-256-GCM.
 * Output includes IV (12 bytes), Auth Tag (16 bytes), and Ciphertext.
 */
export interface EncryptedPayload {
  iv: string; // hex
  tag: string; // hex
  data: string; // hex
}

export function encryptAES256GCM(plaintext: string): EncryptedPayload {
  const key = getMasterEncryptionKey();
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    data: encrypted,
  };
}

/**
 * Decrypt an AES-256-GCM payload.
 * Throws an error if ciphertext or tag was tampered with.
 */
export function decryptAES256GCM(payload: EncryptedPayload): string {
  const key = getMasterEncryptionKey();
  const iv = Buffer.from(payload.iv, 'hex');
  const tag = Buffer.from(payload.tag, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(payload.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * OWASP-compliant password hashing using scrypt with random 16-byte salt.
 * Result format: scrypt$16384$8$1$<salt_hex>$<derived_key_hex>
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const cost = 16384;
  const blockSize = 8;
  const parallel = 1;
  const keyLen = 64;

  const derived = crypto.scryptSync(password, salt, keyLen, {
    N: cost,
    r: blockSize,
    p: parallel,
    maxmem: 32 * 1024 * 1024,
  });

  return `scrypt$${cost}$${blockSize}$${parallel}$${salt.toString('hex')}$${derived.toString('hex')}`;
}

/**
 * Constant-time verification of password against stored scrypt hash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') {
      return false;
    }
    const cost = parseInt(parts[1], 10);
    const blockSize = parseInt(parts[2], 10);
    const parallel = parseInt(parts[3], 10);
    const salt = Buffer.from(parts[4], 'hex');
    const expectedKey = Buffer.from(parts[5], 'hex');

    const derived = crypto.scryptSync(password, salt, expectedKey.length, {
      N: cost,
      r: blockSize,
      p: parallel,
      maxmem: 32 * 1024 * 1024,
    });

    return crypto.timingSafeEqual(derived, expectedKey);
  } catch {
    return false;
  }
}

/**
 * Cryptographically random session token (256-bit).
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Scan an object to ensure strictly forbidden card/banking secrets are not present.
 * Throws descriptive error if any prohibited field is detected.
 */
export const PROHIBITED_FIELDS = [
  'cvv',
  'cvc',
  'pin',
  'atmpin',
  'atm_pin',
  'cardpin',
  'card_pin',
  'upipin',
  'upi_pin',
  'fullcardnumber',
  'full_card_number',
  'bankingpassword',
  'banking_password',
  'internetbankingpassword',
  'otp',
  'securitycode',
  'security_code',
];

export function validateNoProhibitedFields(obj: unknown, path = ''): void {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      validateNoProhibitedFields(obj[i], `${path}[${i}]`);
    }
    return;
  }

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (PROHIBITED_FIELDS.includes(normalizedKey)) {
      throw new Error(`Security Violation: Prohibited field "${key}" detected at ${path || 'root'}. Card PINs, CVV, OTP, and banking passwords must never be stored.`);
    }

    // Also check if someone attempts to send a 15-16 digit full card number
    if (typeof value === 'string' && /^\d{13,19}$/.test(value.replace(/[\s-]/g, ''))) {
      if (key !== 'id' && !key.toLowerCase().includes('phone') && !key.toLowerCase().includes('accountnumberlast4') && !key.toLowerCase().includes('cardnumberlast4')) {
        // If it looks like a full 16-digit card number in an unexpected field
        if (value.replace(/[\s-]/g, '').length >= 15) {
          throw new Error(`Security Violation: Storing full 16-digit card numbers is prohibited. Only store the last 4 digits (e.g., "4582").`);
        }
      }
    }

    if (value && typeof value === 'object') {
      validateNoProhibitedFields(value, path ? `${path}.${key}` : key);
    }
  }
}
