# SwiftDo — Session Handoff

> This file is the SINGLE SOURCE OF TRUTH for the next session.

## Last Session Info
- **Session Number:** Session 2
- **Date:** 2026-03-23
- **Summary:** Premium UI redesign — gradient hero screens, glassmorphism nav, animated login, role-colored profile, urgency-accented task cards, emoji category pills. Zero TS errors, build 338KB.

---

## Frontend URL
| Environment | URL |
|-------------|-----|
| Local dev | `http://localhost:3001` |
| GitHub repo | `https://github.com/Akshaytho/swiftdo` |
| Production | ❌ Not deployed yet |

**To run locally:**
```bash
# Terminal 1 — backend
cd /Users/thotaakshay/swiftdov2
npm run dev   # starts on :3000

# Terminal 2 — frontend
cd /Users/thotaakshay/swiftdov2/frontend
npm run dev   # starts on :3001, proxies /api → :3000
```

---

## Data Flow Check (Session 2 — PASSED ✅)

### Auth Flow
| Step | Code | Status |
|------|------|--------|
| Login/Register | POST `/api/v1/auth/login` or `/register` → `{ user, accessToken, refreshToken }` → localStorage | ✅ |
| App load token restore | `authApi.me()` called on mount if token exists → refreshes user state | ✅ |
| 401 global handler | Axios interceptor clears localStorage + redirects to `/login` | ✅ |
| Logout | `localStorage.clear()` + `setUser(null)` | ✅ |

### API Proxy
| Item | Config | Status |
|------|--------|--------|
| Vite dev port | 3001 | ✅ |
| `/api/*` proxy | → `http://localhost:3000` | ✅ |
| `/uploads/*` proxy | → `http://localhost:3000` | ✅ |
| Axios baseURL | `/api/v1` | ✅ |

### API Client ↔ Backend Routes
| Module | Methods | Status |
|--------|---------|--------|
| authApi | register, login, me | ✅ All match |
| buyerApi | createTask, listTasks, getTask, cancelTask, approveTask, rejectTask | ✅ All match |
| workerApi | listOpenTasks, getTask, myTasks, acceptTask, startTask, cancelTask, submitTask, retryTask, logLocation | ✅ All match |
| mediaApi | upload (multipart/form-data), list | ✅ |
| notificationApi | list, markRead, markAllRead | ✅ |
| citizenApi | createReport, listReports | ✅ |
| payoutApi | list | ✅ |

**No broken API calls found.**

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
| `src/modules/auth/auth.service.ts` | ✅ Working | Full auth with timing-safe login |
| `src/modules/tasks/tasks.state-machine.ts` | ✅ Working | Full FSM with actor checks |
| `src/modules/tasks/tasks.service.ts` | ✅ Working | All task operations in transactions |
| `src/modules/media/storage.ts` | ⚠️ Partial | Local works, S3 throws not-implemented |
| `src/modules/notifications/notifications.service.ts` | ✅ Working | |
| `src/modules/payouts/payouts.service.ts` | ✅ Working | List + summary stats |
| `src/modules/citizen-reports/citizen-reports.service.ts` | ✅ Working | |

### Prisma
| File Path | Status | Notes |
|-----------|--------|-------|
| `prisma/schema.prisma` | ✅ Working | 10 models, 7 enums, full indexes |
| `prisma/seed.ts` | ✅ Working | 4 test users |

### Frontend — Core
| File Path | Status | Notes |
|-----------|--------|-------|
| `frontend/src/index.css` | ✅ Working | Gradient utilities, animations, glassmorphism, colored shadows |
| `frontend/src/App.tsx` | ✅ Working | All routes defined |
| `frontend/src/lib/api.ts` | ✅ Working | Full API client, 401 interceptor |
| `frontend/src/context/AuthContext.tsx` | ✅ Working | Login, register, logout, auto-restore |

### Frontend — UI Components
| File Path | Status | Notes |
|-----------|--------|-------|
| `frontend/src/components/ui/Button.tsx` | ✅ Working | Gradient primary with glow shadow, success variant |
| `frontend/src/components/ui/Card.tsx` | ✅ Working | shadow-card, hover lift, colored left-border accent prop |
| `frontend/src/components/ui/Input.tsx` | ✅ Working | Label, error, icon |
| `frontend/src/components/ui/Badge.tsx` | ✅ Working | 16 status/priority color mappings |
| `frontend/src/components/ui/Avatar.tsx` | ✅ Working | Initials, deterministic color, 4 sizes |
| `frontend/src/components/ui/TopBar.tsx` | ✅ Working | Sticky, backdrop blur, back button |
| `frontend/src/components/ui/Skeleton.tsx` | ✅ Working | TaskCardSkeleton, PageSkeleton |
| `frontend/src/components/ui/EmptyState.tsx` | ✅ Working | Icon/title/description/action |
| `frontend/src/components/layout/AppShell.tsx` | ✅ Working | Outlet + BottomNav + pb-20 |
| `frontend/src/components/layout/BottomNav.tsx` | ✅ Working | Glassmorphism bg, gradient pill, gradient FAB |

### Frontend — Pages
| File Path | Status | Notes |
|-----------|--------|-------|
| `frontend/src/pages/auth/LoginPage.tsx` | ✅ Working | Gradient hero, floating shapes, stats row, slide-up form |
| `frontend/src/pages/auth/RegisterPage.tsx` | ✅ Working | Gradient hero, animated role cards with checkmark |
| `frontend/src/pages/ProfilePage.tsx` | ✅ Working | Role-colored gradient hero, stats grid, menu sections |
| `frontend/src/pages/buyer/BuyerTaskList.tsx` | ✅ Working | Gradient greeting banner, urgency-colored cards |
| `frontend/src/pages/worker/WorkerBrowseTasks.tsx` | ✅ Working | Green gradient hero, emoji category pills, hot badges |
| `frontend/src/pages/buyer/BuyerCreateTask.tsx` | ✅ Working | Geolocation |
| `frontend/src/pages/buyer/BuyerTaskDetail.tsx` | ✅ Working | Approve/reject/cancel |
| `frontend/src/pages/worker/WorkerMyTasks.tsx` | ✅ Working | |
| `frontend/src/pages/worker/WorkerTaskDetail.tsx` | ✅ Working | Full workflow + GPS + upload |
| `frontend/src/pages/NotificationsPage.tsx` | ✅ Working | |
| `frontend/src/pages/citizen/CitizenReportList.tsx` | ✅ Working | |
| `frontend/src/pages/citizen/CitizenCreateReport.tsx` | ✅ Working | Geolocation |

---

## API Endpoints (all ✅)

| Method | Route | Notes |
|--------|-------|-------|
| GET | /health | Health check |
| POST | /api/v1/auth/register | Buyer/Worker/Citizen signup |
| POST | /api/v1/auth/login | JWT login |
| POST | /api/v1/auth/refresh | Token refresh |
| GET | /api/v1/auth/me | Current user profile |
| POST | /api/v1/buyer/tasks | Create task |
| GET | /api/v1/buyer/tasks | List buyer tasks |
| GET | /api/v1/buyer/tasks/:taskId | Task detail + evidence |
| POST | /api/v1/buyer/tasks/:taskId/cancel | Cancel task |
| POST | /api/v1/buyer/tasks/:taskId/approve | Approve + create payout |
| POST | /api/v1/buyer/tasks/:taskId/reject | Reject with reason |
| GET | /api/v1/worker/tasks/open | Browse open tasks |
| GET | /api/v1/worker/my-tasks | Worker's assigned tasks |
| GET | /api/v1/worker/tasks/:taskId | Task detail |
| POST | /api/v1/worker/tasks/:taskId/accept | Accept (serializable) |
| POST | /api/v1/worker/tasks/:taskId/start | Start work |
| POST | /api/v1/worker/tasks/:taskId/cancel | Cancel with reason |
| POST | /api/v1/worker/tasks/:taskId/submit | Submit proof |
| POST | /api/v1/worker/tasks/:taskId/retry | Retry after rejection |
| POST | /api/v1/worker/tasks/:taskId/location | GPS log |
| POST | /api/v1/tasks/:taskId/media | Upload photo |
| GET | /api/v1/tasks/:taskId/media | List media |
| GET | /api/v1/notifications | List notifications |
| POST | /api/v1/notifications/:id/read | Mark read |
| POST | /api/v1/notifications/read-all | Mark all read |
| GET | /api/v1/worker/payouts | Worker payout history |
| POST | /api/v1/citizen/reports | Create report |
| GET | /api/v1/citizen/reports | List reports |

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
10. Premium mobile-first UI — gradients, glassmorphism, animations, hero screens

## What is BROKEN Right Now
1. No known runtime errors

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
2. If user shares UI screenshot → rebuild UI to match
3. Write automated tests for auth module
4. Write automated tests for task lifecycle (happy path + edge cases)
5. Add admin dispute resolution endpoints
6. Add password reset flow
7. Deploy to Railway / Fly.io
8. Update this HANDOFF.md

---

## Known Bugs / Tech Debt
- AI score is a random placeholder (0.70–1.00) — needs real AI service in Sprint 2
- Client-side geo filtering makes pagination approximate when radius filter is active
- S3 storage throws "not implemented" — must use STORAGE_BACKEND=local
- No automated tests exist despite vitest being configured
- Pages not yet redesigned with new premium style: BuyerTaskDetail, WorkerTaskDetail, WorkerMyTasks, Notifications, CitizenReport pages (still use old TopBar style)

## Blockers (Things That Need Human Input)
- Need to decide on AI verification service provider
- Need to decide on payment gateway (Razorpay vs Stripe)
- Need S3-compatible bucket credentials for production file storage
- Need to decide on deployment platform (Railway, Fly.io, AWS, etc.)
- User wants to match a specific UI design from Claude mobile — needs to share screenshot
