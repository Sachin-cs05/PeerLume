import type { ApiResponse, ApiErrorResponse, HealthCheckData } from '@peerlume/shared';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const body = isJson ? await response.json() : null;

    if (!response.ok) {
      const errorBody = body as ApiErrorResponse | null;
      const errorMessage =
        errorBody?.error?.message ||
        `Request failed with status ${response.status} (${response.statusText})`;

      return {
        data: null,
        error: errorMessage,
        status: response.status,
      };
    }

    const successBody = body as ApiResponse<T>;
    return {
      data: successBody ? successBody.data : null,
      error: null,
      status: response.status,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network connection error';
    return {
      data: null,
      error: message,
      status: 0,
    };
  }
}

export const apiService = {
  async getHealth(): Promise<ApiResult<HealthCheckData>> {
    return apiRequest<HealthCheckData>('/health');
  },
};
