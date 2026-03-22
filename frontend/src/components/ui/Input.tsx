import { type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export default function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-text mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{icon}</div>}
        <input
          className={`w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-surface text-text placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${icon ? 'pl-10' : ''} ${error ? 'border-danger focus:ring-danger/20 focus:border-danger' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-text mb-1.5">{label}</label>}
      <textarea
        className={`w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-surface text-text placeholder:text-text-muted outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none ${error ? 'border-danger' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-text mb-1.5">{label}</label>}
      <select
        className={`w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-surface text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
