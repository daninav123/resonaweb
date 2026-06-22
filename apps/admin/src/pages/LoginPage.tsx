import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@resona/api-client';

const INTERNAL_ROLES = new Set([
  'ADMIN',
  'SUPERADMIN',
  'COMMERCIAL',
  'WAREHOUSE',
  'TECHNICIAN',
  'ACCOUNTANT',
]);

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const logout = useAuthStore((s) => s.logout);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rejected, setRejected] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setRejected(null);

    const ok = await login(email, password);
    if (!ok) return;

    const user = useAuthStore.getState().user;
    const hasInternalRole =
      (user?.role && INTERNAL_ROLES.has(user.role)) ||
      user?.additionalRoles?.some((r) => INTERNAL_ROLES.has(r));

    if (!hasInternalRole) {
      logout();
      setRejected('Esta cuenta no tiene permisos para acceder al panel de gestión.');
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-lg bg-white p-8 shadow"
      >
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Resona · Gestión</h1>
        <p className="mb-6 text-sm text-gray-500">
          Acceso restringido al equipo interno.
        </p>

        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            autoComplete="username"
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Contraseña</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            autoComplete="current-password"
          />
        </label>

        {(error || rejected) && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {rejected || error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary-500 px-4 py-2 font-medium text-white hover:bg-primary-600 disabled:opacity-50"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
