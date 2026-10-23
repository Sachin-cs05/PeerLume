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
│   │   │   ├── app/            # App entry and provider wrapper
│   │   │   ├── components/     # Reusable UI component library (Button, Badge, Card, Input, Alert, Spinner)
│   │   │   ├── hooks/          # React hooks (useHealth, etc.)
│   │   │   ├── layouts/        # RootLayout, Header, Footer
│   │   │   ├── pages/          # LandingPage, NotFoundPage
│   │   │   ├── routes/         # React Router configuration
│   │   │   ├── services/       # Typed API client with base URL configuration
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
│       │   ├── controllers/    # Request handlers (HealthController)
│       │   ├── middleware/     # Error handler, 404 handler, request logger, Zod validators
│       │   ├── routes/         # Express routers (/api/health, etc.)
│       │   ├── services/       # Business logic & telemetry probe (HealthService)
│       │   ├── utils/          # Standard response formatters & structured logger
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
│       │   ├── types/          # Standard ApiResponse, ApiErrorResponse, HealthCheckData
│       │   └── index.ts        # Package barrel exports
│       ├── tsconfig.json
│       └── package.json
├── prisma/
│   └── schema.prisma           # PostgreSQL Prisma schema foundation (User model)
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
| **Backend** | Node.js, Express 4, TypeScript, Zod schema validation, Helmet, CORS |
| **Database** | PostgreSQL, Prisma ORM 6 |
| **Testing & Quality** | Vitest, Supertest, ESLint, Prettier |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 or higher (v24 LTS recommended)
- **npm**: v10 or higher
- **PostgreSQL**: (Optional for Phase 1 exploration, required for live DB queries)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone <repo-url>
cd PeerLume

# Install monorepo dependencies across all workspaces
npm install
```

### 2. Configure Environment Variables

Copy the provided `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

Review and adjust variables as needed:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment (`development`, `test`, `production`) | `development` |
| `PORT` | Backend Express API port | `5000` |
| `WEB_ORIGIN` | Allowed CORS origin for the frontend client | `http://localhost:5173` |
| `DATABASE_URL` | PostgreSQL connection URL string | `postgresql://peerlume_user:peerlume_pass@localhost:5432/peerlume_db?schema=public` |
| `VITE_API_BASE_URL` | API base URL accessed by the browser | `http://localhost:5000/api` |

### 3. Generate Prisma Client

```bash
# Validate Prisma schema
npm run prisma:validate

# Generate Prisma Client
npm run prisma:generate
```

### 4. Run Development Servers

You can run both backend and frontend concurrently with a single command:

```bash
npm run dev
```

Or run them individually in dedicated terminals:

```bash
# Run Backend API (http://localhost:5000)
npm run dev:api

# Run Frontend Web App (http://localhost:5173)
npm run dev:web
```

---

## 🗄️ Database Setup & Migrations

PeerLume uses **Prisma ORM** targeting **PostgreSQL**.

### Connecting to PostgreSQL

When PostgreSQL is installed and running on your system or cloud provider:

1. Update `DATABASE_URL` in `.env` with your actual database credentials:
   ```text
   DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?schema=public"
   ```
2. Create and run the initial migration:
   ```bash
   npm run prisma:migrate -- --name init_phase1
   ```
3. To open the interactive Prisma Studio database viewer:
   ```bash
   npx prisma studio
   ```

> **Note on Environment Graceful Degradation:**
> If PostgreSQL is not currently running locally, the backend API will still boot and serve requests gracefully. The `GET /api/health` endpoint will report status `"degraded"` and provide diagnostics while keeping the HTTP server responsive.

---

## 🧪 Testing, Quality & Build Verification

The repository includes scripts to verify code quality, typing, tests, and production builds:

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

## 📋 Standard API Response Specification

All PeerLume API endpoints conform to a uniform response envelope:

### Success Response (`2xx`)
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation message",
  "timestamp": "2026-10-23T03:56:48.125Z"
}
```

### Error Response (`4xx` / `5xx`)
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Detailed error message",
    "details": []
  },
  "timestamp": "2026-10-23T03:56:48.125Z"
}
```

*Stack traces and internal database errors are automatically hidden in production.*

---

## 🗺️ Phase Roadmap

- [x] **Phase 1: Project Foundation**
  - Monorepo structure (`@peerlume/shared`, `@peerlume/api`, `@peerlume/web`).
  - Express API setup, Zod environment validation, graceful shutdown, health telemetry probe.
  - PostgreSQL Prisma schema foundation.
  - React + Vite + Tailwind CSS landing page with live telemetry and peer learning showcase.
  - Strict type checking, ESLint, Vitest test suite, and production build verification.
- [ ] **Phase 2: Identity & Peer Discovery** *(Planned next)*
  - Student registration and secure JWT authentication.
  - Student discovery profile (skills, learning goals, interests).
  - Direct connection requests (Learn with Friends).
  - Skill and subject-based study partner discovery.
- [ ] **Phase 3: Real-Time Collaboration** *(Future)*
  - Synchronous peer study rooms.
  - Collaborative code editing.
  - Audio/video communication.
  - Session scheduling.
