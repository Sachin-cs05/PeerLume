export const APP_NAME = 'PeerLume';
export const APP_TAGLINE = 'Learn Together. Grow Together.';
export const APP_VERSION = '0.1.0';

export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
    RESEND_VERIFICATION: '/api/auth/resend-verification',
  },
  PROFILE: {
    ME: '/api/profile/me',
    SKILLS: '/api/profile/skills',
    TEACHING_SKILLS: '/api/profile/teaching-skills',
    LEARNING_GOALS: '/api/profile/learning-goals',
  },
  STUDENTS: '/api/students',
  DISCOVERY: {
    PARTNERS: '/api/discovery/partners',
    MATCH_DETAILS: '/api/discovery/partners/match-details',
  },
  CONNECTIONS: {
    ROOT: '/api/connections',
    REQUESTS: '/api/connections/requests',
    REQUESTS_INCOMING: '/api/connections/requests/incoming',
    REQUESTS_OUTGOING: '/api/connections/requests/outgoing',
  },
  BLOCKS: '/api/blocks',
  SAVED_PARTNERS: '/api/saved-partners',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
