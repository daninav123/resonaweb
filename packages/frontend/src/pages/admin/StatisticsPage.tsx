import { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analytics.service';
import toast from 'react-hot-toast';
import {
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  Calendar,
  DollarSign,
  ShoppingCart,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Target,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const StatisticsPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90'>('30');
  const [activeTab, setActiveTab] = useState<'general' | 'inventory' | 'amortization'>('general');
  
  // Filtros y ordenamiento para amortización
  const [amortizationFilter, setAmortizationFilter] = useState<'all' | 'amortized' | 'not-amortized'>('all');
  const [amortizationSort, setAmortizationSort] = useState<'percentage' | 'profit' | 'name'>('percentage');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [amortizationSearch, setAmortizationSearch] = useState('');

  useEffect(() => {
    loadStatistics();
  }, [selectedPeriod]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      // Cargar todas las estadísticas en paralelo
      const [
        dashboardStats,
        performanceMetrics,
        topProducts,
        topCustomers,
        revenueChart,
        statusDistribution,
        inventoryUtilization,
        rentalPeriods,
        productAmortization,
      ] = await Promise.all([
        analyticsService.getDashboardStats(),
        analyticsService.getPerformanceMetrics(),
        analyticsService.getTopProducts(10),
        analyticsService.getTopCustomers(10),
        analyticsService.getRevenueChart(parseInt(selectedPeriod)),
        analyticsService.getOrderStatusDistribution(),
        analyticsService.getInventoryUtilization(),
        analyticsService.getPopularRentalPeriods(),
        analyticsService.getProductAmortization(),
      ]);

      setData({
        stats: dashboardStats,
        metrics: performanceMetrics,
        topProducts,
        topCustomers,
        revenueChart,
        statusDistribution,
        inventoryUtilization,
        rentalPeriods,
        productAmortization,
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona"></div>
      </div>
    );
  }

  const { stats, metrics, topProducts, topCustomers, revenueChart, statusDistribution, inventoryUtilization, rentalPeriods, productAmortization } = data || {};

  // Calcular totales para la distribución de estados
  const totalOrders = statusDistribution?.reduce((sum: number, item: any) => sum + item.count, 0) || 1;

  // Calcular el máximo de ingresos para escalar el gráfico
  const maxRevenue = Math.max(...(revenueChart?.map((item: any) => item.revenue) || [1]));

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Estadísticas y Analytics</h1>
        <p className="text-gray-600 mt-1">Análisis completo de tu negocio</p>
      </div>

      {/* Pestañas de navegación */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'general'
                  ? 'border-resona text-resona'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Estadísticas Generales
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'inventory'
                  ? 'border-resona text-resona'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📦 Utilización de Inventario
            </button>
            <button
              onClick={() => setActiveTab('amortization')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'amortization'
                  ? 'border-resona text-resona'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💰 Amortización de Productos
            </button>
          </nav>
        </div>
      </div>

      {/* Filtro de Período - Solo en pestaña general */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Período de análisis:</span>
            <div className="flex gap-2">
              {[
                { value: '7', label: 'Última semana' },
                { value: '30', label: 'Último mes' },
                { value: '90', label: 'Últimos 3 meses' },
              ].map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period.value
                      ? 'bg-resona text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contenido de la pestaña General */}
      {activeTab === 'general' && (
        <>
          {/* Resumen Financiero */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          Resumen Financiero
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
            <p className="text-3xl font-bold text-gray-900">€{Number(stats?.totalRevenue || 0).toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-1">Acumulado</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Ingresos del Mes</p>
            <p className="text-3xl font-bold text-gray-900">€{Number(stats?.monthRevenue || 0).toLocaleString()}</p>
            <p className={`text-sm mt-1 ${metrics?.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics?.revenueGrowth > 0 ? '+' : ''}{metrics?.revenueGrowth || 0}% vs anterior
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Ticket Promedio</p>
            <p className="text-3xl font-bold text-gray-900">€{Number(metrics?.avgOrderValue || 0).toLocaleString()}</p>
            <p className="text-sm text-gray-600 mt-1">Por pedido</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Pedidos</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
            <p className={`text-sm mt-1 ${metrics?.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics?.orderGrowth > 0 ? '+' : ''}{metrics?.orderGrowth || 0}% vs anterior
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico de Ingresos */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          Tendencia de Ingresos
        </h2>
        <div className="h-64 flex items-end gap-1">
          {revenueChart?.map((item: any, index: number) => {
            const height = (item.revenue / maxRevenue) * 100;
            const date = new Date(item.date);
            return (
              <div key={index} className="flex-1 flex flex-col items-center group relative">
                <div
                  className="w-full bg-gradient-to-t from-resona to-blue-300 rounded-t hover:from-blue-600 hover:to-blue-400 transition-all cursor-pointer"
                  style={{ height: `${height}%`, minHeight: item.revenue > 0 ? '4px' : '0' }}
                />
                <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-left hidden group-hover:block absolute -bottom-12">
                  {date.getDate()}/{date.getMonth() + 1}
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  €{item.revenue.toFixed(2)}
                  <br />
                  {item.orders} pedidos
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex justify-between text-sm text-gray-500">
          <span>
            {revenueChart && revenueChart[0] && new Date(revenueChart[0].date).toLocaleDateString('es-ES')}
          </span>
          <span>
            {revenueChart &&
              revenueChart[revenueChart.length - 1] &&
              new Date(revenueChart[revenueChart.length - 1].date).toLocaleDateString('es-ES')}
          </span>
        </div>
      </div>

      {/* Distribución de Estados y Períodos Populares */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Distribución de Estados */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <PieChart className="w-6 h-6 text-purple-600" />
            Distribución de Pedidos
          </h2>
          <div className="space-y-4">
            {statusDistribution?.map((item: any) => {
              const percentage = ((item.count / totalOrders) * 100).toFixed(1);
              const colors: any = {
                PENDING: 'bg-yellow-500',
                IN_PROGRESS: 'bg-blue-500',
                COMPLETED: 'bg-green-500',
                CANCELLED: 'bg-red-500',
              };
              const labels: any = {
                PENDING: 'Pendientes',
                IN_PROGRESS: 'En Proceso',
                COMPLETED: 'Completados',
                CANCELLED: 'Cancelados',
              };
              return (
                <div key={item.status}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{labels[item.status]}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {item.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${colors[item.status]} h-3 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Períodos de Alquiler Populares */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-orange-600" />
            Períodos Más Populares
          </h2>
          <div className="space-y-4">
            {rentalPeriods?.map((period: any, index: number) => {
              const maxCount = rentalPeriods[0]?.count || 1;
              const percentage = (period.count / maxCount) * 100;
              return (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{period.label}</span>
                    <span className="text-sm font-bold text-gray-900">{period.count} alquileres</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Productos Detallado */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Package className="w-6 h-6 text-purple-600" />
          Análisis de Productos (Top 10)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Alquileres</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ingreso Medio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topProducts?.map((product: any, index: number) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">#{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.sku}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">{product.totalOrders}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                    €{Number(product.totalRevenue || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    €{(Number(product.totalRevenue || 0) / product.totalOrders).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Clientes Detallado */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Análisis de Clientes (Top 10)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pedidos</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gasto Total</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ticket Medio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topCustomers?.map((customer: any, index: number) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">#{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{customer.email}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">{customer.totalOrders}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                    €{Number(customer.totalSpent || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    €{(Number(customer.totalSpent || 0) / customer.totalOrders).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}

      {/* Contenido de la pestaña Inventario */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-green-600" />
            Utilización de Inventario
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventoryUtilization?.slice(0, 12).map((item: any) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 truncate">{item.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{item.sku}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stock Total:</span>
                    <span className="font-medium">{item.totalStock}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reservados:</span>
                    <span className="font-medium text-orange-600">{item.reserved}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Disponibles:</span>
                    <span className="font-medium text-green-600">{item.available}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600">Utilización:</span>
                      <span className="text-xs font-bold text-gray-900">{item.utilization}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.utilization > 80
                            ? 'bg-red-500'
                            : item.utilization > 50
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${item.utilization}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contenido de la pestaña Amortización */}
      {activeTab === 'amortization' && (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Amortización de Productos
          </h2>
          {!productAmortization || productAmortization.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay productos con precio de compra configurado</p>
            </div>
          ) : (
            <>
              {/* Buscador */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre de producto o SKU..."
                    value={amortizationSearch}
                    onChange={(e) => setAmortizationSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-resona"
                  />
                  {amortizationSearch && (
                    <button
                      onClick={() => setAmortizationSearch('')}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Controles de filtro y ordenamiento */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por estado:</label>
                  <select
                    value={amortizationFilter}
                    onChange={(e) => setAmortizationFilter(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                  >
                    <option value="all">Todos los productos</option>
                    <option value="amortized">✅ Amortizados (generando beneficio)</option>
                    <option value="not-amortized">⏳ No amortizados</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por:</label>
                  <select
                    value={amortizationSort}
                    onChange={(e) => setAmortizationSort(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                  >
                    <option value="percentage">% de Amortización (menor primero)</option>
                    <option value="profit">💰 Beneficio Generado (mayor primero)</option>
                    <option value="name">📝 Nombre (A-Z)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                // Filtrar productos por búsqueda
                let filtered = productAmortization.filter((product: any) => {
                  const searchLower = amortizationSearch.toLowerCase();
                  return (
                    product.name.toLowerCase().includes(searchLower) ||
                    product.sku.toLowerCase().includes(searchLower)
                  );
                });

                // Filtrar por estado
                filtered = filtered.filter((product: any) => {
                  if (amortizationFilter === 'amortized') return product.isAmortized;
                  if (amortizationFilter === 'not-amortized') return !product.isAmortized;
                  return true;
                });

                // Ordenar productos
                filtered = [...filtered].sort((a: any, b: any) => {
                  if (amortizationSort === 'percentage') {
                    return a.amortizationPercentage - b.amortizationPercentage;
                  } else if (amortizationSort === 'profit') {
                    return b.profit - a.profit;
                  } else {
                    return a.name.localeCompare(b.name);
                  }
                });

                return filtered.map((product: any) => {
                  const isExpanded = expandedProducts.has(product.id);
                  const hasMultipleLots = product.lots && product.lots.length > 1;
                  
                  return (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg truncate">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                    </div>
                    {hasMultipleLots && (
                      <button
                        onClick={() => {
                          const newExpanded = new Set(expandedProducts);
                          if (isExpanded) {
                            newExpanded.delete(product.id);
                          } else {
                            newExpanded.add(product.id);
                          }
                          setExpandedProducts(newExpanded);
                        }}
                        className="ml-2 text-resona hover:text-resona-dark"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    )}
                  </div>
                  {hasMultipleLots && (
                    <p className="text-xs text-gray-600 mb-4">
                      {product.lots.length} lotes de compra
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Precio Compra:</span>
                      <span className="font-bold text-gray-900">€{product.purchasePrice.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Generado:</span>
                      <span className="font-bold text-blue-600">€{product.totalGenerated.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {product.isAmortized ? 'Falta:' : 'Falta:'}
                      </span>
                      <span className={`font-bold text-lg ${product.isAmortized ? 'text-green-600' : 'text-red-600'}`}>
                        {product.isAmortized 
                          ? '€0 ✓' 
                          : `-€${product.remaining.toLocaleString()}`}
                      </span>
                    </div>
                    
                    {/* Beneficio Generado (solo si está amortizado) */}
                    {product.isAmortized && (
                      <div className="flex justify-between text-sm bg-green-50 -mx-5 px-5 py-2">
                        <span className="text-green-700 font-medium">💰 Beneficio Generado:</span>
                        <span className="font-bold text-lg text-green-600">
                          +€{product.profit.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Veces Alquilado:</span>
                      <span className="font-medium text-gray-900">{product.timesRented}</span>
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Amortización:</span>
                        <span className="text-lg font-bold text-gray-900">{product.amortizationPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full transition-all ${
                            product.isAmortized
                              ? 'bg-gradient-to-r from-green-500 to-green-600'
                              : product.amortizationPercentage > 75
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                              : product.amortizationPercentage > 50
                              ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                              : 'bg-gradient-to-r from-red-400 to-red-500'
                          }`}
                          style={{ width: `${Math.min(product.amortizationPercentage, 100)}%` }}
                        />
                      </div>
                      {product.isAmortized && (
                        <p className="text-center text-sm text-green-600 font-bold mt-2">✓ AMORTIZADO</p>
                      )}
                    </div>
                    
                    {/* Mostrar lotes individuales si está expandido */}
                    {isExpanded && product.lots && product.lots.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-bold text-gray-700 mb-3">
                          Lotes Individuales ({product.lots.length})
                        </h4>
                        <div className="space-y-3">
                          {product.lots.map((lot: any, index: number) => {
                            const lotCost = Number(lot.totalCost);
                            const lotGenerated = Number(lot.totalGenerated);
                            const lotPercentage = lotCost > 0 ? Math.min((lotGenerated / lotCost) * 100, 100) : 0;
                            const lotAmortized = lotGenerated >= lotCost;
                            
                            return (
                              <div key={lot.id} className={`p-3 rounded-lg border ${lotAmortized ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="text-xs font-bold text-gray-700">
                                      Lote #{product.lots.length - index}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date(lot.purchaseDate).toLocaleDateString('es-ES')}
                                    </p>
                                  </div>
                                  {lotAmortized && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                      ✓
                                    </span>
                                  )}
                                </div>
                                
                                <div className="space-y-1 text-xs mb-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Cantidad:</span>
                                    <span className="font-medium">{lot.quantity} unid.</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Coste:</span>
                                    <span className="font-bold">€{lotCost.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Generado:</span>
                                    <span className="font-bold text-blue-600">€{lotGenerated.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      {lotAmortized ? 'Beneficio:' : 'Falta:'}
                                    </span>
                                    <span className={`font-bold ${lotAmortized ? 'text-green-600' : 'text-red-600'}`}>
                                      {lotAmortized ? '+' : '-'}€{Math.abs(lotCost - lotGenerated).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${lotAmortized ? 'bg-green-500' : 'bg-orange-500'}`}
                                    style={{ width: `${lotPercentage}%` }}
                                  />
                                </div>
                                <p className="text-xs text-center mt-1 font-medium">
                                  {lotPercentage.toFixed(0)}% amortizado
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
                });
              })()}
            </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default StatisticsPage;
