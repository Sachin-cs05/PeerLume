# PeerLearn

PeerLearn is an autonomous peer-to-peer learning platform designed for students. It enables learners to connect with classmates, find study partners tailored to their academic goals and skills, and collaborate in real time. Built with student privacy and focus in mind, PeerLearn provides an all-in-one virtual study space without bureaucratic overhead or administrative clutter.

### Core Features
- **Profiles**: Customize student identity with academic majors, learning styles, goals, bio, and technical skills.
- **Partner Discovery**: Search and discover study partners using smart tag filters, learning styles, and compatibility matching.
- **Friends & Connections**: Send, accept, or manage study connection requests to build a personal academic network.
- **Chat & Calls**: Direct messaging with typing indicators, presence tracking, and peer-to-peer WebRTC audio/video calls.
- **Study Sessions**: Schedule and coordinate focused study sessions with calendar sync, agendas, and attendance tracking.
- **Shared Workspace**: Collaborate on markdown notes, task boards, and study resources in real time.
- **Code Collaboration**: Write, run, and review code together in synchronized workspaces supporting multiple languages.
- **Study Rooms with Whiteboard**: Join live interactive study rooms equipped with a collaborative digital whiteboard.
- **Student Dashboard**: Track active study sessions, connection requests, recent notifications, and upcoming deadlines in one place.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Socket.io Client |
| **Backend** | Node.js, Express, TypeScript, Socket.io, Zod, Argon2id, JWT (HttpOnly cookies) |
| **Database & ORM** | PostgreSQL, Prisma ORM |
| **Shared** | Monorepo shared TypeScript package (`@peerlume/shared`) |
| **Tooling & Ops** | npm workspaces, Docker, Docker Compose, Nginx, Vitest, ESLint |

---

## Quick Start

### Prerequisites
- **Node.js**: `>= 20.0.0` (see `.nvmrc` and `engines` in `package.json`)
- **npm**: `>= 10.0.0`
- **PostgreSQL**: Local instance (v14+) or remote connection (e.g. Neon, Supabase)

### 1. Clone & Setup Environment
```bash
git clone https://github.com/your-username/peerlume.git
cd peerlume
cp .env.example .env
```
Open `.env` and verify your `DATABASE_URL`. Ensure development secrets are present for local runs.

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database Schema
```bash
# Push schema or run migrations to sync database
npx prisma migrate dev
# Or for rapid development / direct push:
# npx prisma db push
```

### 4. Start Development Servers
```bash
npm run dev
```

### Access URLs
- **Web Application**: [http://localhost:5173](http://localhost:5173)
- **API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## Environment Variables

Configure these variables in your root `.env` file:

| Variable | Required? | Default / Example | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | Runtime environment (`development`, `test`, `production`). |
| `PORT` | No | `5000` | Port on which the Express API server listens. |
| `WEB_ORIGIN` | No | `http://localhost:5173` | Allowed frontend origin for CORS and credentials. |
| `APP_BASE_URL` | No | `http://localhost:5173` | Base URL used for email links and notifications. |
| `DATABASE_URL` | **Yes** | `postgresql://...` | PostgreSQL connection string including credentials and schema. |
| `JWT_ACCESS_SECRET` | **Yes** (prod) | `peerlume_dev_...` | Secret key used to sign access tokens (min 32 chars in prod). |
| `JWT_REFRESH_SECRET` | **Yes** (prod) | `peerlume_dev_...` | Secret key used to sign refresh tokens (min 32 chars in prod). |
| `COOKIE_SECRET` | **Yes** (prod) | `peerlume_dev_...` | Secret used to sign HttpOnly session cookies (min 32 chars in prod). |
| `EMAIL_PROVIDER` | No | `development` | Email mode (`development` logs to console, `smtp` sends real emails). |
| `SMTP_HOST` | No | `smtp.example.com` | SMTP relay server hostname (when `EMAIL_PROVIDER=smtp`). |
| `SMTP_PORT` | No | `587` | SMTP server port. |
| `SMTP_USER` | No | `user@example.com` | SMTP username / credential. |
| `SMTP_PASS` | No | `secret` | SMTP password / credential. |
| `EMAIL_FROM` | No | `PeerLearn <noreply@...>` | Outgoing sender display name and address. |
| `STUN_SERVERS` | No | `stun:stun.l.google...` | Comma-delimited STUN server URIs for WebRTC peer connections. |
| `TURN_SERVER` | No | - | Optional TURN server URI for WebRTC NAT traversal. |
| `TURN_USERNAME` | No | - | Optional TURN server username. |
| `TURN_CREDENTIAL` | No | - | Optional TURN server password/secret. |
| `VITE_API_BASE_URL` | No | `http://localhost:5000/api` | API endpoint used by the frontend Vite application. |

> **Security Note**: Never use dev secrets in production. Generate random 32-byte hexadecimal strings using `openssl rand -hex 32`.

---

## Project Structure

```text
peerlume/
├── apps/
│   ├── api/             # Express backend, Prisma client, WebSockets, auth, routes
│   └── web/             # React + Vite frontend, Tailwind styling, context, pages
├── packages/
│   └── shared/          # Monorepo shared TypeScript types, DTOs, and constants
├── prisma/
│   ├── schema.prisma    # Database schema definition
│   └── migrations/      # Historical SQL migrations
├── docker-compose.yml   # Multi-container orchestration (Postgres, API, Web)
├── Dockerfile.api       # Node.js production image for Express backend
├── Dockerfile.web       # Multi-stage Nginx build for React frontend
└── nginx.conf           # Reverse proxy configuration for containerized web
```

---

## Useful Scripts

Run these scripts from the repository root:

| Command | Description |
|---|---|
| `npm run dev` | Concurrently starts `apps/api` (port 5000) and `apps/web` (port 5173). |
| `npm run build` | Builds `@peerlume/shared`, `@peerlume/api`, and `@peerlume/web`. |
| `npm run typecheck` | Runs TypeScript compiler checks across all workspaces. |
| `npm run lint` | Runs ESLint across all workspace packages and apps. |
| `npm test` | Runs automated test suites in `apps/api` with Vitest. |
| `npm run format` | Formats all code using Prettier. |

---

## Testing

Backend test suites are implemented with **Vitest** and **Supertest** located in `apps/api/tests/`:

```bash
# Run all unit and integration test suites
npm test

# Run tests in watch mode during development
npm --workspace=@peerlume/api run test:watch
```

Tests run in-memory with mocked database calls and authentication services, enabling fast, isolated verification without altering database state.

---

## Docker / Deployment

The application includes production Docker configurations for full-stack deployment:

### Run Locally with Docker Compose
```bash
# Build and launch PostgreSQL, API, and Web containers
docker-compose up --build -d

# View service logs
docker-compose logs -f

# Shut down containers and retain database volume
docker-compose down
```

### Container Setup
- **PostgreSQL**: `postgres:16-alpine` running on port `5432` with health checks and persistent volume `postgres_data`.
- **API**: Multi-stage Node.js alpine container running Express on port `5000`.
- **Web**: Multi-stage build producing static React assets served through Nginx on port `80`, routing `/api` and `/socket.io` to the API container.

---

## Troubleshooting

### 1. Database Connection Error (`P1001` / Connection Refused)
Ensure PostgreSQL is running locally on port 5432 or that your remote database URL is reachable. Verify credentials in `.env` and verify network accessibility.

### 2. Port Already in Use (EADDRINUSE: 5000 or 5173)
Another process is using the required port. Terminate the conflicting process or adjust `PORT` in `.env` for the API and pass `--port <new_port>` to Vite.

### 3. Prisma Client Not Generated
If you see `@prisma/client did not initialize yet`:
```bash
npx prisma generate
```

### 4. CORS or Web Origin Mismatches
If API requests or WebSocket handshakes fail due to CORS:
- Ensure `WEB_ORIGIN` in `.env` matches your browser URL (e.g., `http://localhost:5173`).
- In production, configure `WEB_ORIGIN` to match your production domain.
