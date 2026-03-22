import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageSkeleton } from '../components/ui/Skeleton';

const roleHome: Record<string, string> = {
  BUYER: '/buyer/tasks',
  WORKER: '/worker/tasks',
  CITIZEN: '/citizen/reports',
  ADMIN: '/buyer/tasks',
};

export default function HomePage() {
  const { user, loading } = useAuth();
  if (loading) return <PageSkeleton />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={roleHome[user.role] || '/login'} replace />;
}
