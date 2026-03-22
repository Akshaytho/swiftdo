import { TaskStatus } from '@prisma/client';
import { ConflictError, ForbiddenError } from '../../lib/errors';

// ─────────────────────────────────────────────────────────
// Task State Machine — Sprint 1
// ─────────────────────────────────────────────────────────
//
// States: OPEN → ACCEPTED → IN_PROGRESS → SUBMITTED → APPROVED (terminal)
//                                                    → REJECTED → IN_PROGRESS (retry)
//         Any non-terminal → CANCELLED (terminal)
//         SUBMITTED → DISPUTED → APPROVED | REJECTED (admin resolves)
//
// Terminal states: APPROVED, CANCELLED
//
// One worker can only have one active task (enforced in service layer + DB unique constraint).

type Actor = 'BUYER' | 'WORKER' | 'ADMIN' | 'SYSTEM';

interface Transition {
  to: TaskStatus;
  actors: Actor[];
  description: string;
}

const TRANSITIONS: Record<TaskStatus, Transition[]> = {
  OPEN: [
    { to: 'ACCEPTED', actors: ['WORKER'], description: 'Worker accepts the task' },
    { to: 'CANCELLED', actors: ['BUYER'], description: 'Buyer cancels before assignment' },
  ],
  ACCEPTED: [
    { to: 'IN_PROGRESS', actors: ['WORKER'], description: 'Worker starts work' },
    { to: 'CANCELLED', actors: ['BUYER', 'WORKER'], description: 'Cancel before work starts' },
  ],
  IN_PROGRESS: [
    { to: 'SUBMITTED', actors: ['WORKER'], description: 'Worker submits proof' },
    { to: 'CANCELLED', actors: ['WORKER'], description: 'Worker abandons task' },
  ],
  SUBMITTED: [
    { to: 'APPROVED', actors: ['BUYER'], description: 'Buyer approves submission' },
    { to: 'REJECTED', actors: ['BUYER'], description: 'Buyer rejects submission' },
  ],
  APPROVED: [],   // Terminal — no transitions out
  REJECTED: [
    { to: 'IN_PROGRESS', actors: ['WORKER'], description: 'Worker retries after rejection' },
    { to: 'DISPUTED', actors: ['WORKER'], description: 'Worker disputes rejection' },
    { to: 'CANCELLED', actors: ['BUYER', 'WORKER'], description: 'Cancel after rejection' },
  ],
  CANCELLED: [],  // Terminal — no transitions out
  DISPUTED: [
    { to: 'APPROVED', actors: ['ADMIN'], description: 'Admin resolves in favor of worker' },
    { to: 'REJECTED', actors: ['ADMIN'], description: 'Admin resolves in favor of buyer' },
  ],
};

// ── Public API ───────────────────────────────────────────

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return TRANSITIONS[from].some((t) => t.to === to);
}

export function isActorAllowed(from: TaskStatus, to: TaskStatus, actor: Actor): boolean {
  const transition = TRANSITIONS[from].find((t) => t.to === to);
  return transition ? transition.actors.includes(actor) : false;
}

export function isTerminalState(status: TaskStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

export function getAllowedTransitions(from: TaskStatus, actor?: Actor): Transition[] {
  const transitions = TRANSITIONS[from];
  if (!actor) return transitions;
  return transitions.filter((t) => t.actors.includes(actor));
}

/**
 * Validates and enforces a state transition. Throws if invalid.
 */
export function assertTransition(from: TaskStatus, to: TaskStatus, actor: Actor): void {
  if (!canTransition(from, to)) {
    throw new ConflictError(
      `Cannot transition task from '${from}' to '${to}'`,
      'INVALID_STATE_TRANSITION'
    );
  }

  if (!isActorAllowed(from, to, actor)) {
    throw new ForbiddenError(
      `Actor '${actor}' is not allowed to transition task from '${from}' to '${to}'`
    );
  }
}

// ── Timestamps to update per transition ──────────────────

export function getTimestampUpdates(to: TaskStatus): Record<string, Date | null> {
  const now = new Date();
  switch (to) {
    case 'IN_PROGRESS':
      return { startedAt: now };
    case 'SUBMITTED':
      return { submittedAt: now };
    case 'APPROVED':
      return { completedAt: now };
    case 'CANCELLED':
      return { cancelledAt: now };
    default:
      return {};
  }
}
