import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RoleRoute({ allowedRole }) {
  const { role } = useAuth();

  if (role !== allowedRole) {
    // Redirect to proper role dashboard
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  return <Outlet />;
}
