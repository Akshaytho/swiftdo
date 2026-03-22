# SwiftDo — Architecture Decisions

---

## Decision Log

### D1: Frontend Framework
- **Chosen:** React 19 with Vite 8 (SPA, not mobile)
- **Why:** Fast iteration for MVP web app. Vite provides instant HMR. React 19 is latest stable.
- **Alternatives considered:** React Native/Expo (mobile), Next.js (SSR)
- **Trade-offs:** No mobile app yet — web-first MVP. No SSR, but API proxy via Vite handles CORS in dev.

### D2: Backend Architecture
- **Chosen:** Express.js 4 REST API with TypeScript
- **Why:** Mature ecosystem, straightforward for CRUD + state machine workflows. TypeScript adds safety.
- **Alternatives considered:** Fastify, NestJS, Hono
- **Trade-offs:** Express is callback-heavy but extremely well-documented. No decorator-based DI (simpler but less structured than NestJS).

### D3: Database
- **Chosen:** PostgreSQL 16 via Prisma ORM
- **Why:** PostgreSQL for relational integrity (foreign keys, unique constraints, enums). Prisma for type-safe queries and migrations.
- **Schema approach:** Prisma schema as source of truth, `prisma migrate dev` for migrations.
- **Trade-offs:** Prisma's query API is less flexible than raw SQL for complex queries. Money stored as integer cents to avoid float issues.

### D4: Authentication
- **Chosen:** Custom JWT (access + refresh tokens) with bcrypt password hashing
- **Why:** Full control over auth flow. No external dependency (Supabase, Auth0). Stateless access tokens.
- **Session strategy:** 15-minute access tokens + 7-day refresh tokens. Tokens stored in localStorage on frontend.
- **Trade-offs:** No token blacklisting/revocation — compromised tokens valid until expiry. Timing-safe login prevents email enumeration.

### D5: State Management (Frontend)
- **Chosen:** React Context (AuthContext) + local component state
- **Why:** Simple enough for Sprint 1. No global state library needed when each page fetches its own data.
- **Trade-offs:** No caching or optimistic updates. Each navigation re-fetches. Acceptable for MVP.

### D6: Styling Approach
- **Chosen:** Tailwind CSS 4 (via @tailwindcss/vite plugin)
- **Why:** Utility-first, fast prototyping, no separate CSS files. Mobile-friendly with responsive classes.
- **Trade-offs:** Long className strings. No component library (all custom UI).

### D7: API Communication Pattern
- **Chosen:** Axios with interceptors (frontend) + Express (backend)
- **Why:** Axios provides request/response interceptors for token attachment and 401 auto-redirect.
- **Error handling approach:** Backend: centralized error handler catches AppError subclasses + Prisma errors. Frontend: `getErrorMsg()` extracts `error.response.data.error.message`. All errors follow `{ success: false, error: { code, message, details? } }` shape.

### D8: File/Folder Structure Pattern
- **Chosen:** Feature-based module structure (backend), page-based (frontend)
- **Why:** Each backend module (auth, tasks, media, etc.) has its own schema, service, controller, routes. Easy to find and modify a feature in isolation.
- **Frontend:** Pages organized by role (buyer/, worker/, citizen/) matching the URL structure.

### D9: Payment System
- **Chosen:** Record-only payout system (no real gateway in Sprint 1)
- **Why:** MVP focuses on task workflow. Payout records track intent — gateway integration deferred.
- **Currency:** INR (Indian Rupees), stored as integer cents to avoid floating point.
- **Sprint 2:** Integrate Razorpay or Stripe for actual payouts.

### D10: Deployment Strategy
- **Chosen:** Not yet deployed. Docker Compose for local PostgreSQL only.
- **Why:** Sprint 1 is local development only.
- **CI/CD:** Not configured yet. vitest configured but no test files written.

### D11: Task State Machine
- **Chosen:** Explicit state transition table with actor enforcement
- **Why:** Tasks have complex lifecycle (OPEN > ACCEPTED > IN_PROGRESS > SUBMITTED > APPROVED/REJECTED). A state machine prevents invalid transitions and enforces who can trigger each transition.
- **Trade-offs:** All transition logic in code (not DB triggers). assertTransition() called inside transactions for race safety.

### D12: One-Active-Task Rule
- **Chosen:** Workers can only have one active task at a time, enforced at DB level (unique constraint on `activeTaskId`) and service level.
- **Why:** Prevents workers from overcommitting. Serializable transaction isolation prevents double-accept races.
- **Trade-offs:** Workers must complete/cancel current task before accepting another. Sprint 2 may allow configurable concurrency.

### D13: Evidence Requirements
- **Chosen:** Workers must upload BEFORE_PHOTO, AFTER_PHOTO, and PROOF_PHOTO before submitting
- **Why:** Photo evidence is core to the marketplace trust model. Required before submission, not after.
- **Trade-offs:** Workers can't submit partial evidence. Photos only during IN_PROGRESS state.

### D14: Input Validation Strategy
- **Chosen:** Zod schemas validated in middleware (before controller) for body/params/query
- **Why:** Type-safe validation with automatic TypeScript type inference. Consistent error format.
- **Exception:** Media upload validates after multer parses multipart (can't use middleware for multipart body fields).

### D15: Logging Strategy
- **Chosen:** Pino structured JSON logging with pino-pretty for dev, pino-http for request logging
- **Why:** High-performance structured logging. Module-specific child loggers (createModuleLogger).
- **Trade-offs:** No external log aggregation yet. Health check requests excluded from logs.

---

## Patterns Used Consistently

### API Response Format
```json
// Success
{ "success": true, "data": { ... } }
// Success with pagination
{ "success": true, "data": [...], "meta": { "page": 1, "limit": 20, "total": 50, "totalPages": 3 } }
// Error
{ "success": false, "error": { "code": "MACHINE_READABLE_CODE", "message": "Human-readable", "details": {} } }
```

### Error Handling Pattern
- Backend: try/catch in every controller method, errors passed to `next(err)`.
- Global `errorHandler` middleware maps AppError subclasses, Prisma errors, and unknown errors to JSON responses.
- Frontend: `getErrorMsg(err)` extracts API error message or falls back to generic string.

### Naming Conventions
- Files: `kebab-case` (e.g., `auth.service.ts`, `citizen-reports.controller.ts`)
- Classes: `PascalCase` (e.g., `TasksService`, `AuthController`)
- Database tables: `snake_case` (e.g., `worker_profiles`, `task_media`)
- Database columns: `snake_case` via Prisma `@map()`
- API routes: `kebab-case` paths under `/api/v1/` (e.g., `/api/v1/buyer/tasks/:taskId/approve`)
- Frontend components: `PascalCase` files and exports

### Transaction Pattern
- All state-changing task operations use `prisma.$transaction()` with re-read inside transaction
- Accept task uses `Serializable` isolation level for race condition safety
- Events logged in same transaction as state change (atomic audit trail)

---

## Decisions Still Needed
- [ ] AI verification service provider (placeholder random score exists)
- [ ] Payment gateway: Razorpay vs Stripe
- [ ] S3-compatible storage provider for production
- [ ] Deployment platform (Railway, Fly.io, AWS, Vercel)
- [ ] Push notification provider (FCM, OneSignal, etc.)
- [ ] Worker rating algorithm (rating field exists, no update logic)
- [ ] Multi-task concurrency for experienced workers
- [ ] Admin dashboard scope and design
- [ ] Token blacklisting / revocation strategy
