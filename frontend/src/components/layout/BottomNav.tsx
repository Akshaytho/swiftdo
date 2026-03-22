import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Search, PlusCircle, Bell, User, ClipboardList, Briefcase, AlertTriangle } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: typeof Home;
}

const roleNavItems: Record<string, NavItem[]> = {
  BUYER: [
    { label: 'Tasks', path: '/buyer/tasks', icon: ClipboardList },
    { label: 'Create', path: '/buyer/tasks/new', icon: PlusCircle },
    { label: 'Alerts', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/profile', icon: User },
  ],
  WORKER: [
    { label: 'Browse', path: '/worker/tasks', icon: Search },
    { label: 'My Tasks', path: '/worker/my-tasks', icon: Briefcase },
    { label: 'Alerts', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/profile', icon: User },
  ],
  CITIZEN: [
    { label: 'Reports', path: '/citizen/reports', icon: ClipboardList },
    { label: 'Report', path: '/citizen/reports/new', icon: AlertTriangle },
    { label: 'Alerts', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/profile', icon: User },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/admin', icon: Home },
    { label: 'Alerts', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/profile', icon: User },
  ],
};

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const items = roleNavItems[user.role] || [];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-border safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-colors min-w-[60px] ${
                isActive ? 'text-primary' : 'text-text-muted'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
