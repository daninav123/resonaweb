import { Package, ShoppingCart, Users, TrendingUp, Calendar, Settings, LogOut, FileText, Calculator, Truck, Building2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analytics.service';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data: any = await analyticsService.getDashboardStats();
      
      console.log('📊 Dashboard data received:', data);
      console.log('📦 Recent orders:', data?.recentOrders);
      
      setStats(data);
      
      // Asegurar que recentOrders es un array
      if (Array.isArray(data?.recentOrders)) {
        setRecentOrders(data.recentOrders);
      } else if (data?.recentOrders) {
        console.warn('⚠️ recentOrders no es un array:', typeof data.recentOrders);
        setRecentOrders([]);
      } else {
        console.log('ℹ️ No hay recentOrders en la respuesta');
        setRecentOrders([]);
      }
    } catch (error: any) {
      console.error('❌ Error cargando dashboard:', error);
      console.error('Response:', error.response?.data);
      toast.error('Error al cargar estadísticas del dashboard');
      setRecentOrders([]);
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

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    €{stats?.totalRevenue?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-green-600">
                    {stats?.revenueGrowth > 0 ? '+' : ''}{stats?.revenueGrowth?.toFixed(1) || '0'}% desde el mes pasado
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pedidos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || '0'}</p>
                  <p className="text-sm text-blue-600">
                    {stats?.ordersGrowth > 0 ? '+' : ''}{stats?.ordersGrowth?.toFixed(1) || '0'}% desde el mes pasado
                  </p>
                </div>
                <ShoppingCart className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Productos Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || '0'}</p>
                  <p className="text-sm text-purple-600">
                    {stats?.newProducts || '0'} nuevos esta semana
                  </p>
                </div>
                <Package className="w-12 h-12 text-purple-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Usuarios Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || '0'}</p>
                  <p className="text-sm text-orange-600">
                    {stats?.usersGrowth > 0 ? '+' : ''}{stats?.usersGrowth?.toFixed(1) || '0'}% desde el mes pasado
                  </p>
                </div>
                <Users className="w-12 h-12 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link to="/admin/shipping-config" className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Configurar Envío</h3>
                  <p className="text-blue-100 text-sm">Tarifas, zonas y mínimos</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/products" className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Gestionar Productos</h3>
                  <p className="text-purple-100 text-sm">Stock y catálogo</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/orders" className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Ver Pedidos</h3>
                  <p className="text-green-100 text-sm">Estado y gestión</p>
                </div>
              </div>
            </Link>

            <Link to="/admin/invoices/manual" className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg hover:shadow-xl transition">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Factura Manual</h3>
                  <p className="text-orange-100 text-sm">Eventos externos</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Pedidos Recientes</h2>
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
                  {!recentOrders || recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <ShoppingCart className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500 font-medium">No hay pedidos recientes</p>
                          <p className="text-sm text-gray-400">Los nuevos pedidos aparecerán aquí</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order, index) => {
                      if (!order) {
                        console.warn(`⚠️ Pedido en índice ${index} es null/undefined`);
                        return null;
                      }
                      
                      const statusBadge = getStatusBadge(order.status || 'PENDING');
                      const orderId = order.id || `temp-${index}`;
                      const orderNumber = order.orderNumber || (order.id ? `#${order.id.slice(0, 8)}` : `#${index + 1}`);
                      const customerName = order.user?.firstName 
                        ? `${order.user.firstName} ${order.user.lastName || ''}`.trim()
                        : order.user?.email 
                        ? order.user.email.split('@')[0]
                        : 'Cliente';
                      const orderDate = order.createdAt 
                        ? new Date(order.createdAt).toLocaleDateString('es-ES')
                        : '-';
                      const orderTotal = typeof order.total === 'number' 
                        ? order.total.toFixed(2)
                        : '0.00';
                      
                      return (
                        <tr key={orderId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <Link to={`/admin/orders`} className="hover:text-resona">
                              {orderNumber}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {orderDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            €{orderTotal}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.class}`}>
                              {statusBadge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
    </div>
  );
};

export default Dashboard;
