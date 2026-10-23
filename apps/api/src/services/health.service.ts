import { APP_NAME, APP_TAGLINE, APP_VERSION, type HealthCheckData } from '@peerlume/shared';
import { env } from '../config/env.js';
import { checkDatabaseConnection } from '../config/prisma.js';

export async function getSystemHealth(): Promise<HealthCheckData> {
  const dbStatus = await checkDatabaseConnection();

  const isDegraded = dbStatus.status === 'disconnected';

  return {
    status: isDegraded ? 'degraded' : 'ok',
    name: APP_NAME,
    tagline: APP_TAGLINE,
    version: APP_VERSION,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
  };
}
