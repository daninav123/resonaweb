import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ADMIN_ROLES, COMMERCIAL_ROLES, getAllUserRoles, type UserRole } from '../config/rolePermissions';

interface PrivateRouteProps {
  requireAdmin?: boolean;
  requireCommercial?: boolean;
  allowedRoles?: UserRole[];
}

const PrivateRoute = ({ requireAdmin = false, requireCommercial = false, allowedRoles }: PrivateRouteProps) => {
  const { isAuthenticated, user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allRoles = getAllUserRoles({ role: user?.role, additionalRoles: user?.additionalRoles });

  if (allowedRoles && !allowedRoles.some(r => allRoles.includes(r))) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !allRoles.some(r => ADMIN_ROLES.includes(r))) {
    return <Navigate to="/" replace />;
  }

  if (requireCommercial && !allRoles.some(r => COMMERCIAL_ROLES.includes(r))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
