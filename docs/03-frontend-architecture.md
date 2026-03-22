# Sprint 1 — Frontend Screen Architecture

## 1. Screens by Role

### Public (no auth)
| Screen | Route | Purpose |
|--------|-------|---------|
| Login | `/login` | Email + password login |
| Register | `/register` | Email + password + name + role selection |

### Buyer (4 screens)
| Screen | Route | Purpose |
|--------|-------|---------|
| Task List | `/buyer/tasks` | View all tasks with status filter |
| Create Task | `/buyer/tasks/new` | Form to post a new task |
| Task Detail | `/buyer/tasks/:taskId` | View task with evidence, approve/reject |
| Notifications | `/notifications` | View and manage notifications |

### Worker (4 screens)
| Screen | Route | Purpose |
|--------|-------|---------|
| Browse Tasks | `/worker/tasks` | View open tasks, filter by category |
| My Tasks | `/worker/my-tasks` | View assigned/completed tasks |
| Task Detail | `/worker/tasks/:taskId` | Accept/start/upload/submit/retry/cancel |
| Notifications | `/notifications` | View and manage notifications |

### Citizen (3 screens)
| Screen | Route | Purpose |
|--------|-------|---------|
| Report List | `/citizen/reports` | View submitted reports |
| Create Report | `/citizen/reports/new` | Form to submit issue report |
| Notifications | `/notifications` | View and manage notifications |

---

## 2. User Flows

### Flow A: Buyer Posts and Reviews Task
```
Login → Task List → [+ New Task] → Create Task Form
  → Fill title, category, notes, location, rate, urgency
  → Submit → Redirect to Task List
  → ...wait for worker to complete...
  → Task List (filter: SUBMITTED) → Click task
  → Task Detail: see photos, GPS summary, AI score, time
  → [Approve] or [Reject with reason]
  → Task status updates, payout shown if approved
```

### Flow B: Worker Completes Task
```
Login → Browse Tasks → Click task → Task Detail
  → [Accept Task] → status ACCEPTED
  → [Start Work] → status IN_PROGRESS, GPS tracking starts
  → Upload Before Photo ✓
  → Upload After Photo ✓
  → Upload Proof Photo ✓
  → [Submit for Review] → status SUBMITTED
  → ...wait for buyer decision...
  → If REJECTED: [Retry Task] → back to IN_PROGRESS
  → If APPROVED: see in My Tasks as completed
```

### Flow C: Worker Cancels Mid-Task
```
Task Detail (ACCEPTED or IN_PROGRESS)
  → [Cancel Task] → Enter reason → Confirm
  → Worker freed, buyer notified
```

### Flow D: Citizen Reports Issue
```
Login → Report List → [+ New Report]
  → Fill issue type, description, location
  → Submit → Redirect to Report List
  → See report with status REPORTED
```

---

## 3. API Mapping per Screen

### Login (`/login`)
| Action | API Call | Method |
|--------|---------|--------|
| Submit login form | `POST /api/v1/auth/login` | authApi.login |
| Store tokens | localStorage | — |

### Register (`/register`)
| Action | API Call | Method |
|--------|---------|--------|
| Submit register form | `POST /api/v1/auth/register` | authApi.register |

### Buyer Task List (`/buyer/tasks`)
| Action | API Call | Method |
|--------|---------|--------|
| Load tasks | `GET /api/v1/buyer/tasks?status=X` | buyerApi.listTasks |
| Filter by status | Same with query param | buyerApi.listTasks |

### Buyer Create Task (`/buyer/tasks/new`)
| Action | API Call | Method |
|--------|---------|--------|
| Submit form | `POST /api/v1/buyer/tasks` | buyerApi.createTask |
| Get GPS | Browser Geolocation API | navigator.geolocation |

### Buyer Task Detail (`/buyer/tasks/:taskId`)
| Action | API Call | Method |
|--------|---------|--------|
| Load task + media + GPS + events | `GET /api/v1/buyer/tasks/:taskId` | buyerApi.getTask |
| Approve | `POST /api/v1/buyer/tasks/:taskId/approve` | buyerApi.approveTask |
| Reject | `POST /api/v1/buyer/tasks/:taskId/reject` | buyerApi.rejectTask |
| Cancel | `POST /api/v1/buyer/tasks/:taskId/cancel` | buyerApi.cancelTask |

### Worker Browse Tasks (`/worker/tasks`)
| Action | API Call | Method |
|--------|---------|--------|
| Load open tasks | `GET /api/v1/worker/tasks/open` | workerApi.listOpenTasks |
| Filter by category | Same with `?category=X` | workerApi.listOpenTasks |

### Worker My Tasks (`/worker/my-tasks`)
| Action | API Call | Method |
|--------|---------|--------|
| Load assigned tasks | `GET /api/v1/worker/my-tasks` | workerApi.myTasks |

### Worker Task Detail (`/worker/tasks/:taskId`)
| Action | API Call | Method |
|--------|---------|--------|
| Load task | `GET /api/v1/worker/tasks/:taskId` | workerApi.getTask |
| Load media | `GET /api/v1/tasks/:taskId/media` | mediaApi.list |
| Accept | `POST /api/v1/worker/tasks/:taskId/accept` | workerApi.acceptTask |
| Start | `POST /api/v1/worker/tasks/:taskId/start` | workerApi.startTask |
| Upload photo | `POST /api/v1/tasks/:taskId/media` (multipart) | mediaApi.upload |
| Log GPS | `POST /api/v1/worker/tasks/:taskId/location` | workerApi.logLocation |
| Submit | `POST /api/v1/worker/tasks/:taskId/submit` | workerApi.submitTask |
| Retry | `POST /api/v1/worker/tasks/:taskId/retry` | workerApi.retryTask |
| Cancel | `POST /api/v1/worker/tasks/:taskId/cancel` | workerApi.cancelTask |

### Citizen Report List (`/citizen/reports`)
| Action | API Call | Method |
|--------|---------|--------|
| Load reports | `GET /api/v1/citizen/reports` | citizenApi.listReports |

### Citizen Create Report (`/citizen/reports/new`)
| Action | API Call | Method |
|--------|---------|--------|
| Submit form | `POST /api/v1/citizen/reports` | citizenApi.createReport |
| Get GPS | Browser Geolocation API | navigator.geolocation |

### Notifications (`/notifications`)
| Action | API Call | Method |
|--------|---------|--------|
| Load notifications | `GET /api/v1/notifications` | notificationApi.list |
| Mark one read | `POST /api/v1/notifications/:id/read` | notificationApi.markRead |
| Mark all read | `POST /api/v1/notifications/read-all` | notificationApi.markAllRead |

---

## 4. Field Mapping (Form → API)

### Create Task Form → `POST /buyer/tasks`
| Form Field | API Field | Type | Required |
|-----------|-----------|------|----------|
| Title | title | string (3-200) | Yes |
| Category (dropdown) | category | string (1-50) | Yes |
| Task Notes (textarea) | taskNotes | string (10-2000) | Yes |
| Location (text) | locationText | string (1-300) | Yes |
| Latitude | lat | number (-90 to 90) | Yes |
| Longitude | lng | number (-180 to 180) | Yes |
| Urgency (dropdown) | urgency | enum | Yes (default MEDIUM) |
| Offered Rate (Rs) | offeredRate | number (> 0) | Yes |
| Extra Note | extraNote | string (max 500) | No |
| Expected By (date) | expectedCompletionBy | ISO date | No |

### Create Report Form → `POST /citizen/reports`
| Form Field | API Field | Type | Required |
|-----------|-----------|------|----------|
| Issue Type (dropdown) | issueType | string (1-50) | Yes |
| Description (textarea) | description | string (10-2000) | Yes |
| Location (text) | locationText | string (max 300) | No |
| Latitude | lat | number (-90 to 90) | No |
| Longitude | lng | number (-180 to 180) | No |

Note: `urgency` and `photoUrl` are accepted by the API but not exposed in the Sprint 1 frontend to keep the citizen form simple. Can be added in Sprint 2.

### Upload Media Form → `POST /tasks/:taskId/media`
| Form Field | API Field | Type | Required |
|-----------|-----------|------|----------|
| File (file input) | file | File (jpeg/png/webp, max 10MB) | Yes |
| Photo Type (dropdown) | mediaType | enum | Yes |

### Reject Task Form → `POST /buyer/tasks/:taskId/reject`
| Form Field | API Field | Type | Required |
|-----------|-----------|------|----------|
| Rejection Reason (textarea) | reason | string (5-1000) | Yes |

### Cancel Task Form (Worker) → `POST /worker/tasks/:taskId/cancel`
| Form Field | API Field | Type | Required |
|-----------|-----------|------|----------|
| Cancellation Reason (textarea) | reason | string (5-500) | Yes |

---

## 5. Error/Loading/Empty States

### Global States
| State | UI Behavior |
|-------|------------|
| **Loading** | Centered gray "Loading..." text |
| **Empty** | Centered gray message: "No tasks yet", "No reports yet", etc. |
| **Error** | Red banner with error message from API (`error.response.data.error.message`) |
| **401 Unauthorized** | Auto-redirect to `/login`, clear localStorage |
| **403 Forbidden** | Auto-redirect to `/` (role home page) via ProtectedRoute |

### Per-Screen States

| Screen | Loading | Empty | Error |
|--------|---------|-------|-------|
| Buyer Task List | "Loading..." | "No tasks yet" + link to create | API error banner |
| Buyer Create Task | Submit button shows "Creating..." | N/A | Validation or API error banner |
| Buyer Task Detail | "Loading..." | "Task not found" | API error banner |
| Worker Browse | "Loading..." | "No open tasks available" | API error banner |
| Worker My Tasks | "Loading..." | "No tasks assigned yet" | API error banner |
| Worker Task Detail | "Loading..." | "Task not found" | API error + action error banners |
| Citizen Reports | "Loading..." | "No reports yet" + link to create | API error banner |
| Citizen Create Report | Submit button shows "Submitting..." | N/A | Validation or API error banner |
| Notifications | "Loading..." | "No notifications" | API error banner |
| Login | Submit button shows "Signing in..." | N/A | "Invalid email or password" |
| Register | Submit button shows "Creating..." | N/A | Validation error or "Email already exists" |

### Action Loading States
| Action | UI Behavior |
|--------|------------|
| Accept/Start/Submit/Retry | Button disabled + shows "..." while processing |
| Approve/Reject/Cancel | Button disabled + loading, page reloads on success |
| Upload photo | Upload button disabled while uploading, media list refreshes on success |
| Mark notification read | Click triggers immediate reload |

### Error Recovery
| Error Type | Recovery |
|-----------|---------|
| Validation error (400) | Show field-level errors, let user correct |
| State conflict (409) | Show error message, reload page to get fresh state |
| Permission error (403) | Redirect to home |
| Token expired (401) | Clear tokens, redirect to login |
| Network error | Show "Something went wrong", user can retry |

---

## 6. Navigation Structure

```
┌─────────────────────────────────────────────────┐
│  SwiftDo [role badge]    [Nav Links]  [Logout]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Page Content]                                 │
│                                                 │
└─────────────────────────────────────────────────┘

Buyer nav:    My Tasks | Create Task | Notifications
Worker nav:   Browse Tasks | My Tasks | Notifications
Citizen nav:  My Reports | New Report | Notifications
```

### Mobile Considerations
- All screens use `max-w-lg mx-auto` for narrow mobile-friendly layout
- Forms stack vertically, full-width inputs
- Task cards are single-column list with tap targets
- Photo grid is 3-column for evidence thumbnails
- Buttons are full-width for easy thumb access
- Status badges use color coding for quick scanning
- GPS "Use my current location" button for easy location entry
