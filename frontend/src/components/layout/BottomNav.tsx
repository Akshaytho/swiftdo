import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Search, PlusCircle, Bell, User, ClipboardList, Briefcase, AlertTriangle } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: typeof Home;
  isAction?: boolean;
}

const roleNavItems: Record<string, NavItem[]> = {
  BUYER: [
    { label: 'Tasks', path: '/buyer/tasks', icon: ClipboardList },
    { label: 'Post', path: '/buyer/tasks/new', icon: PlusCircle, isAction: true },
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
    { label: 'Report', path: '/citizen/reports/new', icon: AlertTriangle, isAction: true },
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      {/* Glass background */}
      <div className="glass border-t border-white/60 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 pt-2 pb-1">
          {items.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;

            if (item.isAction) {
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-1 -mt-5"
                >
                  <div className={`w-14 h-14 rounded-2xl gradient-primary shadow-primary flex items-center justify-center transition-all duration-200 active:scale-95 ${isActive ? 'animate-pulse-glow' : ''}`}>
                    <Icon size={26} strokeWidth={2.2} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-primary">{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[56px] relative"
              >
                {/* Active pill background */}
                {isActive && (
                  <div className="absolute inset-x-0 top-0 h-full rounded-2xl gradient-primary-soft" />
                )}
                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={isActive ? 'text-primary' : 'text-text-muted'}
                  />
                  {/* Notification dot for Alerts */}
                  {item.label === 'Alerts' && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-danger" />
                  )}
                </div>
                <span className={`text-[10px] relative ${isActive ? 'font-bold text-primary' : 'font-medium text-text-muted'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
