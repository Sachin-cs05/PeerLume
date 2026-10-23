# PeerLume

> **“Learn Together. Grow Together.”**

PeerLume is a modern, production-minded, and scalable peer-to-peer learning platform designed for students. The platform empowers students to study with friends and discover new learning partners based on skills, academic interests, and learning goals.

PeerLume adheres strictly to an **autonomous student governance architecture**—there is **no Admin role or Admin dashboard**. Students manage their own connections, schedule study sessions, collaborate on code, and engage in peer-to-peer learning with automated security and abuse prevention.

---

## 🏗️ Repository Architecture

This repository is organized as an npm workspaces monorepo:

```text
peerlume/
├── apps/
│   ├── web/                    # Frontend React + TypeScript + Vite + Tailwind CSS
│   │   ├── src/
│   │   │   ├── app/            # App entry wrapped in AuthProvider
│   │   │   ├── components/     # UI library (Button, Badge, Card, Input, Alert, Spinner)
│   │   │   │   └── guards/     # ProtectedRoute & GuestRoute navigation guards
│   │   │   ├── context/        # AuthContext & useAuth session management
│   │   │   ├── hooks/          # React hooks (useHealth, etc.)
│   │   │   ├── layouts/        # RootLayout, Header (with user auth state), Footer
│   │   │   ├── pages/
│   │   │   │   ├── auth/       # LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage
│   │   │   │   ├── profile/    # ProfileViewPage (with public preview toggle), ProfileEditPage
│   │   │   │   ├── dashboard/  # DashboardPage (student identity and roadmap)
│   │   │   │   ├── LandingPage.tsx
│   │   │   │   └── NotFoundPage.tsx
│   │   │   ├── routes/         # React Router configuration with guarded routes
│   │   │   ├── services/       # Typed API client with HttpOnly cookie support
│   │   │   ├── index.css       # Tailwind directives & glassmorphic styling
│   │   │   └── main.tsx        # React DOM client entry point
│   │   ├── index.html          # HTML entry with Inter typography & SEO metadata
│   │   ├── tailwind.config.js  # Curated student theme palette & keyframe animations
│   │   ├── vite.config.ts      # Vite configuration with @ path aliases
│   │   ├── tsconfig.json       # TypeScript strict configuration
│   │   └── package.json
│   └── api/                    # Backend Node.js + Express + TypeScript REST API
│       ├── src/
│       │   ├── config/         # Environment variable loading (Zod) & Prisma client setup
│       │   ├── controllers/    # AuthController, ProfileController, HealthController
│       │   ├── middleware/     # requireAuth, optionalAuth, rateLimiters, errorHandler, validate
│       │   ├── routes/         # /api/auth, /api/profile, /api/health
│       │   ├── services/       # AuthService, ProfileService, EmailService, HealthService
│       │   ├── utils/          # Argon2id security, JWT signing/verifying, HttpOnly cookies, logger
│       │   ├── validations/    # Zod schemas for registration, login, profile, and skills
│       │   ├── app.ts          # Express application setup & middleware pipeline
│       │   └── server.ts       # HTTP server bootstrap & graceful shutdown listeners
│       ├── tests/              # Automated integration tests (Vitest + Supertest)
│       ├── tsconfig.json       # TypeScript configuration
│       ├── tsconfig.build.json # Production build TypeScript configuration
│       └── package.json
├── packages/
│   └── shared/                 # Shared types, constants, DTOs, and interfaces
│       ├── src/
│       │   ├── constants/      # App name, tagline, endpoints, HTTP status codes
│       │   ├── types/          # AuthUser, StudentProfileDto, SkillDto, API response envelopes
│       │   └── index.ts        # Package barrel exports
│       ├── tsconfig.json
│       └── package.json
├── prisma/
│   ├── schema.prisma           # PostgreSQL schema (User, StudentProfile, Skill, RefreshSession, etc.)
│   └── migrations/             # Versioned SQL migration files
├── .env.example                # Documented environment template
├── .gitignore                  # Git ignore rules
├── .prettierrc                 # Prettier code formatting rules
├── eslint.config.mjs           # ESLint flat configuration for TypeScript and React
├── package.json                # Root monorepo configuration and workspaces scripts
└── README.md
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript (strict mode), Vite, Tailwind CSS, React Router v7, Lucide React |
| **Backend** | Node.js, Express 4, TypeScript, Zod schema validation, Helmet, CORS, Cookie-Parser |
| **Authentication** | Argon2id password hashing, JWT Access Tokens (15m), Rotating Refresh Sessions (7d), HttpOnly Lax Cookies, SHA-256 hashed single-use tokens, Express Rate Limiter |
| **Database** | PostgreSQL, Prisma ORM 6 |
| **Testing & Quality** | Vitest, Supertest, ESLint, Prettier |

---

## 🔒 Authentication & Security Architecture

1. **Password Hashing**:
   - Uses **Argon2id** (`@node-rs/argon2`) adhering to OWASP recommendations (19 MiB memory cost, 2 iterations, 1 parallelism).
2. **Session & Cookie Security**:
   - Access tokens (15 minutes) and Refresh tokens (7 days) are stored exclusively in **HttpOnly, SameSite=Lax, Secure (in production)** cookies.
   - Long-lived tokens are never exposed to browser JavaScript or stored in `localStorage`.
   - Refresh sessions are stored in the database hashed with SHA-256 and rotated on refresh. Sessions can be explicitly revoked upon logout or password change.
3. **Password Recovery & Email Verification**:
   - Cryptographically random single-use tokens (`crypto.randomBytes(32)`).
   - Only the SHA-256 hash of the token is stored in the database with strict expiration (15 minutes for reset, 24 hours for email verification).
   - Once used, tokens are permanently marked with `usedAt`. Changing passwords revokes all existing refresh sessions.
4. **Account Enumeration Defense & Rate Limiting**:
   - Generic error messages for login and password recovery.
   - Rate limiting on login attempts (5 requests per 15 minutes) and sensitive actions (10 requests per 15 minutes).
5. **Email Provider Integration**:
   - Configurable via `EMAIL_PROVIDER`. In development mode (`development`), verification and reset links are safely emitted to the backend console logger without false delivery claims.

---

## 📡 API Endpoints (Phase 2)

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required | Rate Limited |
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/api/auth/register` | Student registration with academic profile | No | Yes |
| `POST` | `/api/auth/login` | Authenticate student and establish session | No | Yes (Strict) |
| `POST` | `/api/auth/logout` | Revoke session and clear HttpOnly cookies | Yes | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated student session | Yes | No |
| `POST` | `/api/auth/refresh` | Rotate and issue new access & refresh tokens | No | No |
| `POST` | `/api/auth/forgot-password` | Request password reset email | No | Yes |
| `POST` | `/api/auth/reset-password` | Set new password with validated single-use token | No | Yes |
| `POST` | `/api/auth/verify-email` | Verify student email address | No | Yes |
| `POST` | `/api/auth/resend-verification`| Resend verification email | No | Yes |

### Student Profile (`/api/profile`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/profile/me` | Retrieve own student profile with skills & goals | Yes |
| `PATCH` | `/api/profile/me` | Update editable profile fields (bio, mode, visibility, etc.) | Yes |
| `GET` | `/api/profile/skills` | Search/list available skill catalog | Optional |
| `PUT` | `/api/profile/teaching-skills` | Update teaching skills (with proficiency levels) | Yes |
| `PUT` | `/api/profile/learning-goals` | Update learning goals (with priority & notes) | Yes |

### Health Telemetry (`/api/health`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/health` | System status, uptime, and database connection probe | No |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 or higher (v24 LTS recommended)
- **npm**: v10 or higher
- **PostgreSQL**: (Required for live database operations; server gracefully degrades to report status if offline)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone <repo-url>
cd PeerLume

# Install monorepo dependencies across all workspaces
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment (`development`, `test`, `production`) | `development` |
| `PORT` | Backend Express API port | `5000` |
| `WEB_ORIGIN` | Allowed CORS origin for the frontend client | `http://localhost:5173` |
| `APP_BASE_URL` | Base URL used for verification/reset email links | `http://localhost:5173` |
| `DATABASE_URL` | PostgreSQL connection URL string | `postgresql://peerlume_user:peerlume_pass@localhost:5432/peerlume_db?schema=public` |
| `JWT_ACCESS_SECRET` | 32+ character secret for access tokens | Configured in `.env` |
| `JWT_REFRESH_SECRET` | 32+ character secret for refresh tokens | Configured in `.env` |
| `COOKIE_SECRET` | 32+ character secret for signed cookies | Configured in `.env` |
| `EMAIL_PROVIDER` | Email driver (`development` or `smtp`) | `development` |
| `VITE_API_BASE_URL` | API base URL accessed by browser | `http://localhost:5000/api` |

### 3. Generate Prisma Client & Run Migrations

```bash
# Validate Prisma schema
npm run prisma:validate

# Generate Prisma Client
npm run prisma:generate

# Apply migrations to PostgreSQL (when running)
npm run prisma:migrate -- --name init_phase2_auth_and_profiles
```

### 4. Run Development Servers

```bash
# Run both Backend API and Frontend Web concurrently
npm run dev

# Or run individually:
npm run dev:api   # API at http://localhost:5000
npm run dev:web   # Web at http://localhost:5173
```

---

## 🧪 Testing, Quality & Build Verification

```bash
# Run TypeScript strict typecheck across all workspaces
npm run typecheck

# Run ESLint across the entire project
npm run lint

# Run automated backend API tests (Vitest + Supertest)
npm run test

# Build all packages and applications for production
npm run build
```

---

---

## 🤝 Phase 3: Friends, Connections & Smart Learning Partner Matching

Phase 3 introduces real database-backed student discovery and relationship management without admin gatekeeping:

### 1. Smart Learning Partner Matching Algorithm

Students can discover compatible learning partners using a transparent, explainable scoring function based on actual profile records:

$$\text{MatchScore} = \text{TeachToLearn} (50\%) + \text{Reciprocal} (25\%) + \text{SharedGoals} (15\%) + \text{Language} (10\%) + \text{AcademicBonus} (5\text{ pts})$$

- **Teach-to-Learn Compatibility (50 pts):** Evaluates if candidate teaches one or more skills the current student configured in their learning goals.
- **Reciprocal Skill Compatibility (25 pts):** Evaluates if candidate wants to learn skills the current student can teach.
- **Shared Learning Goals (15 pts):** Identifies overlapping learning goals where both peers want to master the same subject together.
- **Language Compatibility (10 pts):** Checks for compatible spoken languages.
- **Academic Context (+5 pts):** Optional context bonus for peers sharing campus (+3) and branch (+2).
- **Truthful Explanations:** Only data-backed reasons are rendered (e.g. *"Can mentor you in React"*, *"Interested in Python from you"*, *"Shares 2 common goals"*).

### 2. Autonomous Connections & Friends Management

- **Send / Cancel Requests:** Outgoing pending requests with prevention of self-connections and duplicates.
- **Incoming Requests:** Accept or decline connection requests.
- **Opposite-Direction Auto-Acceptance:** If student A requests student B while B already sent a request to A, the request is automatically accepted without duplicate records.
- **Canonical Friendship Rows:** Stored as `[min(user1, user2), max(user1, user2)]` ensuring strict database-level uniqueness.
- **Remove Connection:** Safe unfriending without altering either student's account or profile.
- **Future Chat Entry Point:** Clear non-deceptive indicator (`Chat Coming in Phase 4`).

### 3. Mutual Blocking & Privacy Enforcement

- **Self-Service Blocking:** Block and unblock any student with an optional reason.
- **Cascade Cleanup:** Blocking removes any active friendship, deletes pending requests in both directions, and purges saved partner bookmarks.
- **Total Exclusion:** Blocked students are excluded from search, recommendations, and connection actions on the backend.

### 4. Saved Learning Partners

- Private student bookmarks allowing students to save discovered peers with personal notes.

### 5. Phase 3 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/discovery/partners` | Get smart-matched learning partner recommendations with scores |
| `GET` | `/api/students` | Search student directory with pagination and skill filters |
| `GET` | `/api/students/:studentId` | Get permitted public student profile details |
| `POST` | `/api/connections/requests` | Send connection request to another student |
| `GET` | `/api/connections/requests/incoming` | List incoming connection requests |
| `GET` | `/api/connections/requests/outgoing` | List outgoing pending connection requests |
| `POST` | `/api/connections/requests/:requestId/accept` | Accept an incoming connection request |
| `POST` | `/api/connections/requests/:requestId/decline` | Decline an incoming connection request |
| `DELETE`| `/api/connections/requests/:requestId` | Cancel an outgoing connection request |
| `GET` | `/api/connections` | View accepted friends list with search |
| `DELETE`| `/api/connections/:connectionId` | Remove an accepted friend connection |
| `POST` | `/api/blocks/:studentId` | Block a student |
| `DELETE`| `/api/blocks/:studentId` | Unblock a student |
| `GET` | `/api/blocks` | List students blocked by current user |
| `POST` | `/api/saved-partners/:studentId` | Save learning partner to private bookmarks |
| `DELETE`| `/api/saved-partners/:studentId` | Remove student from private bookmarks |
| `GET` | `/api/saved-partners` | List saved learning partners |

---

## ⚡ Phase 4: Real-Time Chat, Audio/Video Calls & Notifications

### 1. Real-Time Private Chat
- **Conversations & Messages:** Persistent one-to-one message exchange backed by PostgreSQL with chronological ordering and cursor-based pagination.
- **Message Types:** Full support for standard text, formatted code snippets with syntax highlighting and copy button, and shared learning resource links.
- **Reliability & Idempotency:** Server timestamps, retry deduplication via `clientTempId`, and read status tracking with read receipts.
- **Presence & Typing:** Real-time online/offline presence indicators and debounced typing indicator broadcast.

### 2. Audio & Video Calling (WebRTC)
- **Genuine Peer-to-Peer Calls:** Voice and video calling using WebRTC media streams with Socket.IO signaling.
- **Call Controls:** Mute/unmute microphone, camera toggle, screen sharing during learning sessions, and hang up.
- **NAT Traversal & ICE:** Environment-based configuration for Google STUN servers with TURN server credentials support for restricted networks (`STUN_SERVERS`, `TURN_SERVER`, `TURN_USERNAME`, `TURN_CREDENTIAL`).
- **Safety & Blocking:** Enforces mutual blocking checks before signaling; blocked users cannot initiate or receive calls.

### 3. Persistent Notifications
- **Event Triggers:** Connection requests received, connection requests accepted, new messages, and missed calls.
- **Read Receipts:** Individual notification mark-as-read, bulk "mark all as read", and live unread counter badge.
- **Direct Navigation:** Clicking a notification immediately routes to the relevant conversation, connection request, or call.

### 4. Phase 4 Endpoints & Events

#### REST Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/conversations` | List user's active conversations with unread counts and last message |
| `POST` | `/api/conversations/direct` | Find or create direct conversation with another student |
| `GET` | `/api/conversations/:id/messages` | Get paginated message history for conversation |
| `POST` | `/api/conversations/:id/messages` | Send message (text, code, link) with idempotency key |
| `POST` | `/api/conversations/:id/read` | Mark all unread messages in conversation as read |
| `POST` | `/api/calls` | Initiate a new audio or video call session |
| `GET` | `/api/calls/:id` | Get status and participants of a call session |
| `POST` | `/api/calls/:id/end` | Cleanly terminate an active call session |
| `PATCH`| `/api/calls/:id/status` | Update call state (ACCEPTED, REJECTED, MISSED, ENDED) |
| `GET` | `/api/calls/config` | Retrieve WebRTC STUN/TURN ICE server configuration |
| `GET` | `/api/notifications` | Get paginated persistent notifications |
| `GET` | `/api/notifications/unread-count` | Get unread notification counter badge |
| `PATCH`| `/api/notifications/:id/read` | Mark single notification as read |
| `POST` | `/api/notifications/read-all` | Mark all user notifications as read |

#### Socket.IO Real-Time Events
- `room:join` / `room:leave`
- `presence:update`
- `message:send` / `message:new` / `message:read`
- `typing:start` / `typing:stop`
- `call:invite` / `call:ringing` / `call:accept` / `call:reject` / `call:end`
- `call:offer` / `call:answer` / `call:ice-candidate`
- `notification:new`

---

## 📅 Phase 5: Session Scheduling, Knowledge-Sharing Workspace & Learning Dashboard

### 1. Learning Session Scheduling & Reschedule Workflow
- **Session Lifecycle & Management:** Full state machine (`PENDING`, `ACCEPTED`, `DECLINED`, `RESCHEDULE_REQUESTED`, `CANCELLED`, `COMPLETED`).
- **Flexible Modes:** Online sessions with seamless Phase 4 real-time call integration, or in-person sessions with privacy-conscious location fields visible only to confirmed participants.
- **Strict Timezone Handling:** Timestamps are stored uniformly in UTC `TIMESTAMP(3)` alongside preserved IANA timezone strings (`timeZone`), preventing date drift or daylight savings distortion.
- **Availability Conflict Detection:** Proactive server-side and client-side overlapping session checks preventing double-booking across participants.
- **Multi-Party Reschedule Negotiation:** Either organizer or invitee can propose new dates/times. The existing accepted schedule remains authoritative until all participants accept or reject the proposal.
- **Automated Notifications & Reminders:** Real-time and persistent alerts on invitations, acceptance, declines, cancellations, and reschedules. Built-in idempotent reminder runner (60m and 15m intervals) with database-level uniqueness (`[sessionId, userId, minutesBefore]`).

### 2. Knowledge-Sharing Workspace & Safe File Sharing
- **Notes Editor:** Interactive rich text notes with title, markdown styling, auto-save status feedback, and strict student ownership permissions.
- **Safe Link Sharing:** URL format validation with strict scheme checks (accepts only `http:` and `https:`, rejects dangerous protocols like `javascript:`).
- **Code Snippets:** Syntax highlighting for multiple languages, whitespace preservation, and zero server-side code execution.
- **Secure File Storage:** Private document upload/download abstraction with:
  - Cryptographic UUID storage keys (original filenames sanitized and saved in metadata).
  - Server-side MIME type and extension validation (PDF, DOCX, TXT, MD, images up to 15MB).
  - Path-traversal defense (`path.basename` isolation within `uploads/workspace`).
  - Participant-authorized streaming downloads with `Content-Disposition` attachment headers.
  - Session privacy: session-attached resources are restricted to valid participants; private resources are accessible only by the creator.

### 3. Transparent Learning Dashboard
- **Real Database Aggregates:** Zero fabricated metrics or hardcoded progress percentages.
- **Key Metrics:**
  - **Study Hours:** Accurately calculated strictly from duration of sessions with `COMPLETED` status.
  - **Upcoming & Past Sessions:** Active accepted and pending invitations.
  - **Skills & Goals:** Live overview of user's teaching skills and learning objectives.
  - **Chronological Activity Feed:** Unified timeline of recent sessions, invitations, and workspace contributions.

### 4. Phase 5 API Endpoints

#### Learning Sessions (`/api/sessions`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/sessions` | Create a new learning session and send invitations |
| `GET` | `/api/sessions` | List sessions with filters (`scope=upcoming\|past\|invitations\|all`, `status`) |
| `GET` | `/api/sessions/:id` | Get detailed session information, participants, and reschedule proposals |
| `PATCH`| `/api/sessions/:id` | Update session details (organizer only) |
| `POST` | `/api/sessions/:id/accept` | Accept a pending session invitation |
| `POST` | `/api/sessions/:id/decline` | Decline a pending session invitation |
| `POST` | `/api/sessions/:id/reschedule` | Propose a new session date/time, or accept/reject an existing proposal |
| `POST` | `/api/sessions/:id/cancel` | Cancel a scheduled session |
| `POST` | `/api/sessions/:id/complete` | Mark an accepted session as completed |
| `GET` | `/api/sessions/availability` | Check date/time availability and detect overlapping session conflicts |
| `GET` | `/api/calendar/sessions` | Fetch sessions within a specific date range for calendar views |

#### Knowledge-Sharing Workspace (`/api/resources`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/resources` | List accessible workspace resources (notes, links, code, documents) |
| `POST` | `/api/resources` | Create a new resource or upload a document (multipart/form-data) |
| `GET` | `/api/resources/:id` | Retrieve resource details with participant access control |
| `PATCH`| `/api/resources/:id` | Update note content, link, or code snippet (creator only) |
| `DELETE`| `/api/resources/:id` | Delete resource and associated stored file (creator only) |
| `GET` | `/api/resources/:id/download` | Securely download attached document file |
| `GET` | `/api/sessions/:sessionId/resources` | Fetch resources specifically attached to a session |

#### Learning Dashboard (`/api/dashboard`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Retrieve personalized learning metrics, session counts, and study hours |
| `GET` | `/api/dashboard/activity` | Retrieve chronological timeline of student learning activities |

---

## 🗺️ Phase Roadmap

- [x] **Phase 1: Project Foundation**
  - Monorepo structure (`@peerlume/shared`, `@peerlume/api`, `@peerlume/web`).
  - Express API setup, Zod environment validation, graceful shutdown, health telemetry probe.
  - PostgreSQL Prisma schema foundation.
  - React + Vite + Tailwind CSS landing page with live telemetry and peer learning showcase.
- [x] **Phase 2: Authentication & Student Profiles**
  - Student registration with full academic background details and terms acceptance.
  - Argon2id password hashing and secure HttpOnly cookie session management.
  - Password recovery (forgot/reset password) with single-use hashed tokens and session revocation.
  - Student email verification with token hashing and rate-limited resend flow.
  - Persistent Student Profile system with editable fields, teaching skills, and learning goals.
  - Public profile preview mode for students to inspect their peer visibility.
  - Protected student dashboard placeholder and route guards (`ProtectedRoute`, `GuestRoute`).
  - Automated integration test suite covering registration, validation, login, sessions, and route guards.
- [x] **Phase 3: Friends, Connections & Smart Learning Partner Matching**
  - Canonical friendship and bidirectional friend request system.
  - Self-service mutual blocking with connection invalidation cascade.
  - Saved learning partners bookmarking system.
  - Explainable, weighted matching algorithm (Teach-to-Learn, Reciprocal, Goals, Language).
  - Discover Learning Partners page (`/discover`) with smart matching & student directory.
  - Friends & Connections page (`/connections`) with tabs for Friends, Requests, Saved, and Blocked.
  - Public student profile preview modal (`StudentProfileModal`).
  - Comprehensive automated tests (26/26 tests passing).
- [x] **Phase 4: Real-Time Chat, Voice/Video Calls & Persistent Notifications**
  - Persistent one-on-one private messaging with code snippet syntax formatting, link sharing, and typing indicators.
  - Genuine WebRTC voice and video calls with Socket.IO signaling, STUN/TURN configuration, and screen sharing.
  - Multi-tab presence management and user-specific room authorization.
  - Persistent notification system with unread counters for messages, connections, and missed calls.
  - Strict privacy enforcement: blocking halts messaging, calling, and notifications.
  - 44/44 backend unit and integration tests passing.
- [x] **Phase 5: Session Scheduling, Knowledge-Sharing Workspace & Learning Dashboard**
  - Learning session lifecycle management (`PENDING`, `ACCEPTED`, `DECLINED`, `RESCHEDULE_REQUESTED`, `CANCELLED`, `COMPLETED`).
  - UTC timestamps with preserved IANA time zones and bidirectional reschedule negotiation.
  - Overlap availability conflict detection on client and server.
  - Idempotent multi-window session reminders (60m and 15m) with DB-level deduplication.
  - Notes editor with auto-save, code snippets with whitespace preservation, and safe link sharing.
  - Secure file storage abstraction with UUID keys, MIME verification, path traversal prevention, and streaming downloads.
---

## 💻 Phase 6: Real-Time Collaborative Code Editor

### 1. Collaborative Code Editor & Yjs CRDT Synchronization
- **Monaco Editor Integration:** Embedded VS Code editing experience with syntax highlighting, custom dark theme (`peerlume-dark`), line numbers, indentation handling, bracket pair colorization, and word wrapping.
- **Yjs CRDT Synchronization:** Genuine conflict-free concurrent editing via Yjs shared types (`doc.getText('monaco')`) bound directly to Monaco models via `y-monaco`. Incremental updates propagate in near real time without full document replacements.
- **State Convergence & Reconnection:** State vectors and initial synchronizations (`Y.encodeStateAsUpdate`) allow peers and reconnecting clients to seamlessly converge to the identical state.
- **Collaborative Awareness & Presence:** Real-time peer cursors, selection highlights, and presence avatars rendered with distinct peer colors and user identities.

### 2. Workspace Roles, Permissions & Security
- **Strict Role Hierarchy:**
  - `OWNER`: Manages workspace settings, invites collaborators, modifies participant roles, creates documents, and deletes workspace.
  - `EDITOR`: Real-time editing, document tab creation, and saving checkpoints.
  - `VIEWER`: Read-only code inspection in Monaco editor. Update events and save requests are rejected at both API and Socket.IO layer (403 Forbidden).
- **Abuse Prevention & Privacy:** Mutual block enforcement prevents blocked users from being invited, subscribing to document synchronization rooms, or viewing workspace code.

### 3. PostgreSQL Document Persistence & Revision History
- **Incremental & Debounced Persistence:** Debounced in-memory flushing (3s) and manual save checkpoints persist both plain text and binary Yjs CRDT snapshots to PostgreSQL.
- **Graceful Shutdown:** All active collaborative documents in memory are cleanly flushed to PostgreSQL before server exit.
- **Revision History Checkpoints:** Timestamped snapshot history tracking author, language, and descriptions with deliberate one-click restoration as a new revision.

### 4. Code Execution Sandbox Boundary
- **Truthful Security Architecture:** Arbitrary code execution inside Node.js or the server host is strictly disabled to prevent remote code execution or host resource escalation.
- **Starter Templates & Reset:** Built-in starter templates for TypeScript, JavaScript, Python, Java, C++, HTML, CSS, JSON, and SQL with one-click reset with confirmation.

### 5. Phase 6 API Endpoints & Real-Time Events

#### REST Endpoints (`/api/code-workspaces`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/code-workspaces` | Create collaborative code workspace with starter document |
| `GET` | `/api/code-workspaces` | List accessible workspaces for the current student |
| `GET` | `/api/code-workspaces/:id` | Fetch workspace details, participants, documents, and active role |
| `PATCH`| `/api/code-workspaces/:id` | Rename workspace or update description (owner only) |
| `DELETE`| `/api/code-workspaces/:id` | Delete workspace and all associated documents (owner only) |
| `POST` | `/api/code-workspaces/:id/participants` | Invite peer collaborator with role (owner only) |
| `PATCH`| `/api/code-workspaces/:id/participants/:pId` | Update participant role between EDITOR and VIEWER (owner only) |
| `DELETE`| `/api/code-workspaces/:id/participants/:pId` | Remove collaborator or leave workspace |
| `POST` | `/api/code-workspaces/:id/documents` | Create new document tab in workspace (editor/owner) |
| `PATCH`| `/api/code-workspaces/:id/documents/:docId` | Rename document tab or change language (editor/owner) |
| `DELETE`| `/api/code-workspaces/:id/documents/:docId` | Delete document tab (cannot delete the only remaining file) |
| `POST` | `/api/code-workspaces/:id/documents/:docId/save` | Explicitly save code and create versioned snapshot |
| `GET` | `/api/code-workspaces/:id/documents/:docId/revisions` | View revision history for document |
| `POST` | `/api/code-workspaces/:id/documents/:docId/revisions/:revId/restore` | Restore document to a prior checkpoint |

#### Socket.IO Real-Time Collaborative Events
- `code:workspace-join` — Authenticated room join with permission verification and initial CRDT sync.
- `code:sync-init` — Delivers full initial document state vector and plain text fallback.
- `code:doc-update` — Propagates incremental binary CRDT edits to room peers.
- `code:awareness-update` — Propagates remote cursor positions and selection bounds.
- `code:save` / `code:saved` — Requests manual save and broadcasts updated version to all participants.
- `code:workspace-leave` — Cleans up presence and room membership.

---

## 🗺️ Phase Roadmap

- [x] **Phase 1: Project Foundation**
  - Monorepo structure (`@peerlume/shared`, `@peerlume/api`, `@peerlume/web`).
  - Express API setup, Zod environment validation, graceful shutdown, health telemetry probe.
  - PostgreSQL Prisma schema foundation.
  - React + Vite + Tailwind CSS landing page with live telemetry and peer learning showcase.
- [x] **Phase 2: Authentication & Student Profiles**
  - Student registration with full academic background details and terms acceptance.
  - Argon2id password hashing and secure HttpOnly cookie session management.
  - Password recovery (forgot/reset password) with single-use hashed tokens and session revocation.
  - Student email verification with token hashing and rate-limited resend flow.
  - Persistent Student Profile system with editable fields, teaching skills, and learning goals.
  - Public profile preview mode for students to inspect their peer visibility.
  - Protected student dashboard placeholder and route guards (`ProtectedRoute`, `GuestRoute`).
  - Automated integration test suite covering registration, validation, login, sessions, and route guards.
- [x] **Phase 3: Friends, Connections & Smart Learning Partner Matching**
  - Canonical friendship and bidirectional friend request system.
  - Self-service mutual blocking with connection invalidation cascade.
  - Saved learning partners bookmarking system.
  - Explainable, weighted matching algorithm (Teach-to-Learn, Reciprocal, Goals, Language).
  - Discover Learning Partners page (`/discover`) with smart matching & student directory.
  - Friends & Connections page (`/connections`) with tabs for Friends, Requests, Saved, and Blocked.
  - Public student profile preview modal (`StudentProfileModal`).
  - Comprehensive automated tests (26/26 tests passing).
- [x] **Phase 4: Real-Time Chat, Voice/Video Calls & Persistent Notifications**
  - Persistent one-on-one private messaging with code snippet syntax formatting, link sharing, and typing indicators.
  - Genuine WebRTC voice and video calls with Socket.IO signaling, STUN/TURN configuration, and screen sharing.
  - Multi-tab presence management and user-specific room authorization.
  - Persistent notification system with unread counters for messages, connections, and missed calls.
  - Strict privacy enforcement: blocking halts messaging, calling, and notifications.
  - 44/44 backend unit and integration tests passing.
- [x] **Phase 5: Session Scheduling, Knowledge-Sharing Workspace & Learning Dashboard**
  - Learning session lifecycle management (`PENDING`, `ACCEPTED`, `DECLINED`, `RESCHEDULE_REQUESTED`, `CANCELLED`, `COMPLETED`).
  - UTC timestamps with preserved IANA time zones and bidirectional reschedule negotiation.
  - Overlap availability conflict detection on client and server.
  - Idempotent multi-window session reminders (60m and 15m) with DB-level deduplication.
  - Notes editor with auto-save, code snippets with whitespace preservation, and safe link sharing.
  - Secure file storage abstraction with UUID keys, MIME verification, path traversal prevention, and streaming downloads.
  - Transparent learning dashboard with real metrics for study hours, session totals, and chronological activity.
  - 60/60 automated tests passing across all suites.
- [x] **Phase 6: Real-Time Collaborative Code Editor**
  - Monaco code editor integration with syntax highlighting for 9 major programming languages.
  - Real-time concurrent document synchronization using Yjs CRDTs over authenticated Socket.IO.
  - Collaborative awareness tracking remote cursors, selections, and presence avatars.
  - Explicit workspace role hierarchy (`OWNER`, `EDITOR`, `VIEWER`) enforced on both REST and WebSocket layers.
  - PostgreSQL document persistence with debounced autosaving and versioned revision restoration.
  - Isolated execution boundary with starter templates and zero arbitrary server-side code execution.
  - 77/77 automated tests passing across all suites.
- [ ] **Phase 7: Interactive Study Room & Shared Whiteboard** *(Awaiting explicit user instruction)*
  - Group audio/video study circles.
  - Interactive shared canvas/whiteboard for visual problem solving.

