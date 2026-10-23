import crypto from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';

// Recommended OWASP Argon2id settings
const ARGON2_OPTIONS = {
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

export async function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(passwordHash: string, candidate: string): Promise<boolean> {
  try {
    return await verify(passwordHash, candidate, ARGON2_OPTIONS);
  } catch {
    return false;
  }
}

export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
