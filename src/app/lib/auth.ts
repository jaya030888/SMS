// src/app/lib/auth.ts
import crypto from 'crypto';

/**
 * Hash a password using secure Scrypt key derivation
 */
export function hashPassword(password: string): string {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a valid string');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024
  }).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored Scrypt hash using constant-time comparison
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (!password || !storedHash || typeof storedHash !== 'string') {
      return false;
    }

    const parts = storedHash.split(':');
    if (parts.length !== 2) {
      // If stored in fallback format during dev migrations
      return false;
    }

    const [salt, expectedHash] = parts;
    if (!salt || !expectedHash) return false;

    const actualHash = crypto.scryptSync(password, salt, 64, {
      N: 16384,
      r: 8,
      p: 1,
      maxmem: 32 * 1024 * 1024
    }).toString('hex');

    const expectedBuffer = Buffer.from(expectedHash, 'hex');
    const actualBuffer = Buffer.from(actualHash, 'hex');

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch (e) {
    return false;
  }
}
