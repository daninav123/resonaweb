import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface PrivateRouteProps {
  requireAdmin?: boolean;
}

const PrivateRoute = ({ requireAdmin = false }: PrivateRouteProps) => {
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

  if (requireAdmin && user?.role !== 'ADMIN' && user?.role !== 'SUPERADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
