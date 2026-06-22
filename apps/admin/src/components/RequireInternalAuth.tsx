import { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@resona/api-client';

const INTERNAL_ROLES = new Set([
  'ADMIN',
  'SUPERADMIN',
  'COMMERCIAL',
  'WAREHOUSE',
  'TECHNICIAN',
  'ACCOUNTANT',
]);

export default function RequireInternalAuth({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    checkAuth().finally(() => setReady(true));
  }, [checkAuth]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        Cargando…
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const hasInternalRole =
    (user.role && INTERNAL_ROLES.has(user.role)) ||
    user.additionalRoles?.some((r) => INTERNAL_ROLES.has(r));

  if (!hasInternalRole) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
