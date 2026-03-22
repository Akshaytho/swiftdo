import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, ChevronRight, Star, CheckCircle, IndianRupee, Zap, Settings, HelpCircle, Shield } from 'lucide-react';
import Avatar from '../components/ui/Avatar';

const roleConfig: Record<string, { label: string; desc: string; gradient: string; icon: string }> = {
  BUYER: {
    label: 'Task Buyer',
    desc: 'You post tasks and manage workers',
    gradient: 'gradient-primary',
    icon: '🏢',
  },
  WORKER: {
    label: 'Task Worker',
    desc: 'You complete tasks and earn money',
    gradient: 'gradient-success',
    icon: '⚡',
  },
  CITIZEN: {
    label: 'Citizen',
    desc: 'You report civic issues',
    gradient: 'bg-gradient-to-br from-violet-500 to-purple-700',
    icon: '🏙️',
  },
  ADMIN: {
    label: 'Administrator',
    desc: 'Platform administrator',
    gradient: 'gradient-dark',
    icon: '🛡️',
  },
};

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick: () => void;
  iconBg?: string;
  danger?: boolean;
}

function MenuItem({ icon, label, sublabel, onClick, iconBg = 'bg-primary/10', danger = false }: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full px-5 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${danger ? 'text-danger' : 'text-text'}`}>{label}</div>
        {sublabel && <div className="text-xs text-text-muted mt-0.5">{sublabel}</div>}
      </div>
      {!danger && <ChevronRight size={16} className="text-text-muted flex-shrink-0" />}
    </button>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const config = roleConfig[user.role] || roleConfig.BUYER;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero gradient header */}
      <div className={`${config.gradient} relative overflow-hidden pt-12 pb-8 px-6`}>
        {/* Decorative shapes */}
        <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/10 animate-float" />
        <div className="absolute bottom-0 left-8 w-14 h-14 rounded-full bg-white/10 animate-float-alt" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="relative">
            <Avatar name={user.name} size="xl" />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm">
              <span className="text-xs">{config.icon}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-white leading-tight truncate">{user.name}</h2>
            <p className="text-white/70 text-xs mt-0.5 truncate">{user.email}</p>
            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              <Shield size={11} className="text-white" />
              <span className="text-white text-xs font-bold">{config.label}</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-3 mt-6">
          {[
            { icon: <CheckCircle size={18} className="text-white" />, value: '0', label: 'Completed' },
            { icon: <Star size={18} className="text-white" />, value: '—', label: 'Rating' },
            { icon: <IndianRupee size={18} className="text-white" />, value: '₹0', label: 'Earned' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/15 backdrop-blur-sm rounded-2xl py-3 text-center">
              <div className="flex items-center justify-center mb-1">{stat.icon}</div>
              <div className="text-lg font-black text-white">{stat.value}</div>
              <div className="text-white/60 text-[10px] font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu sections */}
      <div className="px-4 mt-4 space-y-3">
        {/* Activity */}
        <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Activity</span>
          </div>
          {user.role === 'WORKER' && (
            <MenuItem
              icon={<Zap size={18} className="text-success" />}
              label="My Tasks"
              sublabel="View your active and past tasks"
              onClick={() => navigate('/worker/my-tasks')}
              iconBg="bg-success/10"
            />
          )}
          {user.role === 'BUYER' && (
            <MenuItem
              icon={<Zap size={18} className="text-primary" />}
              label="My Tasks"
              sublabel="Manage your posted tasks"
              onClick={() => navigate('/buyer/tasks')}
              iconBg="bg-primary/10"
            />
          )}
          <MenuItem
            icon={<Bell size={18} className="text-warning" />}
            label="Notifications"
            sublabel="View all alerts and updates"
            onClick={() => navigate('/notifications')}
            iconBg="bg-warning/10"
          />
        </div>

        {/* Support */}
        <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Support</span>
          </div>
          <MenuItem
            icon={<Settings size={18} className="text-text-secondary" />}
            label="Settings"
            sublabel="App preferences"
            onClick={() => {}}
            iconBg="bg-gray-100"
          />
          <MenuItem
            icon={<HelpCircle size={18} className="text-text-secondary" />}
            label="Help & FAQ"
            sublabel="Get help and answers"
            onClick={() => {}}
            iconBg="bg-gray-100"
          />
        </div>

        {/* App info */}
        <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">About</span>
          </div>
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-2xl flex items-center justify-center">
              <Zap size={18} className="text-white" fill="currentColor" />
            </div>
            <div>
              <p className="text-sm font-bold text-text">SwiftDo v0.1.0</p>
              <p className="text-xs text-text-muted">Get work done, verified.</p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-surface rounded-2xl border border-danger/20 shadow-card overflow-hidden">
          <MenuItem
            icon={<LogOut size={18} className="text-danger" />}
            label="Sign Out"
            onClick={handleLogout}
            iconBg="bg-danger/10"
            danger
          />
        </div>
      </div>
    </div>
  );
}
