import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  accent?: 'none' | 'primary' | 'success' | 'warning' | 'danger';
  gradient?: boolean;
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

const accents = {
  none: '',
  primary: 'border-l-4 border-l-primary',
  success: 'border-l-4 border-l-success',
  warning: 'border-l-4 border-l-warning',
  danger: 'border-l-4 border-l-danger',
};

export default function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
  padding = 'md',
  accent = 'none',
  gradient = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-surface rounded-2xl border border-border shadow-card
        ${paddings[padding]}
        ${accent !== 'none' ? accents[accent] : ''}
        ${gradient ? 'gradient-primary-soft border-0' : ''}
        ${hoverable
          ? 'hover:shadow-card-hover hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0 cursor-pointer transition-all duration-200'
          : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
