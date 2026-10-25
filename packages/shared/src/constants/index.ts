export const APP_NAME = 'LearnPeer';
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
  CODE_WORKSPACES: {
    ROOT: '/api/code-workspaces',
    BY_ID: (id: string) => `/api/code-workspaces/${id}`,
    PARTICIPANTS: (id: string) => `/api/code-workspaces/${id}/participants`,
    PARTICIPANT_BY_ID: (id: string, participantId: string) =>
      `/api/code-workspaces/${id}/participants/${participantId}`,
    DOCUMENTS: (id: string) => `/api/code-workspaces/${id}/documents`,
    DOCUMENT_BY_ID: (id: string, docId: string) =>
      `/api/code-workspaces/${id}/documents/${docId}`,
    REVISIONS: (id: string, docId: string) =>
      `/api/code-workspaces/${id}/documents/${docId}/revisions`,
    RESTORE_REVISION: (id: string, docId: string, revId: string) =>
      `/api/code-workspaces/${id}/documents/${docId}/revisions/${revId}/restore`,
    BY_SESSION: (sessionId: string) => `/api/code-workspaces/session/${sessionId}`,
  },
  STUDY_ROOMS: {
    ROOT: '/api/study-rooms',
    BY_ID: (id: string) => `/api/study-rooms/${id}`,
    JOIN: (id: string) => `/api/study-rooms/${id}/join`,
    LEAVE: (id: string) => `/api/study-rooms/${id}/leave`,
    END: (id: string) => `/api/study-rooms/${id}/end`,
    PARTICIPANTS: (id: string) => `/api/study-rooms/${id}/participants`,
    PARTICIPANT_BY_ID: (id: string, participantId: string) =>
      `/api/study-rooms/${id}/participants/${participantId}`,
    BOARD: (id: string) => `/api/study-rooms/${id}/board`,
    BOARD_REVISIONS: (id: string) => `/api/study-rooms/${id}/board/revisions`,
    RESTORE_BOARD: (id: string, revId: string) =>
      `/api/study-rooms/${id}/board/revisions/${revId}/restore`,
    BY_SESSION: (sessionId: string) => `/api/study-rooms/session/${sessionId}`,
  },
  SEARCH: '/api/search',
  PREFERENCES: '/api/preferences',
  CALENDAR_EXPORT: {
    SESSION: (sessionId: string) => `/api/sessions/${sessionId}/export.ics`,
    USER: '/api/sessions/calendar/export.ics',
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

  // Phase 6: Collaborative Code Editor
  CODE_JOIN: 'code:workspace-join',
  CODE_LEAVE: 'code:workspace-leave',
  CODE_SYNC_INIT: 'code:sync-init',
  CODE_DOC_UPDATE: 'code:doc-update',
  CODE_AWARENESS_UPDATE: 'code:awareness-update',
  CODE_SAVE: 'code:save',
  CODE_SAVED: 'code:saved',
  CODE_ERROR: 'code:error',

  // Phase 7: Interactive Study Room & Whiteboard
  STUDY_ROOM_JOIN: 'study-room:join',
  STUDY_ROOM_LEAVE: 'study-room:leave',
  STUDY_ROOM_USER_JOINED: 'study-room:user-joined',
  STUDY_ROOM_USER_LEFT: 'study-room:user-left',
  STUDY_ROOM_ENDED: 'study-room:ended',
  STUDY_ROOM_SIGNAL: 'study-room:signal',

  WHITEBOARD_INIT: 'whiteboard:init',
  WHITEBOARD_DRAW_STEP: 'whiteboard:draw-step',
  WHITEBOARD_ELEMENTS_UPDATE: 'whiteboard:elements-update',
  WHITEBOARD_CURSOR: 'whiteboard:cursor',
  WHITEBOARD_CLEAR: 'whiteboard:clear',
  WHITEBOARD_SAVE: 'whiteboard:save',
  WHITEBOARD_SAVED: 'whiteboard:saved',
  WHITEBOARD_ERROR: 'whiteboard:error',
} as const;

export const SUPPORTED_LANGUAGES = [
  { id: 'typescript', name: 'TypeScript', extension: 'ts' },
  { id: 'javascript', name: 'JavaScript', extension: 'js' },
  { id: 'python', name: 'Python', extension: 'py' },
  { id: 'java', name: 'Java', extension: 'java' },
  { id: 'cpp', name: 'C++', extension: 'cpp' },
  { id: 'html', name: 'HTML', extension: 'html' },
  { id: 'css', name: 'CSS', extension: 'css' },
  { id: 'json', name: 'JSON', extension: 'json' },
  { id: 'sql', name: 'SQL', extension: 'sql' },
] as const;

export const STARTER_TEMPLATES: Record<string, string> = {
  typescript: `// PeerLearn Collaborative TypeScript Workspace
// Learn Together. Grow Together.

interface Student {
  name: string;
  role: string;
  goals: string[];
}

function greetStudent(student: Student): string {
  return \`Welcome to PeerLearn, \${student.name}! Ready to master \${student.goals.join(', ')}?\`;
}

const learner: Student = {
  name: "Peer Learner",
  role: "Collaborative Coder",
  goals: ["TypeScript", "Full-Stack Development"]
};

console.log(greetStudent(learner));
`,
  javascript: `// PeerLearn Collaborative JavaScript Workspace
// Learn Together. Grow Together.

function calculatePeerSynergy(peerA, peerB) {
  const commonSkills = peerA.skills.filter(s => peerB.skills.includes(s));
  return {
    synergyScore: Math.round((commonSkills.length / Math.max(peerA.skills.length, peerB.skills.length)) * 100),
    shared: commonSkills
  };
}

const alice = { name: "Alice", skills: ["JavaScript", "React", "Node.js"] };
const bob = { name: "Bob", skills: ["Python", "JavaScript", "React"] };

console.log("Synergy:", calculatePeerSynergy(alice, bob));
`,
  python: `# PeerLearn Collaborative Python Workspace
# Learn Together. Grow Together.

class LearningSession:
    def __init__(self, topic: str, duration_mins: int):
        self.topic = topic
        self.duration_mins = duration_mins
        self.participants = []

    def add_peer(self, peer_name: str):
        self.participants.append(peer_name)
        print(f"🎉 {peer_name} joined the {self.topic} session!")

session = LearningSession("Algorithms & Data Structures", 60)
session.add_peer("Alex")
session.add_peer("Sam")
`,
  java: `// PeerLearn Collaborative Java Workspace
// Learn Together. Grow Together.

public class Main {
    public static void main(String[] args) {
        String greeting = "Welcome to PeerLearn!";
        System.out.println(greeting);
        System.out.println("Learn Together. Grow Together.");
    }
}
`,
  cpp: `// PeerLearn Collaborative C++ Workspace
// Learn Together. Grow Together.

#include <iostream>
#include <vector>
#include <string>

int main() {
    std::cout << "PeerLearn C++ Collaborative Workspace" << std::endl;
    std::cout << "Learn Together. Grow Together." << std::endl;
    return 0;
}
`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PeerLearn Collaborative Page</title>
  <style>
    body { font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; }
    h1 { color: #6366f1; }
  </style>
</head>
<body>
  <h1>PeerLearn</h1>
  <p>Learn Together. Grow Together.</p>
</body>
</html>
`,
  css: `/* PeerLearn Collaborative CSS Workspace */

:root {
  --primary-color: #6366f1;
  --bg-dark: #0f172a;
  --text-main: #f8fafc;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', system-ui, sans-serif;
  background-color: var(--bg-dark);
  color: var(--text-main);
}
`,
  json: `{
  "platform": "PeerLearn",
  "tagline": "Learn Together. Grow Together.",
  "module": "Phase 6: Real-Time Collaborative Code Editor",
  "features": [
    "Monaco Editor",
    "Yjs CRDT Document Synchronization",
    "Live Presence & Remote Cursors",
    "Workspace Roles & Permissions",
    "PostgreSQL Document Revisions"
  ]
}
`,
  sql: `-- PeerLearn Collaborative SQL Workspace
-- Learn Together. Grow Together.

SELECT 
    p.user_id,
    p.college,
    p.branch,
    COUNT(s.id) AS completed_sessions
FROM student_profiles p
LEFT JOIN session_participants sp ON sp.user_id = p.user_id
LEFT JOIN learning_sessions s ON s.id = sp.session_id AND s.status = 'COMPLETED'
GROUP BY p.user_id, p.college, p.branch
ORDER BY completed_sessions DESC;
`,
};

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

