# Sprint 1 — Acceptance Test Cases & API Test Scenarios

## 1. Acceptance Criteria by Feature

### Auth
- [ ] User can register with email, password, name, and role (BUYER/WORKER/CITIZEN)
- [ ] User cannot register with ADMIN role
- [ ] User cannot register with duplicate email
- [ ] User can login with valid credentials and receive JWT tokens
- [ ] User cannot login with wrong password
- [ ] User can access /auth/me with valid access token
- [ ] Expired tokens return 401
- [ ] Refresh tokens cannot be used as access tokens

### Buyer Task Flow
- [ ] Buyer can create a task with all required fields
- [ ] Task is created in OPEN state
- [ ] Buyer can list their own tasks (not other buyers' tasks)
- [ ] Buyer can filter tasks by status
- [ ] Buyer can view task detail including evidence photos, GPS logs, events
- [ ] Buyer can cancel OPEN or ACCEPTED tasks
- [ ] Buyer cannot cancel IN_PROGRESS, SUBMITTED, or APPROVED tasks
- [ ] Buyer can approve SUBMITTED tasks → creates payout, frees worker
- [ ] Buyer can reject SUBMITTED tasks with reason → frees worker
- [ ] Buyer cannot approve/reject tasks they don't own

### Worker Task Flow
- [ ] Worker can browse OPEN tasks
- [ ] Worker can filter by category, urgency, location radius
- [ ] Worker can accept an OPEN task
- [ ] Worker cannot accept if they already have an active task
- [ ] Worker can start an ACCEPTED task → sets startedAt
- [ ] Worker can upload before/after/proof photos while IN_PROGRESS
- [ ] Worker cannot upload photos in other states
- [ ] Worker can log GPS coordinates while IN_PROGRESS
- [ ] Worker can submit task only if all 3 photo types are uploaded
- [ ] Submit calculates timeSpentSecs and sets placeholder AI score
- [ ] Worker can retry after rejection → goes back to IN_PROGRESS
- [ ] Worker can cancel ACCEPTED or IN_PROGRESS tasks with reason

### Citizen Reports
- [ ] Citizen can submit a report with issueType and description
- [ ] Report is stored with status REPORTED
- [ ] Citizen can list their own reports
- [ ] Reports do NOT create tasks in Sprint 1

### Notifications
- [ ] Notifications created on: accept, start, submit, approve, reject, cancel
- [ ] User can list their notifications with pagination
- [ ] User can mark single notification as read
- [ ] User can mark all notifications as read
- [ ] Notifications are per-user (cannot see others' notifications)

### Payouts
- [ ] Payout record created only when buyer approves task
- [ ] Payout amount matches task rate
- [ ] Worker can view their payout history with summary stats
- [ ] No real payment processing in Sprint 1

---

## 2. Happy Path Tests

### HP-1: Full Task Lifecycle
```
1. Buyer registers → 201
2. Worker registers → 201
3. Buyer logs in → 200, gets tokens
4. Worker logs in → 200, gets tokens
5. Buyer creates task (title, notes, location, rate) → 201, status=OPEN
6. Worker browses open tasks → 200, sees the task
7. Worker accepts the task → 200, status=ACCEPTED
8. Worker starts the task → 200, status=IN_PROGRESS, startedAt set
9. Worker uploads BEFORE_PHOTO → 201
10. Worker uploads AFTER_PHOTO → 201
11. Worker uploads PROOF_PHOTO → 201
12. Worker logs GPS location → 201
13. Worker submits task → 200, status=SUBMITTED, aiScore set
14. Buyer views task detail → sees photos, GPS log, AI score, time worked
15. Buyer approves task → 200, status=APPROVED, payout created
16. Worker checks payouts → sees pending payout for the task
17. Buyer and worker both have relevant notifications
```

### HP-2: Rejection and Retry
```
1. (Steps 1-13 from HP-1)
2. Buyer rejects with reason "Photos unclear" → 200, status=REJECTED
3. Worker is freed (no active task)
4. Worker retries task → 200, status=IN_PROGRESS
5. Worker re-uploads photos → 201
6. Worker re-submits → 200, status=SUBMITTED
7. Buyer approves → 200, status=APPROVED
```

### HP-3: Buyer Cancellation
```
1. Buyer creates task → 201, OPEN
2. Worker accepts → 200, ACCEPTED
3. Buyer cancels → 200, CANCELLED
4. Worker is freed, worker gets notification
5. Worker can now accept other tasks
```

### HP-4: Citizen Report
```
1. Citizen registers → 201
2. Citizen logs in → 200
3. Citizen creates report (issueType, description, GPS) → 201, status=REPORTED
4. Citizen lists reports → 200, sees their report
```

---

## 3. Edge Case Tests

### EC-1: Double Accept Race Condition
```
1. Buyer creates task
2. Worker A and Worker B both call POST /accept simultaneously
3. Only one succeeds (200), the other gets 409 WORKER_HAS_ACTIVE_TASK or task is no longer OPEN
4. The winning worker is assigned, the other is not
```

### EC-2: Worker Already Has Active Task
```
1. Worker accepts Task A → 200
2. Worker tries to accept Task B → 409 WORKER_HAS_ACTIVE_TASK
3. Worker completes/cancels Task A
4. Worker accepts Task B → 200
```

### EC-3: Submit Without All Photos
```
1. Worker starts task
2. Worker uploads only BEFORE_PHOTO
3. Worker tries to submit → 400 "Missing required evidence: AFTER_PHOTO, PROOF_PHOTO"
4. Worker uploads AFTER_PHOTO and PROOF_PHOTO
5. Worker submits → 200
```

### EC-4: Submit Without Starting
```
1. Worker accepts task (ACCEPTED state)
2. Worker tries to submit → 409 INVALID_STATE_TRANSITION (ACCEPTED → SUBMITTED not allowed)
```

### EC-5: Buyer Approves Non-Submitted Task
```
1. Task is in OPEN state
2. Buyer calls approve → 409 INVALID_STATE_TRANSITION
```

### EC-6: Buyer Cancels After Work Started
```
1. Task is IN_PROGRESS
2. Buyer calls cancel → 409 INVALID_STATE_TRANSITION
   (Buyer can only cancel OPEN or ACCEPTED)
```

### EC-7: Worker Cancels After Submission
```
1. Task is SUBMITTED
2. Worker calls cancel → 409 INVALID_STATE_TRANSITION
   (Worker can only cancel ACCEPTED or IN_PROGRESS)
```

### EC-8: Double Approval
```
1. Task is SUBMITTED
2. Two concurrent approve calls from buyer
3. First succeeds → payout created, worker freed
4. Second fails → state check inside transaction sees task is already APPROVED (409 INVALID_STATE_TRANSITION).
   Even if both somehow pass the state check, the unique constraint on payout.taskId blocks the duplicate payout insert.
```

### EC-9: Upload Wrong File Type
```
1. Worker uploads a .pdf file → 400 "Invalid file type"
2. Worker uploads a 15MB file → 400 "File too large"
```

### EC-10: Expired Token
```
1. User logs in, gets token
2. Wait for token to expire (or use a token with past expiry)
3. Call any protected endpoint → 401 "Token expired"
```

### EC-11: Cross-Role Access
```
1. Worker tries POST /buyer/tasks → 403
2. Buyer tries POST /worker/tasks/:id/accept → 403
3. Citizen tries GET /worker/tasks/open → 403
```

### EC-12: Cross-Ownership Access
```
1. Buyer A creates a task
2. Buyer B tries GET /buyer/tasks/:taskId → 403 "You do not own this task"
3. Worker A is assigned to task
4. Worker B tries GET /worker/tasks/:taskId → 403 (task is not OPEN)
```

### EC-13: Invalid UUID in Path
```
1. GET /buyer/tasks/not-a-uuid → 400 "Invalid task ID"
2. GET /buyer/tasks/00000000-0000-0000-0000-000000000000 → 404 "Task not found"
```

### EC-14: Empty Body
```
1. POST /buyer/tasks with empty body → 400 with all field errors
2. POST /auth/login with empty body → 400 "Invalid email address"
```

### EC-15: Notification Route Priority
```
1. POST /notifications/read-all → 200 (not treated as /:id/read with id="read-all")
2. POST /notifications/<valid-uuid>/read → 200
3. POST /notifications/not-a-uuid/read → 400 validation error
```

---

## 4. Permission Tests

| Endpoint | No Auth | BUYER | WORKER | CITIZEN | ADMIN |
|----------|---------|-------|--------|---------|-------|
| POST /auth/register | 201 | N/A | N/A | N/A | N/A |
| POST /auth/login | 200 | N/A | N/A | N/A | N/A |
| GET /auth/me | 401 | 200 | 200 | 200 | 200 |
| POST /buyer/tasks | 401 | 200 | 403 | 403 | 403 |
| GET /buyer/tasks | 401 | 200 | 403 | 403 | 403 |
| GET /buyer/tasks/:id | 401 | 200* | 403 | 403 | 403 |
| POST /buyer/tasks/:id/approve | 401 | 200* | 403 | 403 | 403 |
| POST /buyer/tasks/:id/reject | 401 | 200* | 403 | 403 | 403 |
| POST /buyer/tasks/:id/cancel | 401 | 200* | 403 | 403 | 403 |
| GET /worker/tasks/open | 401 | 403 | 200 | 403 | 403 |
| GET /worker/tasks/:id | 401 | 403 | 200* | 403 | 403 |
| GET /worker/my-tasks | 401 | 403 | 200 | 403 | 403 |
| POST /worker/tasks/:id/accept | 401 | 403 | 200* | 403 | 403 |
| POST /worker/tasks/:id/start | 401 | 403 | 200* | 403 | 403 |
| POST /worker/tasks/:id/submit | 401 | 403 | 200* | 403 | 403 |
| POST /worker/tasks/:id/cancel | 401 | 403 | 200* | 403 | 403 |
| POST /worker/tasks/:id/retry | 401 | 403 | 200* | 403 | 403 |
| POST /worker/tasks/:id/location | 401 | 403 | 200* | 403 | 403 |
| POST /tasks/:id/media | 401 | 200* | 200* | 403 | 403 |
| GET /tasks/:id/media | 401 | 200* | 200* | 403 | 200 |
| POST /citizen/reports | 401 | 403 | 403 | 200 | 403 |
| GET /citizen/reports | 401 | 403 | 403 | 200 | 403 |
| GET /notifications | 401 | 200 | 200 | 200 | 200 |
| POST /notifications/:id/read | 401 | 200* | 200* | 200* | 200* |
| POST /notifications/read-all | 401 | 200 | 200 | 200 | 200 |
| GET /worker/payouts | 401 | 403 | 200 | 403 | 403 |

`*` = additional ownership/assignment check in service layer

---

## 5. State Transition Tests

### Valid Transitions (should succeed)
| From | To | Actor | Trigger |
|------|----|-------|---------|
| OPEN | ACCEPTED | WORKER | POST /worker/tasks/:id/accept |
| OPEN | CANCELLED | BUYER | POST /buyer/tasks/:id/cancel |
| ACCEPTED | IN_PROGRESS | WORKER | POST /worker/tasks/:id/start |
| ACCEPTED | CANCELLED | BUYER | POST /buyer/tasks/:id/cancel |
| ACCEPTED | CANCELLED | WORKER | POST /worker/tasks/:id/cancel |
| IN_PROGRESS | SUBMITTED | WORKER | POST /worker/tasks/:id/submit |
| IN_PROGRESS | CANCELLED | WORKER | POST /worker/tasks/:id/cancel |
| SUBMITTED | APPROVED | BUYER | POST /buyer/tasks/:id/approve |
| SUBMITTED | REJECTED | BUYER | POST /buyer/tasks/:id/reject |
| REJECTED | IN_PROGRESS | WORKER | POST /worker/tasks/:id/retry |
| REJECTED | CANCELLED | BUYER | POST /buyer/tasks/:id/cancel |
| REJECTED | CANCELLED | WORKER | POST /worker/tasks/:id/cancel |
| REJECTED | DISPUTED | WORKER | (Sprint 2 — no endpoint yet) |
| DISPUTED | APPROVED | ADMIN | (Sprint 2 — no endpoint yet) |
| DISPUTED | REJECTED | ADMIN | (Sprint 2 — no endpoint yet) |

### Invalid Transitions (should return 409)
| From | To | Actor | Why Blocked |
|------|----|-------|-------------|
| OPEN | IN_PROGRESS | WORKER | Must accept first |
| OPEN | SUBMITTED | WORKER | Cannot skip states |
| OPEN | APPROVED | BUYER | Nothing to approve |
| ACCEPTED | SUBMITTED | WORKER | Must start first |
| IN_PROGRESS | ACCEPTED | WORKER | Cannot go backwards |
| IN_PROGRESS | CANCELLED | BUYER | Buyer cannot cancel during work |
| SUBMITTED | CANCELLED | BUYER | Must approve or reject |
| SUBMITTED | CANCELLED | WORKER | Must wait for buyer decision |
| SUBMITTED | IN_PROGRESS | WORKER | Cannot go back without rejection |
| APPROVED | anything | anyone | Terminal state |
| CANCELLED | anything | anyone | Terminal state |

### Side Effects per Transition
| Transition | Side Effects |
|-----------|-------------|
| OPEN → ACCEPTED | worker.activeTaskId = taskId, buyer notified |
| ACCEPTED → IN_PROGRESS | task.startedAt set, buyer notified |
| IN_PROGRESS → SUBMITTED | task.submittedAt set, timeSpentSecs calculated, aiScore set, buyer notified |
| SUBMITTED → APPROVED | task.completedAt set, payout created, worker.completedTasks++, worker.activeTaskId cleared, buyer.totalSpentCents updated, worker notified |
| SUBMITTED → REJECTED | task.rejectionReason set, worker.activeTaskId cleared, worker notified |
| REJECTED → IN_PROGRESS | task.startedAt updated, rejectionReason cleared, worker.activeTaskId = taskId, buyer notified |
| any → CANCELLED | task.cancelledAt set, worker.activeTaskId cleared (if assigned), other party notified |

---

## 6. Manual QA Checklist

### Setup
- [ ] Docker PostgreSQL is running
- [ ] Backend starts without errors on port 3000
- [ ] Frontend starts without errors on port 3001
- [ ] Database is seeded with test users
- [ ] `/health` endpoint returns OK

### Auth Flow
- [ ] Register as buyer → redirects to buyer dashboard
- [ ] Register as worker → redirects to worker dashboard
- [ ] Register as citizen → redirects to citizen dashboard
- [ ] Register with duplicate email → shows error
- [ ] Register with weak password → shows error
- [ ] Login with valid credentials → redirects to role dashboard
- [ ] Login with wrong password → shows "Invalid email or password"
- [ ] Logout → redirects to login, cannot access protected pages

### Buyer Flow
- [ ] Create task with all fields → appears in task list as OPEN
- [ ] Create task with missing required field → shows validation error
- [ ] Create task with "Use my current location" → lat/lng auto-fill
- [ ] View task list → shows all buyer's tasks
- [ ] Filter tasks by status → only matching tasks shown
- [ ] Click task → shows detail page
- [ ] Cancel OPEN task → status changes to CANCELLED
- [ ] View submitted task → shows photos, GPS log count, AI score, time worked
- [ ] Approve submitted task → status APPROVED, payout section appears
- [ ] Reject submitted task with reason → status REJECTED, reason shown

### Worker Flow
- [ ] Browse open tasks → shows list of available tasks
- [ ] Filter by category → narrows results
- [ ] Click open task → shows detail with Accept button
- [ ] Accept task → status ACCEPTED, task appears in "My Tasks"
- [ ] Try to accept second task → shows error "already have active task"
- [ ] Start task → status IN_PROGRESS, upload section appears
- [ ] Upload before photo → checkmark appears for BEFORE_PHOTO
- [ ] Upload after photo → checkmark appears for AFTER_PHOTO
- [ ] Upload proof photo → checkmark appears for PROOF_PHOTO
- [ ] Try to submit without all photos → shows "Missing required evidence" error
- [ ] Submit with all photos → status SUBMITTED
- [ ] After rejection, Retry button appears → click → back to IN_PROGRESS
- [ ] Cancel task with reason → status CANCELLED, worker freed

### Citizen Flow
- [ ] Submit report with description and issue type → appears in report list
- [ ] Report shows status REPORTED
- [ ] "Use my current location" fills lat/lng
- [ ] Report list shows all citizen's reports

### Notifications
- [ ] After worker accepts → buyer sees notification
- [ ] After worker submits → buyer sees notification
- [ ] After buyer approves → worker sees notification
- [ ] After buyer rejects → worker sees notification
- [ ] "Mark all read" clears unread count
- [ ] Click unread notification → marks it read

### Cross-Role Security (manual spot check)
- [ ] Copy buyer's JWT → use in worker API call → 403
- [ ] Navigate directly to /buyer/tasks as worker → redirected
- [ ] Navigate directly to /worker/tasks as buyer → redirected
