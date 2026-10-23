import { PrismaClient } from '@prisma/client';
import type { HealthDatabaseStatus } from '@peerlume/shared';

// Create a singleton PrismaClient instance
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export async function checkDatabaseConnection(): Promise<HealthDatabaseStatus> {
  const startTime = Date.now();
  try {
    // Run a lightweight raw query to test connection
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;
    return {
      status: 'connected',
      latencyMs,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database connection error';
    return {
      status: 'disconnected',
      message: process.env.NODE_ENV === 'production' ? 'Database connection unavailable' : message,
    };
  }
}
