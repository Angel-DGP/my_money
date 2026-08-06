import { Navigate, Outlet } from 'react-router-dom';
import { useSessionStore } from '@entities/session';

export function ProtectedRoute() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
