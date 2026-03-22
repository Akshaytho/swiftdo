# Sprint 1 — Validation Rules, Edge Cases & Failure Handling

## 1. Validation Matrix

### Auth Module

| Endpoint | Field | Rule | Error Code | HTTP |
|----------|-------|------|------------|------|
| POST /auth/register | email | Valid email format | VALIDATION_ERROR | 400 |
| | password | 8-128 chars, 1 upper, 1 lower, 1 digit | VALIDATION_ERROR | 400 |
| | name | 2-100 chars | VALIDATION_ERROR | 400 |
| | phone | Optional, matches `+?[1-9]\d{6,14}` | VALIDATION_ERROR | 400 |
| | role | Must be BUYER, WORKER, or CITIZEN (not ADMIN) | VALIDATION_ERROR | 400 |
| | email (dup) | Unique in DB | EMAIL_ALREADY_EXISTS | 409 |
| | phone (dup) | Unique in DB | PHONE_ALREADY_EXISTS | 409 |
| POST /auth/login | email | Valid email | VALIDATION_ERROR | 400 |
| | password | Non-empty | VALIDATION_ERROR | 400 |
| | combo | Wrong email or password | UNAUTHORIZED | 401 |
| | account | Deactivated user | UNAUTHORIZED | 401 |
| GET /auth/me | header | Bearer token required | UNAUTHORIZED | 401 |
| | token | Must be valid, not expired, type=access | UNAUTHORIZED | 401 |

### Buyer Task Module

| Endpoint | Field | Rule | Error Code | HTTP |
|----------|-------|------|------------|------|
| POST /buyer/tasks | title | 3-200 chars | VALIDATION_ERROR | 400 |
| | category | 1-50 chars | VALIDATION_ERROR | 400 |
| | taskNotes | 10-2000 chars | VALIDATION_ERROR | 400 |
| | locationText | 1-300 chars | VALIDATION_ERROR | 400 |
| | lat | -90 to 90 | VALIDATION_ERROR | 400 |
| | lng | -180 to 180 | VALIDATION_ERROR | 400 |
| | offeredRate | > 0, max 1,000,000 | VALIDATION_ERROR | 400 |
| | urgency | LOW, MEDIUM, HIGH, URGENT | VALIDATION_ERROR | 400 |
| | role | Must be BUYER | FORBIDDEN | 403 |
| GET /buyer/tasks | status | Valid TaskStatus enum or empty | VALIDATION_ERROR | 400 |
| GET /buyer/tasks/:taskId | taskId | Valid UUID | VALIDATION_ERROR | 400 |
| | ownership | Must be task buyer | FORBIDDEN | 403 |
| POST /buyer/tasks/:taskId/cancel | taskId | Valid UUID | VALIDATION_ERROR | 400 |
| | ownership | Must be task buyer | FORBIDDEN | 403 |
| | state | Must be OPEN or ACCEPTED | INVALID_STATE_TRANSITION | 409 |
| POST /buyer/tasks/:taskId/approve | taskId | Valid UUID | VALIDATION_ERROR | 400 |
| | ownership | Must be task buyer | FORBIDDEN | 403 |
| | state | Must be SUBMITTED | INVALID_STATE_TRANSITION | 409 |
| | worker | Must have assigned worker | NO_WORKER_ASSIGNED | 409 |
| POST /buyer/tasks/:taskId/reject | reason | 5-1000 chars | VALIDATION_ERROR | 400 |
| | ownership | Must be task buyer | FORBIDDEN | 403 |
| | state | Must be SUBMITTED | INVALID_STATE_TRANSITION | 409 |

### Worker Task Module

| Endpoint | Field | Rule | Error Code | HTTP |
|----------|-------|------|------------|------|
| GET /worker/tasks/open | category | Optional string | VALIDATION_ERROR | 400 |
| | urgency | Valid enum or empty | VALIDATION_ERROR | 400 |
| | lat/lng | Valid coordinate range | VALIDATION_ERROR | 400 |
| | radiusKm | > 0, max 100 | VALIDATION_ERROR | 400 |
| GET /worker/tasks/:taskId | taskId | Valid UUID | VALIDATION_ERROR | 400 |
| | access | OPEN tasks: any worker. Non-OPEN: assigned worker only | FORBIDDEN | 403 |
| POST /worker/tasks/:taskId/accept | state | Must be OPEN | INVALID_STATE_TRANSITION | 409 |
| | active task | Worker must have no active task | WORKER_HAS_ACTIVE_TASK | 409 |
| | concurrency | Serializable isolation prevents double-accept | WORKER_HAS_ACTIVE_TASK | 409 |
| POST /worker/tasks/:taskId/start | state | Must be ACCEPTED | INVALID_STATE_TRANSITION | 409 |
| | ownership | Must be assigned worker | FORBIDDEN | 403 |
| POST /worker/tasks/:taskId/submit | state | Must be IN_PROGRESS | INVALID_STATE_TRANSITION | 409 |
| | startedAt | Must exist (task was started) | TASK_NOT_STARTED | 409 |
| | media | BEFORE_PHOTO, AFTER_PHOTO, PROOF_PHOTO all required | BAD_REQUEST | 400 |
| POST /worker/tasks/:taskId/cancel | reason | 5-500 chars, required | VALIDATION_ERROR | 400 |
| | state | Must be ACCEPTED or IN_PROGRESS | INVALID_STATE_TRANSITION | 409 |
| POST /worker/tasks/:taskId/retry | state | Must be REJECTED | INVALID_STATE_TRANSITION | 409 |
| | active task | Must not have another active task | WORKER_HAS_ACTIVE_TASK | 409 |
| POST /worker/tasks/:taskId/location | lat | -90 to 90, required | VALIDATION_ERROR | 400 |
| | lng | -180 to 180, required | VALIDATION_ERROR | 400 |
| | state | Must be IN_PROGRESS | INVALID_TASK_STATE | 409 |

### Media Module

| Endpoint | Field | Rule | Error Code | HTTP |
|----------|-------|------|------------|------|
| POST /tasks/:taskId/media | file | Required, non-empty | BAD_REQUEST | 400 |
| | mimeType | jpeg, png, or webp only | BAD_REQUEST | 400 |
| | size | Max 10MB | BAD_REQUEST | 400 |
| | mediaType | BEFORE_PHOTO, AFTER_PHOTO, PROOF_PHOTO, REFERENCE_IMAGE | VALIDATION_ERROR | 400 |
| | access | Evidence: assigned worker + IN_PROGRESS. Reference: buyer only | FORBIDDEN | 403 |
| GET /tasks/:taskId/media | access | Task buyer, assigned worker, or admin only | FORBIDDEN | 403 |

### Citizen Reports

| Endpoint | Field | Rule | Error Code | HTTP |
|----------|-------|------|------------|------|
| POST /citizen/reports | issueType | 1-50 chars | VALIDATION_ERROR | 400 |
| | description | 10-2000 chars | VALIDATION_ERROR | 400 |
| | lat/lng | Valid coordinate range if provided | VALIDATION_ERROR | 400 |
| | role | Must be CITIZEN | FORBIDDEN | 403 |

### Notifications

| Endpoint | Field | Rule | Error Code | HTTP |
|----------|-------|------|------------|------|
| POST /notifications/:id/read | id | Valid UUID | VALIDATION_ERROR | 400 |
| | ownership | Must be notification recipient | NOTIFICATION_NOT_FOUND | 404 |

---

## 2. Edge Case List

### Race Conditions (all handled)
| Case | Guard |
|------|-------|
| Two workers accept same task simultaneously | Serializable transaction isolation + `activeTaskId` unique constraint |
| Buyer approves task that's already approved | State check inside transaction; second approval fails with INVALID_STATE_TRANSITION |
| Buyer approves + rejects simultaneously | First transaction commits, second sees wrong state and rejects |
| Worker submits while buyer cancels | Not a real race: buyer CANNOT cancel IN_PROGRESS tasks. State machine blocks it. |

### State Machine Edge Cases
| Case | Expected Behavior |
|------|------------------|
| Worker accepts task while already having an active task | 409 WORKER_HAS_ACTIVE_TASK |
| Worker tries to start a task they didn't accept | 403 FORBIDDEN |
| Worker submits without uploading all 3 photo types | 400 "Missing required evidence: BEFORE_PHOTO, ..." |
| Worker submits a task that was never started (no startedAt) | 409 TASK_NOT_STARTED |
| Buyer tries to cancel task that's IN_PROGRESS | 409 INVALID_STATE_TRANSITION (buyer can only cancel OPEN/ACCEPTED) |
| Buyer cancels task after worker accepted | Worker's activeTaskId is cleared, worker notified |
| Worker cancels task in IN_PROGRESS | Worker freed, buyer notified, task CANCELLED |
| Worker retries after rejection | Task goes REJECTED → IN_PROGRESS, worker re-claims activeTaskId |
| Worker retries but has another active task | 409 WORKER_HAS_ACTIVE_TASK |
| Buyer approves task with no worker (impossible path) | 409 NO_WORKER_ASSIGNED |
| Double-submit by worker | Second submit hits INVALID_STATE_TRANSITION (already SUBMITTED) |

### Authorization Edge Cases
| Case | Expected Behavior |
|------|------------------|
| Worker tries to access buyer routes | 403 FORBIDDEN |
| Buyer tries to accept a task | 403 FORBIDDEN (authorize middleware blocks) |
| Citizen tries to create a task | 403 FORBIDDEN |
| Worker views another worker's assigned task | 403 FORBIDDEN (non-OPEN tasks only viewable by assigned worker) |
| Buyer views another buyer's task | 403 "You do not own this task" |
| User accesses API with expired token | 401 "Token expired" |
| User accesses API with refresh token instead of access token | 401 "Invalid token type" |
| User registers as ADMIN role | 400 VALIDATION_ERROR (role enum doesn't include ADMIN) |

### Data Edge Cases
| Case | Expected Behavior |
|------|------------------|
| Empty request body on POST /buyer/tasks | 400 with field-level validation errors |
| Extremely long title (201+ chars) | 400 "Title must be at most 200 characters" |
| Negative offered rate | 400 "Offered rate must be positive" |
| offeredRate = 0 | 400 "Offered rate must be positive" |
| Latitude = 91 | 400 validation error |
| File upload > 10MB | 400 "File too large" |
| Upload .exe file as photo | 400 "Invalid file type" |
| GPS location jump > 10km in < 30 seconds | Logged as warning, not blocked (Sprint 1) |
| Duplicate email registration | 409 EMAIL_ALREADY_EXISTS |
| Password "abcdefgh" (no uppercase/digit) | 400 validation error |

---

## 3. Recommended API Error Responses

### Standard Error Shape
```json
{
  "success": false,
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "message": "Human-readable description",
    "details": {}
  }
}
```

### Validation Error (400)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "body": {
        "title": ["Title must be at least 3 characters"],
        "offeredRate": ["Offered rate must be positive"]
      }
    }
  }
}
```

### State Transition Error (409)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "Cannot transition task from 'APPROVED' to 'SUBMITTED'"
  }
}
```

### Permission Error (403)
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Role 'WORKER' is not authorized. Required: BUYER"
  }
}
```

### Unique Constraint (409)
```json
{
  "success": false,
  "error": {
    "code": "UNIQUE_CONSTRAINT_VIOLATION",
    "message": "A record with this email already exists"
  }
}
```

---

## 4. Backend Guard Recommendations

### Guard Layers (defense in depth)

1. **Rate limiter** — 100 req/min global, 10 req/min on auth
2. **Authentication middleware** — JWT verification, token type check
3. **Authorization middleware** — Role check (BUYER, WORKER, CITIZEN)
4. **Zod validation middleware** — Input shape, types, ranges
5. **Service-layer ownership checks** — task.buyerId === userId, task.workerId === userId
6. **State machine assertion** — `assertTransition(from, to, actor)` inside transaction
7. **Database constraints** — unique on activeTaskId, unique on payout.taskId, foreign keys

### Guard Ordering per Request
```
Request → Rate Limit → Auth → Role → Validate → Controller → Service [ownership + state + transaction] → DB [constraints]
```

Every layer catches a different class of error. No single layer is relied upon alone.

---

## 5. What Should Be Logged for Debugging

### INFO level (business events)
- User registered (userId, role)
- User logged in (userId)
- Task created (taskId, buyerId, rateCents)
- Task accepted (taskId, workerId)
- Task started (taskId, workerId)
- Task submitted (taskId, workerId, aiScore)
- Task approved (taskId, buyerId)
- Task rejected (taskId, buyerId, reason)
- Task cancelled (taskId, cancelledBy, reason)
- Task retried (taskId, workerId)
- Media uploaded (mediaId, taskId, mediaType, userId)
- Citizen report created (reportId, userId, category)

### WARN level (suspicious but not broken)
- Invalid login attempt (email — NOT password)
- Suspicious GPS jump (taskId, workerId, distance, timeDiff)
- Rate limit hit (IP address)
- Failed validation (path, method, field errors)
- State transition denied (taskId, from, to, actor)

### ERROR level (something is broken)
- Unhandled exceptions (full stack trace)
- Database connection failures
- Prisma known errors not mapped (unknown P-codes)
- 500 responses

### NEVER log
- Passwords or password hashes
- JWT tokens or secrets
- Full request bodies on auth routes
- File contents
