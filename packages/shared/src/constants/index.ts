export const APP_NAME = 'PeerLume';
export const APP_TAGLINE = 'Learn Together. Grow Together.';
export const APP_VERSION = '0.1.0';

export const API_ENDPOINTS = {
  HEALTH: '/api/health',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
