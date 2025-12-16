import { useEffect, useState } from 'react';
import { FileText, TrendingUp, DollarSign, Users, ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { api } from '../../services/api';

interface DashboardStats {
  stats: {
    quotes: {
      thisMonth: number;
      lastMonth: number;
      change: number;
    };
    quotesWon: {
      thisMonth: number;
      lastMonth: number;
      change: number;
    };
    conversionRate: {
      current: number;
      lastMonth: number;
      change: number;
    };
    totalQuotesValue: number;
  };
  commissions: {
    month: { total: number; count: number };
    quarter: { total: number; count: number };
    year: { total: number; count: number };
    pending: { total: number; count: number };
  };
  leads: {
    total: number;
    byStatus: Record<string, number>;
    converted: number;
    conversionRate: number;
    pendingFollowUps: number;
  };
  recentActivity: {
    quotes: any[];
    leads: any[];
  };
  pendingFollowUps: number;
}

const CommercialDashboard = () => {
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/commercial/dashboard');
      setDashboard(response as DashboardStats);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Error al cargar el dashboard</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONTACTED: 'bg-blue-100 text-blue-800',
      QUOTED: 'bg-purple-100 text-purple-800',
      CONVERTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      NEW: 'bg-gray-100 text-gray-800',
      INTERESTED: 'bg-indigo-100 text-indigo-800',
      NEGOTIATING: 'bg-orange-100 text-orange-800',
      LOST: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      CONTACTED: 'Contactado',
      QUOTED: 'Presupuestado',
      CONVERTED: 'Convertido',
      REJECTED: 'Rechazado',
      NEW: 'Nuevo',
      INTERESTED: 'Interesado',
      NEGOTIATING: 'Negociando',
      LOST: 'Perdido',
    };
    return labels[status] || status;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Comercial</h1>
        <p className="text-gray-600 mt-1">Resumen de tu actividad y comisiones</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Presupuestos del Mes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Presupuestos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {dashboard.stats.quotes.thisMonth}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {dashboard.stats.quotes.change >= 0 ? (
              <ArrowUp size={16} className="text-green-600" />
            ) : (
              <ArrowDown size={16} className="text-red-600" />
            )}
            <span
              className={`text-sm font-medium ml-1 ${
                dashboard.stats.quotes.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {Math.abs(dashboard.stats.quotes.change)}%
            </span>
            <span className="text-sm text-gray-600 ml-2">vs mes anterior</span>
          </div>
        </div>

        {/* Presupuestos Ganados */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ganados</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {dashboard.stats.quotesWon.thisMonth}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {dashboard.stats.quotesWon.change >= 0 ? (
              <ArrowUp size={16} className="text-green-600" />
            ) : (
              <ArrowDown size={16} className="text-red-600" />
            )}
            <span
              className={`text-sm font-medium ml-1 ${
                dashboard.stats.quotesWon.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {Math.abs(dashboard.stats.quotesWon.change)}%
            </span>
            <span className="text-sm text-gray-600 ml-2">vs mes anterior</span>
          </div>
        </div>

        {/* Tasa de Conversión */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversión</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {dashboard.stats.conversionRate.current}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {dashboard.stats.conversionRate.change >= 0 ? (
              <ArrowUp size={16} className="text-green-600" />
            ) : (
              <ArrowDown size={16} className="text-red-600" />
            )}
            <span
              className={`text-sm font-medium ml-1 ${
                dashboard.stats.conversionRate.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {Math.abs(dashboard.stats.conversionRate.change)}%
            </span>
            <span className="text-sm text-gray-600 ml-2">vs mes anterior</span>
          </div>
        </div>

        {/* Valor Total */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(dashboard.stats.totalQuotesValue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-amber-600" size={24} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">Presupuestos enviados este mes</span>
          </div>
        </div>
      </div>

      {/* Comisiones */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-6">💰 Mis Comisiones (10%)</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-green-100 text-sm font-medium">Este Mes</p>
            <p className="text-4xl font-bold mt-2">{formatCurrency(dashboard.commissions.month.total)}</p>
            <p className="text-green-100 text-sm mt-1">{dashboard.commissions.month.count} presupuestos</p>
          </div>
          <div>
            <p className="text-green-100 text-sm font-medium">Este Trimestre</p>
            <p className="text-4xl font-bold mt-2">{formatCurrency(dashboard.commissions.quarter.total)}</p>
            <p className="text-green-100 text-sm mt-1">{dashboard.commissions.quarter.count} presupuestos</p>
          </div>
          <div>
            <p className="text-green-100 text-sm font-medium">Este Año</p>
            <p className="text-4xl font-bold mt-2">{formatCurrency(dashboard.commissions.year.total)}</p>
            <p className="text-green-100 text-sm mt-1">{dashboard.commissions.year.count} presupuestos</p>
          </div>
          <div>
            <p className="text-green-100 text-sm font-medium">Pendiente de Pago</p>
            <p className="text-4xl font-bold mt-2">{formatCurrency(dashboard.commissions.pending.total)}</p>
            <p className="text-green-100 text-sm mt-1">{dashboard.commissions.pending.count} generadas</p>
          </div>
        </div>
      </div>

      {/* Leads y Seguimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leads</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold text-gray-900">{dashboard.leads.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Convertidos</span>
              <span className="text-lg font-semibold text-green-600">{dashboard.leads.converted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tasa de Conversión</span>
              <span className="text-lg font-semibold text-purple-600">{dashboard.leads.conversionRate}%</span>
            </div>
          </div>
        </div>

        {/* Seguimientos Pendientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Seguimientos Pendientes</h3>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="text-orange-600" size={20} />
            </div>
          </div>
          <div className="text-center py-4">
            <p className="text-5xl font-bold text-orange-600">{dashboard.pendingFollowUps}</p>
            <p className="text-gray-600 mt-2">Leads requieren tu atención</p>
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Presupuestos Recientes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Presupuestos Recientes</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboard.recentActivity.quotes.slice(0, 5).map((quote) => (
                <div key={quote.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{quote.customerName || 'Sin nombre'}</p>
                    <p className="text-sm text-gray-600">{quote.eventType}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(Number(quote.estimatedTotal || 0))}</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quote.status)}`}>
                      {getStatusLabel(quote.status)}
                    </span>
                  </div>
                </div>
              ))}
              {dashboard.recentActivity.quotes.length === 0 && (
                <p className="text-center text-gray-500 py-4">No hay presupuestos recientes</p>
              )}
            </div>
          </div>
        </div>

        {/* Leads Recientes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Leads Recientes</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {dashboard.recentActivity.leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-600">{lead.eventType || 'Sin tipo'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                      {getStatusLabel(lead.status)}
                    </span>
                  </div>
                </div>
              ))}
              {dashboard.recentActivity.leads.length === 0 && (
                <p className="text-center text-gray-500 py-4">No hay leads recientes</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommercialDashboard;
