import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSessionStore } from '../../../entities/session/model/store';

export function ProtectedRoute() {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
