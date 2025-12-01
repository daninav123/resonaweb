import { Package, ShoppingCart, Users, TrendingUp, Calendar, AlertTriangle, Clock, DollarSign, BarChart3, ArrowUpRight, ArrowDownRight, Truck, CheckCircle, XCircle, } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analytics.service';
import toast from 'react-hot-toast';

const DashboardEnhanced = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response: any = await analyticsService.getCompleteDashboard();
      setData(response);
    } catch (error: any) {
      console.error('❌ Error cargando dashboard:', error);
      toast.error('Error al cargar estadísticas del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    const labels: any = {
      PENDING: 'Pendiente',
      IN_PROGRESS: 'En Proceso',
      COMPLETED: 'Completado',
      CANCELLED: 'Cancelado',
    };
    return { class: badges[status] || 'bg-gray-100 text-gray-800', label: labels[status] || status };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona"></div>
      </div>
    );
  }

  const { stats, metrics, topProducts, topCustomers, upcomingEvents, recentOrders, inventoryUtilization } = data || {};

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Resumen de tu negocio de alquiler de equipos</p>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Ingresos del Mes */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos del Mes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                €{Number(stats?.monthRevenue || 0).toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                {metrics?.revenueGrowth >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${metrics?.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics?.revenueGrowth > 0 ? '+' : ''}{metrics?.revenueGrowth || 0}%
                </span>
                <span className="text-xs text-gray-500 ml-2">vs mes pasado</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Pedidos Activos */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {(stats?.pendingOrders || 0) + (stats?.inProgressOrders || 0)}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-yellow-600">
                  {stats?.pendingOrders || 0} pendientes
                </span>
                <span className="text-xs text-blue-600">
                  {stats?.inProgressOrders || 0} en curso
                </span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Próximos Eventos */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Próximos Eventos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {upcomingEvents?.length || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Próximo mes</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

      </div>

      {/* Métrica Promedio por Pedido */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Promedio por Pedido</h3>
          <TrendingUp className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-2xl font-bold text-gray-900">€{Number(metrics?.avgOrderValue || 0).toLocaleString()}</p>
        <p className="text-sm text-gray-500 mt-1">Este mes</p>
      </div>

      {/* Top Products & Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Productos */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Top 5 Productos Más Alquilados</h2>
          </div>
          <div className="p-6">
            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product: any, index: number) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.totalOrders} alquileres</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        €{Number(product.totalRevenue || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
            )}
          </div>
        </div>

        {/* Top Clientes */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Top 5 Mejores Clientes</h2>
          </div>
          <div className="p-6">
            {topCustomers && topCustomers.length > 0 ? (
              <div className="space-y-4">
                {topCustomers.map((customer: any, index: number) => (
                  <div key={customer.id} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                      <p className="text-xs text-gray-500">{customer.totalOrders} pedidos</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        €{Number(customer.totalSpent || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
            )}
          </div>
        </div>
      </div>

      {/* Próximos Eventos */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Próximos Eventos del Mes</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {upcomingEvents.slice(0, 5).map((event: any) => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-2 rounded">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-500">{event.customer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(event.start).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                    <p className="text-xs text-gray-500">€{Number(event.total || 0).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Pedidos Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order: any) => {
                  const statusBadge = getStatusBadge(order.status);
                  const customerName = order.user?.firstName
                    ? `${order.user.firstName} ${order.user.lastName || ''}`.trim()
                    : order.user?.email?.split('@')[0] || 'Cliente';

                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link to={`/admin/orders`} className="hover:text-resona">
                          #{order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{customerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        €{Number(order.total || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.class}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingCart className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">No hay pedidos recientes</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardEnhanced;
