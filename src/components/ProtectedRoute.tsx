import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: 'founder' | 'owner';
}) {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;

  if (role === 'founder' && profile?.role !== 'founder') {
    return <Navigate to="/my-store" replace />;
  }

  if (role === 'owner' && profile?.role === 'founder') {
    // founders can still open my-store with a store id
  }

  return <>{children}</>;
}
