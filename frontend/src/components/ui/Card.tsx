import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export default function Card({ children, className = '', onClick, hoverable = false, padding = 'md' }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface rounded-2xl border border-border ${paddings[padding]} ${hoverable ? 'hover:border-primary/30 hover:shadow-md active:scale-[0.99] cursor-pointer transition-all duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
