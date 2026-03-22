# SwiftDo — Project Overview

## What is SwiftDo?
SwiftDo is a task marketplace platform where Buyers post real-world tasks (cleaning, repair, delivery), Workers accept and complete them with photo evidence and GPS tracking, and Citizens report civic issues. It uses a state-machine-driven workflow with AI-readiness for proof verification.

## Tech Stack
- **Frontend:** React 19 + Vite 8 + Tailwind CSS 4 + React Router 7
- **Backend:** Node.js + Express 4 + TypeScript 5
- **Database:** PostgreSQL 16 via Prisma ORM 6.4
- **Auth:** JWT (access + refresh tokens) with bcrypt password hashing
- **Payments:** Record-only payout system (no real gateway — Sprint 1)
- **Hosting:** Not yet deployed (Docker Compose for local Postgres)
- **Other:** Zod validation, Pino logging, Multer file uploads, express-rate-limit

## Folder Structure
```
swiftdov2/
├── src/                          # Backend source
│   ├── config/                   # Env parsing (Zod), constants
│   ├── lib/                      # Prisma client, logger, JWT, errors, utils
│   ├── middleware/                # authenticate, authorize, validate, error-handler
│   └── modules/
│       ├── auth/                  # Register, login, refresh, me
│       ├── tasks/                 # Buyer + worker routes, state machine, service
│       ├── media/                 # File upload/storage (local + S3 placeholder)
│       ├── notifications/         # In-app notifications
│       ├── payouts/               # Worker payout listing
│       └── citizen-reports/       # Citizen issue reporting
├── frontend/                     # React SPA
│   └── src/
│       ├── lib/api.ts            # Axios API client
│       ├── context/AuthContext.tsx
│       ├── components/           # Layout, ProtectedRoute, StatusBadge, ErrorMsg
│       └── pages/                # auth, buyer, worker, citizen, notifications
├── prisma/                       # Schema, migrations, seed
├── docs/                         # Validation rules, acceptance tests, frontend architecture
├── uploads/                      # Local file storage (gitignored)
└── docker-compose.yml            # PostgreSQL 16
```

## User Roles
- **Guest:** Can register (BUYER/WORKER/CITIZEN) and login. No ADMIN self-registration.
- **Buyer:** Create tasks, list/view own tasks, cancel, approve/reject submissions.
- **Worker:** Browse open tasks, accept/start/submit/retry/cancel, upload evidence, log GPS.
- **Citizen:** Submit civic reports, list own reports.
- **Admin:** Exists in schema (dispute resolution), no endpoints built yet in Sprint 1.

## Environment Variables Required
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Min 32 chars, used for signing access/refresh tokens
- `JWT_ACCESS_EXPIRY` — Access token lifetime (default: 15m)
- `JWT_REFRESH_EXPIRY` — Refresh token lifetime (default: 7d)
- `BCRYPT_ROUNDS` — Password hash rounds (default: 12)
- `STORAGE_BACKEND` — `local` or `s3` (S3 not implemented yet)
- `STORAGE_LOCAL_PATH` — Path for local uploads (default: ./uploads)
- `CORS_ORIGINS` — Comma-separated allowed origins
- `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` — Global rate limit config

## How to Run Locally
```bash
docker compose up -d                # Start PostgreSQL
npm install                         # Install backend deps
npx prisma migrate dev              # Run migrations
npx prisma db seed                  # Seed test users (password: Test@1234)
npm run dev                         # Start backend on :3000
cd frontend && npm install && npm run dev  # Start frontend on :3001
```
