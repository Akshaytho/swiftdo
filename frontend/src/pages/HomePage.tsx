import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome: Record<string, string> = {
  BUYER: '/buyer/tasks',
  WORKER: '/worker/tasks',
  CITIZEN: '/citizen/reports',
  ADMIN: '/buyer/tasks',
};

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-gray-400 text-sm py-8 text-center">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHome[user.role] || '/login'} replace />;
}
