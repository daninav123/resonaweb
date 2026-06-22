import { useAuthStore } from '@resona/api-client';
import AdminLayout from '../components/AdminLayout';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido, {user?.firstName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Panel de gestión de Resona.
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Migración en curso
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            Este panel <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">gestion.resonaevents.com</code>{' '}
            está en fase de extracción desde el frontend monolítico. Las páginas admin se irán moviendo aquí en grupos temáticos.
          </p>
          <p className="text-sm text-gray-600">
            El sidebar ya muestra el árbol completo de secciones. Los enlaces que todavía no tienen página
            extraída redirigirán al dashboard.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatusCard label="Auth" status="✓ conectada" detail="vía @resona/api-client" />
          <StatusCard label="Shared types" status="✓ User" detail="@resona/shared-types" />
          <StatusCard label="Pages" status="0 / 102" detail="Admin pages por mover" />
        </div>
      </div>
    </AdminLayout>
  );
}

function StatusCard({
  label,
  status,
  detail,
}: {
  label: string;
  status: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">{status}</p>
      <p className="mt-1 text-xs text-gray-500">{detail}</p>
    </div>
  );
}
