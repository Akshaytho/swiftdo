import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  right?: ReactNode;
}

export default function TopBar({ title, showBack = false, right }: TopBarProps) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-30 bg-surface/80 backdrop-blur-lg border-b border-border px-4 py-3">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-text hover:text-primary transition-colors">
              <ChevronLeft size={22} />
            </button>
          )}
          <h1 className="text-lg font-bold text-text">{title}</h1>
        </div>
        {right && <div>{right}</div>}
      </div>
    </div>
  );
}
