# SwiftDo — Sprint Tracker

> Sprint 1 status — marked from actual codebase review.

## Backend Features

### Authentication
- [x] User signup (email + password + name + role)
- [x] User login with JWT tokens
- [ ] Password reset / forgot password
- [ ] OAuth (Google / Apple / etc.)
- [x] Session management / token refresh
- [x] Role-based access control (BUYER, WORKER, CITIZEN, ADMIN middleware)

### Buyer Task API
- [x] Create task endpoint (POST /buyer/tasks)
- [x] List buyer's own tasks with pagination + status filter
- [x] Get task detail with evidence, GPS logs, events, payout
- [x] Cancel task (OPEN or ACCEPTED only)
- [x] Approve submitted task (creates payout, frees worker)
- [x] Reject submitted task with reason (frees worker)

### Worker Task API
- [x] Browse open tasks with category/urgency/geo filtering
- [x] Accept task (serializable isolation, one-active-task rule)
- [x] Start task (sets startedAt)
- [x] Submit task (requires 3 photo types, calculates time, placeholder AI score)
- [x] Retry after rejection
- [x] Cancel task with reason
- [x] GPS location logging during IN_PROGRESS
- [x] List worker's own assigned tasks

### Task State Machine
- [x] Full state machine: OPEN > ACCEPTED > IN_PROGRESS > SUBMITTED > APPROVED
- [x] Rejection/retry flow: SUBMITTED > REJECTED > IN_PROGRESS
- [x] Cancellation from non-terminal states
- [ ] Dispute flow (DISPUTED state defined, no endpoint yet)
- [ ] Admin dispute resolution endpoints

### Media / File Uploads
- [x] Upload evidence photos (before/after/proof) — worker only, IN_PROGRESS only
- [x] Upload reference images — buyer only
- [x] List task media
- [x] Local storage backend
- [ ] S3 storage backend (placeholder, throws "not implemented")

### Notifications
- [x] Auto-created on task state changes (accept, start, submit, approve, reject, cancel)
- [x] List notifications with pagination + unread count
- [x] Mark single notification as read
- [x] Mark all notifications as read

### Citizen Reports
- [x] Create report (issueType, description, location)
- [x] List own reports
- [ ] Admin review/triage of reports
- [ ] Link reports to tasks

### Payouts
- [x] Payout record created on task approval
- [x] Worker payout listing with summary stats
- [ ] Real payment gateway integration
- [ ] Admin payout processing/completion

### Database
- [x] Schema/migrations created (10 tables, 7 enums)
- [x] Seed data script (buyer, worker, citizen, admin test users)
- [x] Indexes on frequently queried columns (status, buyerId, workerId, category, urgency, composite)

---

## Frontend Features

### Navigation & Layout
- [x] Header nav with role-based links + role badge
- [x] ProtectedRoute with role checking
- [x] Home page redirects to role-specific dashboard
- [ ] Dark mode support
- [ ] Pull-to-refresh

### Screens (all built)
- [x] Login screen
- [x] Register screen (role selection: Buyer/Worker/Citizen)
- [x] Buyer: Task list with status filter
- [x] Buyer: Create task form (with geolocation)
- [x] Buyer: Task detail (evidence photos, GPS logs, approve/reject/cancel)
- [x] Worker: Browse open tasks (category filter)
- [x] Worker: My tasks list
- [x] Worker: Task detail (accept/start/upload/submit/retry/cancel + GPS tracking)
- [x] Citizen: Report list
- [x] Citizen: Create report form (with geolocation)
- [x] Notifications page (list, mark read, mark all read)

### UI/UX
- [x] Tailwind CSS styling (mobile-friendly max-w-lg layouts)
- [x] Form validation with error messages (API errors displayed)
- [x] Loading states on all pages
- [x] Empty state messages
- [x] Status badges with color coding
- [ ] Error boundary / fallback UI
- [ ] Empty state illustrations

### Integrations
- [ ] Push notifications (in-app only for now)
- [ ] Deep linking
- [ ] Analytics tracking
- [ ] Crash reporting

---

## DevOps & Deployment
- [x] Environment config (.env + Zod validation)
- [x] Docker Compose for PostgreSQL
- [ ] CI/CD pipeline
- [ ] Production deployment
- [ ] Monitoring / logging in production (Pino structured logging exists locally)

---

**Last updated:** Session 0 — 2026-03-22
