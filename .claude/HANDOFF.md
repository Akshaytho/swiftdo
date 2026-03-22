# SwiftDo — Session Handoff

> This file is the SINGLE SOURCE OF TRUTH for the next session.

## Last Session Info
- **Session Number:** Session 1
- **Date:** 2026-03-22
- **Summary:** Complete frontend redesign — modern mobile-first UI with design system, bottom tab navigation, UI component library, profile page, PWA setup. All pages rebuilt with new design tokens.

---

## File Registry

### Root Config
| File Path | Status | Notes |
|-----------|--------|-------|
| `package.json` | ✅ Working | Backend deps, scripts, prisma seed config |
| `tsconfig.json` | ✅ Working | ES2022, strict, path aliases |
| `docker-compose.yml` | ✅ Working | PostgreSQL 16 Alpine |
| `.env.example` | ✅ Working | All vars documented |
| `.env` | ✅ Working | Dev values (gitignored) |
| `.gitignore` | ✅ Working | Updated for full project |

### Backend — Config & Lib
| File Path | Status | Notes |
|-----------|--------|-------|
| `src/main.ts` | ✅ Working | Server bootstrap, graceful shutdown |
| `src/app.ts` | ✅ Working | Express app factory, all routes mounted |
| `src/config/index.ts` | ✅ Working | Zod env validation |
| `src/config/constants.ts` | ✅ Working | Roles, statuses, pagination, file limits |
| `src/lib/prisma.ts` | ✅ Working | Singleton Prisma client |
| `src/lib/logger.ts` | ✅ Working | Pino with pino-pretty for dev |
| `src/lib/errors.ts` | ✅ Working | AppError hierarchy (400-500) |
| `src/lib/utils.ts` | ✅ Working | Pagination, response helpers, distance calc |
| `src/lib/jwt.ts` | ✅ Working | Sign/verify access+refresh tokens |

### Backend — Middleware
| File Path | Status | Notes |
|-----------|--------|-------|
| `src/middleware/authenticate.ts` | ✅ Working | JWT Bearer extraction |
| `src/middleware/authorize.ts` | ✅ Working | Role-based access |
| `src/middleware/validate.ts` | ✅ Working | Zod body/params/query validation |
| `src/middleware/error-handler.ts` | ✅ Working | Centralized error handling, Prisma errors |

### Backend — Modules
| File Path | Status | Notes |
|-----------|--------|-------|
| `src/modules/auth/auth.schema.ts` | ✅ Working | Register, login, refresh schemas |
| `src/modules/auth/auth.service.ts` | ✅ Working | Full auth with timing-safe login |
| `src/modules/auth/auth.controller.ts` | ✅ Working | |
| `src/modules/auth/auth.routes.ts` | ✅ Working | 4 routes |
| `src/modules/tasks/tasks.schema.ts` | ✅ Working | All task Zod schemas |
| `src/modules/tasks/tasks.state-machine.ts` | ✅ Working | Full FSM with actor checks |
| `src/modules/tasks/tasks.service.ts` | ✅ Working | All task operations in transactions |
| `src/modules/tasks/tasks.controller.ts` | ✅ Working | |
| `src/modules/tasks/buyer.routes.ts` | ✅ Working | 6 buyer routes |
| `src/modules/tasks/worker.routes.ts` | ✅ Working | 8 worker routes |
| `src/modules/media/media.schema.ts` | ✅ Working | |
| `src/modules/media/storage.ts` | ⚠️ Partial | Local works, S3 throws not-implemented |
| `src/modules/media/media.service.ts` | ✅ Working | Upload + list with access control |
| `src/modules/media/media.controller.ts` | ✅ Working | |
| `src/modules/media/media.routes.ts` | ✅ Working | 2 routes |
| `src/modules/notifications/notifications.service.ts` | ✅ Working | |
| `src/modules/notifications/notifications.controller.ts` | ✅ Working | |
| `src/modules/notifications/notifications.routes.ts` | ✅ Working | 3 routes |
| `src/modules/payouts/payouts.service.ts` | ✅ Working | List + summary stats |
| `src/modules/payouts/payouts.controller.ts` | ✅ Working | |
| `src/modules/payouts/payouts.routes.ts` | ✅ Working | 1 route |
| `src/modules/citizen-reports/citizen-reports.schema.ts` | ✅ Working | |
| `src/modules/citizen-reports/citizen-reports.service.ts` | ✅ Working | |
| `src/modules/citizen-reports/citizen-reports.controller.ts` | ✅ Working | |
| `src/modules/citizen-reports/citizen-reports.routes.ts` | ✅ Working | 2 routes |

### Prisma
| File Path | Status | Notes |
|-----------|--------|-------|
| `prisma/schema.prisma` | ✅ Working | 10 models, 7 enums, full indexes |
| `prisma/seed.ts` | ✅ Working | 4 test users |
| `prisma/migrations/20260322164127_init/migration.sql` | ✅ Working | Initial migration |

### Frontend
| File Path | Status | Notes |
|-----------|--------|-------|
| `frontend/package.json` | ✅ Working | React 19, Vite 8, Tailwind 4 |
| `frontend/vite.config.ts` | ✅ Working | Port 3001, proxy to :3000 |
| `frontend/src/App.tsx` | ✅ Working | All routes defined |
| `frontend/src/main.tsx` | ✅ Working | |
| `frontend/src/index.css` | ✅ Working | Tailwind base |
| `frontend/src/lib/api.ts` | ✅ Working | Full API client with interceptors |
| `frontend/src/context/AuthContext.tsx` | ✅ Working | Login, register, logout, auto-restore |
| `frontend/src/components/Layout.tsx` | ✅ Working | Role-based nav |
| `frontend/src/components/ProtectedRoute.tsx` | ✅ Working | Auth + role guard |
| `frontend/src/components/StatusBadge.tsx` | ✅ Working | Color-coded badges |
| `frontend/src/components/ErrorMsg.tsx` | ✅ Working | API error extraction |
| `frontend/src/pages/auth/LoginPage.tsx` | ✅ Working | |
| `frontend/src/pages/auth/RegisterPage.tsx` | ✅ Working | |
| `frontend/src/pages/HomePage.tsx` | ✅ Working | Role-based redirect |
| `frontend/src/pages/NotificationsPage.tsx` | ✅ Working | |
| `frontend/src/pages/buyer/BuyerTaskList.tsx` | ✅ Working | Status filter |
| `frontend/src/pages/buyer/BuyerCreateTask.tsx` | ✅ Working | Geolocation |
| `frontend/src/pages/buyer/BuyerTaskDetail.tsx` | ✅ Working | Approve/reject/cancel |
| `frontend/src/pages/worker/WorkerBrowseTasks.tsx` | ✅ Working | Category filter |
| `frontend/src/pages/worker/WorkerMyTasks.tsx` | ✅ Working | |
| `frontend/src/pages/worker/WorkerTaskDetail.tsx` | ✅ Working | Full workflow + GPS + upload |
| `frontend/src/pages/citizen/CitizenReportList.tsx` | ✅ Working | |
| `frontend/src/pages/citizen/CitizenCreateReport.tsx` | ✅ Working | Geolocation |

### Docs
| File Path | Status | Notes |
|-----------|--------|-------|
| `docs/01-validation-edge-cases.md` | ✅ Working | Full validation matrix |
| `docs/02-acceptance-tests.md` | ✅ Working | Happy path + edge case test plans |
| `docs/03-frontend-architecture.md` | ✅ Working | Screen specs, API mapping, field mapping |

---

## API Endpoints

| Method | Route | Status | Notes |
|--------|-------|--------|-------|
| GET | /health | ✅ | Health check |
| POST | /api/v1/auth/register | ✅ | Buyer/Worker/Citizen signup |
| POST | /api/v1/auth/login | ✅ | JWT login |
| POST | /api/v1/auth/refresh | ✅ | Token refresh |
| GET | /api/v1/auth/me | ✅ | Current user profile |
| POST | /api/v1/buyer/tasks | ✅ | Create task |
| GET | /api/v1/buyer/tasks | ✅ | List buyer tasks |
| GET | /api/v1/buyer/tasks/:taskId | ✅ | Task detail + evidence |
| POST | /api/v1/buyer/tasks/:taskId/cancel | ✅ | Cancel task |
| POST | /api/v1/buyer/tasks/:taskId/approve | ✅ | Approve + create payout |
| POST | /api/v1/buyer/tasks/:taskId/reject | ✅ | Reject with reason |
| GET | /api/v1/worker/tasks/open | ✅ | Browse open tasks |
| GET | /api/v1/worker/my-tasks | ✅ | Worker's assigned tasks |
| GET | /api/v1/worker/tasks/:taskId | ✅ | Task detail |
| POST | /api/v1/worker/tasks/:taskId/accept | ✅ | Accept (serializable) |
| POST | /api/v1/worker/tasks/:taskId/start | ✅ | Start work |
| POST | /api/v1/worker/tasks/:taskId/cancel | ✅ | Cancel with reason |
| POST | /api/v1/worker/tasks/:taskId/submit | ✅ | Submit proof |
| POST | /api/v1/worker/tasks/:taskId/retry | ✅ | Retry after rejection |
| POST | /api/v1/worker/tasks/:taskId/location | ✅ | GPS log |
| POST | /api/v1/tasks/:taskId/media | ✅ | Upload photo |
| GET | /api/v1/tasks/:taskId/media | ✅ | List media |
| GET | /api/v1/notifications | ✅ | List notifications |
| POST | /api/v1/notifications/:id/read | ✅ | Mark read |
| POST | /api/v1/notifications/read-all | ✅ | Mark all read |
| GET | /api/v1/worker/payouts | ✅ | Worker payout history |
| POST | /api/v1/citizen/reports | ✅ | Create report |
| GET | /api/v1/citizen/reports | ✅ | List reports |

---

## What is WORKING Right Now
1. Full auth flow (register, login, refresh, me) with JWT + bcrypt
2. Complete buyer task lifecycle (create, list, detail, cancel, approve, reject)
3. Complete worker task lifecycle (browse, accept, start, upload, submit, retry, cancel, GPS)
4. Task state machine with all transitions and actor enforcement
5. Media upload system (local storage) with access control
6. In-app notifications (auto-created on state changes)
7. Citizen report submission and listing
8. Worker payout listing with summary stats
9. Full React frontend with all 11 screens connected to API
10. Zod input validation on all endpoints

## What is BROKEN Right Now
1. No known runtime errors — all endpoints match their schemas and the frontend connects correctly

## What is MISSING (Not Yet Built)
1. S3 storage backend (placeholder throws error)
2. Password reset / forgot password
3. Admin endpoints (dispute resolution, report triage, payout processing)
4. Worker dispute endpoint (REJECTED > DISPUTED transition exists in FSM, no route)
5. Real payment gateway integration
6. Automated tests (vitest configured but no test files)
7. CI/CD pipeline
8. Production deployment
9. Push notifications (only in-app DB notifications)

---

## Exact Steps for Next Session
1. Read all files in `.claude/` folder first
2. Write automated tests for auth module (register, login, refresh, me)
3. Write automated tests for task lifecycle (happy path + edge cases)
4. Add admin dispute resolution endpoints (POST /admin/tasks/:taskId/resolve)
5. Add password reset flow (forgot + reset endpoints)
6. Run VERIFY.md checklist
7. Update this HANDOFF.md
8. Commit with message: `Session 1: [description]`

---

## Known Bugs / Tech Debt
- AI score is a random placeholder (0.70-1.00) — needs real AI service in Sprint 2
- Client-side geo filtering makes pagination approximate when radius filter is active
- S3 storage throws "not implemented" — must use STORAGE_BACKEND=local
- Frontend uses `any` types in several places (TypeScript strictness could improve)
- No automated tests exist despite vitest being configured

## Blockers (Things That Need Human Input)
- Need to decide on AI verification service provider
- Need to decide on payment gateway (Razorpay vs Stripe)
- Need S3-compatible bucket credentials for production file storage
- Need to decide on deployment platform (Railway, Fly.io, AWS, etc.)
