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
  CONVERSATIONS: {
    ROOT: '/api/conversations',
    DIRECT: '/api/conversations/direct',
    MESSAGES: (conversationId: string) => `/api/conversations/${conversationId}/messages`,
    READ: (conversationId: string) => `/api/conversations/${conversationId}/read`,
  },
  CALLS: {
    ROOT: '/api/calls',
    BY_ID: (callId: string) => `/api/calls/${callId}`,
    END: (callId: string) => `/api/calls/${callId}/end`,
    CONFIG: '/api/calls/config',
  },
  NOTIFICATIONS: {
    ROOT: '/api/notifications',
    UNREAD_COUNT: '/api/notifications/unread-count',
    READ: (notificationId: string) => `/api/notifications/${notificationId}/read`,
    READ_ALL: '/api/notifications/read-all',
  },
  SESSIONS: {
    ROOT: '/api/sessions',
    BY_ID: (sessionId: string) => `/api/sessions/${sessionId}`,
    ACCEPT: (sessionId: string) => `/api/sessions/${sessionId}/accept`,
    DECLINE: (sessionId: string) => `/api/sessions/${sessionId}/decline`,
    RESCHEDULE: (sessionId: string) => `/api/sessions/${sessionId}/reschedule`,
    RESPOND_RESCHEDULE: (sessionId: string, proposalId: string) =>
      `/api/sessions/${sessionId}/reschedule/${proposalId}`,
    CANCEL: (sessionId: string) => `/api/sessions/${sessionId}/cancel`,
    COMPLETE: (sessionId: string) => `/api/sessions/${sessionId}/complete`,
    AVAILABILITY: '/api/sessions/availability',
    CALENDAR: '/api/sessions/calendar',
  },
  RESOURCES: {
    ROOT: '/api/resources',
    BY_ID: (resourceId: string) => `/api/resources/${resourceId}`,
    UPLOAD: '/api/resources/upload',
    DOWNLOAD: (resourceId: string) => `/api/resources/${resourceId}/download`,
    BY_SESSION: (sessionId: string) => `/api/sessions/${sessionId}/resources`,
  },
  DASHBOARD: {
    SUMMARY: '/api/dashboard/summary',
    ACTIVITY: '/api/dashboard/activity',
  },
} as const;


export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  
  // Room and presence
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  PRESENCE_UPDATE: 'presence:update',
  
  // Messaging
  MESSAGE_SEND: 'message:send',
  MESSAGE_NEW: 'message:new',
  MESSAGE_READ: 'message:read',
  MESSAGE_DELIVERED: 'message:delivered',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  
  // Calling signaling
  CALL_INVITE: 'call:invite',
  CALL_RINGING: 'call:ringing',
  CALL_ACCEPT: 'call:accept',
  CALL_REJECT: 'call:reject',
  CALL_OFFER: 'call:offer',
  CALL_ANSWER: 'call:answer',
  CALL_ICE_CANDIDATE: 'call:ice-candidate',
  CALL_END: 'call:end',
  
  // Notifications
  NOTIFICATION_NEW: 'notification:new',
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

