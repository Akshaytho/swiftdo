import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Mail, Shield, ChevronRight } from 'lucide-react';
import TopBar from '../components/ui/TopBar';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const roleDescriptions: Record<string, string> = {
  BUYER: 'You post tasks and manage workers',
  WORKER: 'You complete tasks and earn money',
  CITIZEN: 'You report civic issues',
  ADMIN: 'Platform administrator',
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div>
      <TopBar title="Profile" />

      <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
        {/* User Card */}
        <Card className="text-center">
          <div className="flex flex-col items-center py-2">
            <Avatar name={user.name} size="xl" />
            <h2 className="text-lg font-bold text-text mt-3">{user.name}</h2>
            <div className="flex items-center gap-1.5 text-sm text-text-secondary mt-1">
              <Mail size={14} />
              <span>{user.email}</span>
            </div>
            <div className="mt-2">
              <Badge status={user.role} size="md" />
            </div>
            <p className="text-xs text-text-muted mt-2">{roleDescriptions[user.role]}</p>
          </div>
        </Card>

        {/* Quick Links */}
        <Card padding="none">
          <div className="divide-y divide-border">
            {user.role === 'WORKER' && (
              <button onClick={() => navigate('/worker/my-tasks')} className="flex items-center justify-between w-full px-4 py-3 text-sm text-text hover:bg-gray-50 transition-colors">
                <span>My Tasks</span>
                <ChevronRight size={16} className="text-text-muted" />
              </button>
            )}
            {user.role === 'BUYER' && (
              <button onClick={() => navigate('/buyer/tasks')} className="flex items-center justify-between w-full px-4 py-3 text-sm text-text hover:bg-gray-50 transition-colors">
                <span>My Tasks</span>
                <ChevronRight size={16} className="text-text-muted" />
              </button>
            )}
            <button onClick={() => navigate('/notifications')} className="flex items-center justify-between w-full px-4 py-3 text-sm text-text hover:bg-gray-50 transition-colors">
              <span>Notifications</span>
              <ChevronRight size={16} className="text-text-muted" />
            </button>
          </div>
        </Card>

        {/* App Info */}
        <Card>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} className="text-primary" />
            <span className="text-sm font-semibold text-text">SwiftDo v0.1.0</span>
          </div>
          <p className="text-xs text-text-muted">Get work done, verified.</p>
        </Card>

        {/* Logout */}
        <Button variant="outline" onClick={handleLogout} icon={<LogOut size={18} />} className="!text-danger !border-danger/30">
          Sign Out
        </Button>
      </div>
    </div>
  );
}
