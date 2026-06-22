import { useState, useEffect } from 'react';
import { api } from '@resona/api-client';
import { Loader2, TrendingUp, Calendar, Package, Users, DollarSign, ShoppingCart, Truck, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
  { key: 'director', label: 'Director / Gerente' },
  { key: 'commercial', label: 'Comercial' },
  { key: 'warehouse', label: 'Almacén / Logística' },
  { key: 'technician', label: 'Técnico' },
  { key: 'accountant', label: 'Contabilidad' },
];

const StatCard = ({ icon: Icon, label, value, sub, color = 'blue' }: any) => (
  <div className="bg-white rounded-lg border p-4">
    <div className="flex items-center gap-2 mb-1">
      <Icon className={`w-4 h-4 text-${color}-500`} />
      <p className="text-xs text-gray-500">{label}</p>
    </div>
    <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const RoleDashboardPage = () => {
  const [role, setRole] = useState('director');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/dashboard');
        setData(res);
      } catch { toast.error('Error cargando dashboard'); } finally { setLoading(false); }
    };
    load();
  }, []);

  const fmt = (n: number) => Number(n || 0).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;
  if (!data) return <div className="text-center py-12 text-gray-400">Sin datos</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard por Rol</h1>
          <p className="text-gray-600">Vista adaptada según el perfil</p>
        </div>
        <div className="flex gap-2">
          {ROLES.map(r => (
            <button key={r.key} onClick={() => setRole(r.key)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${role === r.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {role === 'director' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={DollarSign} label="Facturación mes" value={`${fmt(data?.revenue?.month || 0)}€`} color="green" />
            <StatCard icon={ShoppingCart} label="Pedidos activos" value={data?.orders?.active || 0} color="blue" />
            <StatCard icon={Calendar} label="Eventos próximos" value={data?.events?.upcoming || 0} color="purple" />
            <StatCard icon={TrendingUp} label="Presupuestos pend." value={data?.quotes?.pending || 0} color="orange" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Clientes totales" value={data?.customers?.total || 0} color="blue" />
            <StatCard icon={Package} label="Productos activos" value={data?.products?.active || 0} color="green" />
            <StatCard icon={AlertTriangle} label="Stock bajo" value={data?.products?.lowStock || 0} color="red" />
            <StatCard icon={DollarSign} label="Gastos mes" value={`${fmt(data?.expenses?.month || 0)}€`} color="red" />
          </div>
        </div>
      )}

      {role === 'commercial' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={TrendingUp} label="Presupuestos enviados" value={data?.quotes?.total || 0} color="blue" />
            <StatCard icon={Clock} label="Pendientes respuesta" value={data?.quotes?.pending || 0} color="orange" />
            <StatCard icon={CheckCircle2} label="Aprobados" value={data?.quotes?.approved || 0} color="green" />
            <StatCard icon={DollarSign} label="Valor pipeline" value={`${fmt(data?.quotes?.totalValue || 0)}€`} color="purple" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={Users} label="Leads activos" value={data?.leads?.active || 0} sub="Contactos en seguimiento" color="blue" />
            <StatCard icon={Calendar} label="Próximos eventos" value={data?.events?.upcoming || 0} sub="En las próximas 2 semanas" color="green" />
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
            Accede al panel comercial completo desde el menú lateral para gestionar tus presupuestos y leads.
          </div>
        </div>
      )}

      {role === 'warehouse' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Package} label="Productos totales" value={data?.products?.total || 0} color="blue" />
            <StatCard icon={AlertTriangle} label="Stock bajo" value={data?.products?.lowStock || 0} color="red" />
            <StatCard icon={ShoppingCart} label="Pedidos para preparar" value={data?.orders?.active || 0} sub="Picking pendiente" color="orange" />
            <StatCard icon={Truck} label="Entregas hoy" value={data?.deliveries?.today || 0} color="green" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={CheckCircle2} label="Check-ins pendientes" value={data?.materialChecks?.pending || 0} sub="Material por recibir" color="blue" />
            <StatCard icon={Calendar} label="Devoluciones hoy" value={data?.returns?.today || 0} sub="Material por devolver" color="purple" />
          </div>
        </div>
      )}

      {role === 'technician' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard icon={Calendar} label="Eventos esta semana" value={data?.events?.thisWeek || data?.events?.upcoming || 0} color="blue" />
            <StatCard icon={Truck} label="Montajes pendientes" value={data?.events?.setup || 0} sub="Próximos montajes" color="orange" />
            <StatCard icon={CheckCircle2} label="Desmontajes" value={data?.events?.teardown || 0} sub="Pendientes de recoger" color="green" />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
            Usa la &quot;Vista Técnicos&quot; en Operaciones para ver tus eventos asignados con navegación y contactos directos.
          </div>
        </div>
      )}

      {role === 'accountant' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={DollarSign} label="Facturación mes" value={`${fmt(data?.revenue?.month || 0)}€`} color="green" />
            <StatCard icon={DollarSign} label="Gastos mes" value={`${fmt(data?.expenses?.month || 0)}€`} color="red" />
            <StatCard icon={ShoppingCart} label="Facturas pendientes" value={data?.invoices?.pending || data?.orders?.active || 0} color="orange" />
            <StatCard icon={TrendingUp} label="Margen estimado" value={`${fmt((data?.revenue?.month || 0) - (data?.expenses?.month || 0))}€`} color="blue" />
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
            Accede a Contabilidad y Contabilidad Fiscal desde el menú para gestionar facturas, gastos e impuestos.
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleDashboardPage;
