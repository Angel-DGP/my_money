import { Outlet } from 'react-router-dom';

export function PublicRoute() {
  // If user is authenticated, we might want to redirect to dashboard
  return <Outlet />;
}
