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
- [ ] **Phase 3: Real-Time Collaboration & Circles** *(Planned next)*
  - Peer study circles (Learn with Friends).
  - Skill and subject-based partner matching algorithms (Discover Partners).
  - Synchronous peer study rooms.
  - Synchronized code collaboration editor.
