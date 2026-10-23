import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
    issuer: 'peerlume-api',
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: 'peerlume-api',
    }) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
    issuer: 'peerlume-api',
  });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: 'peerlume-api',
    }) as RefreshTokenPayload;
  } catch {
    return null;
  }
}
