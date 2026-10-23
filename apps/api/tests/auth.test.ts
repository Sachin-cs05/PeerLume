import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { hashPassword } from '../src/utils/security.js';

describe('Auth Validation & Registration Tests', () => {
  it('POST /api/auth/register should fail on invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Jane Doe',
        email: 'invalid-email',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'MIT',
        degree: 'B.Tech',
        branch: 'Computer Science',
        semester: '5th',
        acceptedTerms: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/auth/register should fail on weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        college: 'MIT',
        degree: 'B.Tech',
        branch: 'Computer Science',
        semester: '5th',
        acceptedTerms: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/auth/register should fail when passwords do not match', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!',
        confirmPassword: 'DifferentPassword123!',
        college: 'MIT',
        degree: 'B.Tech',
        branch: 'Computer Science',
        semester: '5th',
        acceptedTerms: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/auth/register should fail if terms not accepted', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        college: 'MIT',
        degree: 'B.Tech',
        branch: 'Computer Science',
        semester: '5th',
        acceptedTerms: false,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('Login & Protection Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /api/auth/me should return 401 without authentication', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/profile/me should return 401 without authentication', async () => {
    const res = await request(app).get('/api/profile/me');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('POST /api/auth/login should reject non-existent user with generic 401 error', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nobody@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('POST /api/auth/login should reject invalid password with generic 401 error', async () => {
    const mockHash = await hashPassword('CorrectPassword123!');
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      id: 'user-123',
      email: 'student@example.com',
      passwordHash: mockHash,
      fullName: 'Student Peer',
      isEmailVerified: true,
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as Awaited<ReturnType<typeof prisma.user.findUnique>>);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@example.com',
        password: 'WrongPassword123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('POST /api/auth/logout should clear cookies and return 200', async () => {
    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
