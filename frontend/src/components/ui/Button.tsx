import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variants = {
  primary: 'gradient-primary text-white shadow-primary active:scale-[0.97] active:shadow-none hover:opacity-90',
  secondary: 'bg-white text-text border border-border shadow-card hover:shadow-card-hover active:scale-[0.98]',
  danger: 'bg-gradient-to-r from-danger to-red-700 text-white shadow-danger active:scale-[0.97] active:shadow-none hover:opacity-90',
  success: 'gradient-success text-white shadow-success active:scale-[0.97] active:shadow-none hover:opacity-90',
  ghost: 'text-text-secondary hover:bg-gray-100 active:scale-[0.98]',
  outline: 'border border-border text-text hover:bg-gray-50 active:scale-[0.98]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-xl',
  md: 'px-4 py-3 text-sm rounded-2xl',
  lg: 'px-6 py-3.5 text-base rounded-2xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = true,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-50 pointer-events-none' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}
