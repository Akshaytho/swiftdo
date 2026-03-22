interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusStyles: Record<string, string> = {
  OPEN: 'bg-primary-light text-primary',
  ACCEPTED: 'bg-warning-light text-amber-700',
  IN_PROGRESS: 'bg-orange-100 text-orange-700',
  SUBMITTED: 'bg-purple-100 text-purple-700',
  APPROVED: 'bg-success-light text-success',
  REJECTED: 'bg-danger-light text-danger',
  CANCELLED: 'bg-gray-100 text-text-muted',
  DISPUTED: 'bg-danger-light text-red-800',
  PENDING: 'bg-warning-light text-amber-700',
  COMPLETED: 'bg-success-light text-success',
  REPORTED: 'bg-primary-light text-primary',
  UNDER_REVIEW: 'bg-purple-100 text-purple-700',
  LOW: 'bg-gray-100 text-text-secondary',
  MEDIUM: 'bg-primary-light text-primary',
  HIGH: 'bg-warning-light text-amber-700',
  URGENT: 'bg-danger-light text-danger',
};

export default function Badge({ status, size = 'sm' }: BadgeProps) {
  const style = statusStyles[status] || 'bg-gray-100 text-text-secondary';
  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${style} ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
