export const ROLES = ['BUYER', 'WORKER', 'CITIZEN', 'ADMIN'] as const;
export type RoleType = (typeof ROLES)[number];

export const TASK_STATUSES = [
  'OPEN',
  'ACCEPTED',
  'IN_PROGRESS',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'DISPUTED',
] as const;
export type TaskStatusType = (typeof TASK_STATUSES)[number];

export const TASK_URGENCY = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export const MEDIA_TYPES = [
  'BEFORE_PHOTO',
  'AFTER_PHOTO',
  'PROOF_PHOTO',
  'REFERENCE_IMAGE',
  'REPORT_PHOTO',
] as const;

export const PAYOUT_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;
