import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLabels: Record<string, string> = {
  BUYER: 'Buyer',
  WORKER: 'Worker',
  CITIZEN: 'Citizen',
  ADMIN: 'Admin',
};

const roleNav: Record<string, { label: string; to: string }[]> = {
  BUYER: [
    { label: 'My Tasks', to: '/buyer/tasks' },
    { label: 'Create Task', to: '/buyer/tasks/new' },
  ],
  WORKER: [
    { label: 'Browse Tasks', to: '/worker/tasks' },
    { label: 'My Tasks', to: '/worker/my-tasks' },
  ],
  CITIZEN: [
    { label: 'My Reports', to: '/citizen/reports' },
    { label: 'New Report', to: '/citizen/reports/new' },
  ],
  ADMIN: [],
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user ? roleNav[user.role] || [] : [];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-lg font-bold text-indigo-600">SwiftDo</Link>
            {user && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                {roleLabels[user.role]}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm text-gray-600 hover:text-indigo-600"
              >
                {item.label}
              </Link>
            ))}
            {user && (
              <>
                <Link to="/notifications" className="text-sm text-gray-600 hover:text-indigo-600">
                  Notifications
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
