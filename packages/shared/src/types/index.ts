export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[] | unknown;
  };
  timestamp: string;
}

export type StandardResponse<T> = ApiResponse<T> | ApiErrorResponse;

export interface HealthDatabaseStatus {
  status: 'connected' | 'disconnected' | 'unconfigured';
  latencyMs?: number;
  message?: string;
}

export interface HealthCheckData {
  status: 'ok' | 'degraded';
  name: string;
  tagline: string;
  version: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
  database: HealthDatabaseStatus;
}
