import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, ShoppingCart, Package, Users, Calendar,
  AlertTriangle, Clock, DollarSign, FileText, Mail, Truck, ArrowRight,
  Activity, Bell, ChevronRight, MapPin, Phone, Eye, Wrench,
  Plus, BarChart3, Zap, RefreshCw, Calculator, CircleDot,
} from 'lucide-react';
import { analyticsService } from '../../services/analytics.service';
import toast from 'react-hot-toast';

// ============= TYPES =============
interface SmartDashboardData {
  todayEvents: TodayEvent[];
  weekEvents: WeekEvent[];
  workload: 'libre' | 'bajo' | 'medio' | 'alto';
  alerts: AlertsData;
  pipeline: PipelineData;
  kpis: KPIsData;
  billing: BillingData;
  recentOrders: RecentOrder[];
}

interface TodayEvent {
  id: string;
  orderNumber: string;
  customer: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  status: string;
  phase: 'montaje' | 'en_curso' | 'desmontaje' | 'dia_completo';
  total: number;
  eventType: string;
  location: any;
  deliveryType: string;
  itemCount: number;
  items: { name: string; sku: string; qty: number }[];
}

interface WeekEvent {
  id: string;
  orderNumber: string;
  customer: string;
  startDate: string;
  endDate: string;
  status: string;
  total: number;
  eventType: string;
  itemCount: number;
}

interface AlertsData {
  unpaidOrders: { id: string; orderNumber: string; total: number; daysOverdue: number; customer: string }[];
  lowStockProducts: { id: string; name: string; sku: string; stock: number }[];
  overdueReturns: { id: string; orderNumber: string; total: number; daysOverdue: number; customer: string }[];
  unansweredQuotes: { id: string; customerName: string; customerEmail: string; estimatedTotal: number; hoursWaiting: number; eventType: string }[];
  brokenUnits: number;
  totalAlerts: number;
}

interface PipelineData {
  leads: { new: number; inProgress: number };
  quotes: { pending: number; quoted: number; converted: number; rejected: number; pendingValue: number; quotedValue: number };
  budgets: { draft: number; sent: number; accepted: number; sentValue: number };
  conversionRate: number;
}

interface KPIsData {
  revenue: { current: number; previous: number; change: number };
  orders: { current: number; previous: number; completed: number };
  avgTicket: number;
  stockOccupancy: number;
  totalProducts: number;
  eventsThisMonth: number;
}

interface BillingData {
  totalPending: number;
  invoicesPending: { count: number; total: number };
  invoicesOverdue: { count: number; total: number };
  installmentsPending: { count: number; total: number };
  next7Days: { id: string; invoiceNumber: string; total: number; dueDate: string }[];
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
}

// ============= HELPERS =============
const formatCurrency = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
const formatDateTime = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const PHASE_CONFIG = {
  montaje: { label: 'Montaje', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Truck },
  en_curso: { label: 'En curso', color: 'bg-green-100 text-green-800 border-green-200', icon: Activity },
  desmontaje: { label: 'Desmontaje', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Package },
  dia_completo: { label: 'Día completo', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Calendar },
};

const WORKLOAD_CONFIG = {
  libre: { label: 'Sin eventos', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  bajo: { label: 'Carga baja', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  medio: { label: 'Carga media', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  alto: { label: 'Carga alta', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente', IN_PROGRESS: 'En curso', COMPLETED: 'Completado', CANCELLED: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800', IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800',
};

// ============= COMPONENT =============
const SmartDashboard = () => {
  const [data, setData] = useState<SmartDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      const result: any = await analyticsService.getSmartDashboard();
      setData(result);
    } catch (error) {
      console.error('Error loading smart dashboard:', error);
      toast.error('Error al cargar el dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => loadData(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center text-gray-500">No se pudieron cargar los datos</div>;

  const wl = WORKLOAD_CONFIG[data.workload];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Centro de Control</h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${wl.color}`}>
            <span className={`w-2 h-2 rounded-full ${wl.dot}`}></span>
            {wl.label}
          </span>
          {data.alerts.totalAlerts > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-700">
              <Bell className="w-4 h-4" />
              {data.alerts.totalAlerts} alerta{data.alerts.totalAlerts > 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`w-5 h-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Ingresos del mes"
          value={formatCurrency(data.kpis.revenue.current)}
          change={data.kpis.revenue.change}
          subtitle={`Ant: ${formatCurrency(data.kpis.revenue.previous)}`}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <KPICard
          title="Pedidos del mes"
          value={String(data.kpis.orders.current)}
          change={data.kpis.orders.previous > 0 ? ((data.kpis.orders.current - data.kpis.orders.previous) / data.kpis.orders.previous) * 100 : 0}
          subtitle={`${data.kpis.orders.completed} completados`}
          icon={ShoppingCart}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <KPICard
          title="Ticket medio"
          value={formatCurrency(data.kpis.avgTicket)}
          subtitle={`${data.kpis.eventsThisMonth} eventos`}
          icon={BarChart3}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <KPICard
          title="Ocupación stock"
          value={`${data.kpis.stockOccupancy}%`}
          subtitle={`${data.kpis.totalProducts} productos activos`}
          icon={Package}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
        />
      </div>

      {/* Main Grid: Events + Alerts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* TODAY EVENTS - 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Eventos de hoy</h2>
                <p className="text-sm text-gray-500">{data.todayEvents.length} evento{data.todayEvents.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <Link to="/admin/calendar" className="text-sm text-resona hover:underline flex items-center gap-1">
              Ver calendario <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-5">
            {data.todayEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No hay eventos hoy</p>
                <p className="text-sm text-gray-400 mt-1">Los eventos aparecerán aquí automáticamente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.todayEvents.map(event => {
                  const phaseConf = PHASE_CONFIG[event.phase];
                  const PhaseIcon = phaseConf.icon;
                  return (
                    <Link
                      key={event.id}
                      to={`/admin/orders/${event.id}`}
                      className="block p-4 rounded-lg border border-gray-100 hover:border-resona/30 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">#{event.orderNumber}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${phaseConf.color}`}>
                              <PhaseIcon className="w-3 h-3" />
                              {phaseConf.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 font-medium">{event.customer}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                            {event.customerPhone && (
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {event.customerPhone}</span>
                            )}
                            {event.eventType && (
                              <span className="flex items-center gap-1"><CircleDot className="w-3 h-3" /> {event.eventType}</span>
                            )}
                            <span className="flex items-center gap-1"><Package className="w-3 h-3" /> {event.itemCount} items</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-gray-900">{formatCurrency(event.total)}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(event.startDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(event.endDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Week preview */}
            {data.weekEvents.length > data.todayEvents.length && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700 mb-2">Esta semana ({data.weekEvents.length} eventos)</p>
                <div className="flex flex-wrap gap-2">
                  {data.weekEvents
                    .filter(we => !data.todayEvents.some(te => te.id === we.id))
                    .slice(0, 5)
                    .map(event => (
                      <Link
                        key={event.id}
                        to={`/admin/orders/${event.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-medium text-gray-700">#{event.orderNumber}</span>
                        <span className="text-gray-500">{formatDate(event.startDate)}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-600">{event.customer}</span>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ALERTS - 1 col */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Alertas</h2>
                <p className="text-sm text-gray-500">{data.alerts.totalAlerts} activa{data.alerts.totalAlerts !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {data.alerts.totalAlerts === 0 ? (
              <div className="text-center py-6">
                <Activity className="w-10 h-10 text-green-300 mx-auto mb-2" />
                <p className="text-sm text-green-600 font-medium">Todo en orden</p>
              </div>
            ) : (
              <>
                {data.alerts.overdueReturns.map(item => (
                  <AlertItem
                    key={`return-${item.id}`}
                    type="danger"
                    icon={Package}
                    title={`Devolución atrasada #${item.orderNumber}`}
                    subtitle={`${item.customer} · ${item.daysOverdue} día${item.daysOverdue > 1 ? 's' : ''} de retraso`}
                    link={`/admin/orders/${item.id}`}
                  />
                ))}
                {data.alerts.unpaidOrders.map(item => (
                  <AlertItem
                    key={`unpaid-${item.id}`}
                    type="warning"
                    icon={DollarSign}
                    title={`Pago pendiente #${item.orderNumber}`}
                    subtitle={`${item.customer} · ${formatCurrency(item.total)} · ${item.daysOverdue}d`}
                    link={`/admin/orders/${item.id}`}
                  />
                ))}
                {data.alerts.unansweredQuotes.map(item => (
                  <AlertItem
                    key={`quote-${item.id}`}
                    type="info"
                    icon={Mail}
                    title={`Presupuesto sin responder`}
                    subtitle={`${item.customerName || item.customerEmail} · ${item.hoursWaiting}h esperando`}
                    link="/admin/quote-requests"
                  />
                ))}
                {data.alerts.lowStockProducts.map(item => (
                  <AlertItem
                    key={`stock-${item.id}`}
                    type="warning"
                    icon={AlertTriangle}
                    title={`Stock bajo: ${item.name}`}
                    subtitle={`Quedan ${item.stock} unidades · ${item.sku}`}
                    link="/admin/stock-alerts"
                  />
                ))}
                {data.alerts.brokenUnits > 0 && (
                  <AlertItem
                    type="danger"
                    icon={Wrench}
                    title={`${data.alerts.brokenUnits} equipos rotos/reparación`}
                    subtitle="Requieren atención"
                    link="/admin/inventory"
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline + Billing Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* PIPELINE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-50">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="font-semibold text-gray-900">Pipeline de ventas</h2>
            </div>
            <span className="text-sm text-gray-500">
              Conversión: <span className="font-semibold text-purple-600">{data.pipeline.conversionRate}%</span>
            </span>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {/* Leads */}
              <div className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium text-gray-600">Leads</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <PipelineBar value={data.pipeline.leads.new + data.pipeline.leads.inProgress} max={20} color="bg-gray-400" />
                    <span className="text-sm font-semibold text-gray-700 w-8 text-right">{data.pipeline.leads.new + data.pipeline.leads.inProgress}</span>
                  </div>
                </div>
              </div>
              {/* Quotes Pending */}
              <div className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium text-gray-600">Pendientes</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <PipelineBar value={data.pipeline.quotes.pending} max={20} color="bg-yellow-400" />
                    <span className="text-sm font-semibold text-gray-700 w-8 text-right">{data.pipeline.quotes.pending}</span>
                  </div>
                  {data.pipeline.quotes.pendingValue > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(data.pipeline.quotes.pendingValue)}</p>
                  )}
                </div>
              </div>
              {/* Quotes Quoted */}
              <div className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium text-gray-600">Cotizados</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <PipelineBar value={data.pipeline.quotes.quoted} max={20} color="bg-blue-400" />
                    <span className="text-sm font-semibold text-gray-700 w-8 text-right">{data.pipeline.quotes.quoted}</span>
                  </div>
                  {data.pipeline.quotes.quotedValue > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(data.pipeline.quotes.quotedValue)}</p>
                  )}
                </div>
              </div>
              {/* Budgets Sent */}
              <div className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium text-gray-600">Enviados</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <PipelineBar value={data.pipeline.budgets.sent} max={20} color="bg-indigo-400" />
                    <span className="text-sm font-semibold text-gray-700 w-8 text-right">{data.pipeline.budgets.sent}</span>
                  </div>
                  {data.pipeline.budgets.sentValue > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(data.pipeline.budgets.sentValue)}</p>
                  )}
                </div>
              </div>
              {/* Converted */}
              <div className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium text-gray-600">Convertidos</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <PipelineBar value={data.pipeline.quotes.converted} max={20} color="bg-green-500" />
                    <span className="text-sm font-semibold text-green-700 w-8 text-right">{data.pipeline.quotes.converted}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <Link to="/admin/quote-requests" className="flex-1 text-center px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">
                Ver presupuestos
              </Link>
              <Link to="/admin/quote-requests" className="flex-1 text-center px-3 py-2 text-sm bg-resona text-white rounded-lg hover:bg-resona/90 transition-colors">
                <Plus className="w-4 h-4 inline mr-1" />Nuevo
              </Link>
            </div>
          </div>
        </div>

        {/* BILLING */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="font-semibold text-gray-900">Facturación pendiente</h2>
            </div>
            <span className="text-lg font-bold text-gray-900">{formatCurrency(data.billing.totalPending)}</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-yellow-50">
                <p className="text-2xl font-bold text-yellow-700">{data.billing.invoicesPending.count}</p>
                <p className="text-xs text-yellow-600 mt-1">Pendientes</p>
                <p className="text-xs text-yellow-500">{formatCurrency(data.billing.invoicesPending.total)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50">
                <p className="text-2xl font-bold text-red-700">{data.billing.invoicesOverdue.count}</p>
                <p className="text-xs text-red-600 mt-1">Vencidas</p>
                <p className="text-xs text-red-500">{formatCurrency(data.billing.invoicesOverdue.total)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-blue-50">
                <p className="text-2xl font-bold text-blue-700">{data.billing.installmentsPending.count}</p>
                <p className="text-xs text-blue-600 mt-1">Plazos</p>
                <p className="text-xs text-blue-500">{formatCurrency(data.billing.installmentsPending.total)}</p>
              </div>
            </div>

            {data.billing.next7Days.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Próximos 7 días</p>
                <div className="space-y-2">
                  {data.billing.next7Days.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm">
                      <span className="font-medium text-gray-700">{inv.invoiceNumber}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{formatDate(inv.dueDate)}</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(inv.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <Link to="/admin/invoices" className="flex-1 text-center px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors">
                Ver facturas
              </Link>
              <Link to="/admin/invoices/manual" className="flex-1 text-center px-3 py-2 text-sm bg-resona text-white rounded-lg hover:bg-resona/90 transition-colors">
                <Plus className="w-4 h-4 inline mr-1" />Factura
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* RECENT ORDERS - 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="font-semibold text-gray-900">Últimos pedidos</h2>
            </div>
            <Link to="/admin/orders" className="text-sm text-resona hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentOrders.map(order => (
              <Link
                key={order.id}
                to={`/admin/orders/${order.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-medium text-gray-900 text-sm">#{order.orderNumber}</span>
                  <span className="text-sm text-gray-600 truncate">{order.customer}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                  <span className="font-semibold text-gray-900 text-sm">{formatCurrency(order.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100">
                <Zap className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="font-semibold text-gray-900">Acciones rápidas</h2>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <QuickAction to="/admin/quote-requests" icon={Plus} label="Nuevo presupuesto" color="bg-purple-50 text-purple-700 hover:bg-purple-100" />
            <QuickAction to="/admin/invoices/manual" icon={FileText} label="Crear factura manual" color="bg-green-50 text-green-700 hover:bg-green-100" />
            <QuickAction to="/admin/contabilidad" icon={DollarSign} label="Registrar gasto" color="bg-red-50 text-red-700 hover:bg-red-100" />
            <QuickAction to="/admin/products" icon={Package} label="Gestionar productos" color="bg-blue-50 text-blue-700 hover:bg-blue-100" />
            <QuickAction to="/admin/calendar" icon={Calendar} label="Ver calendario" color="bg-orange-50 text-orange-700 hover:bg-orange-100" />
            <QuickAction to="/admin/inventory" icon={Eye} label="Inventario / Escanear" color="bg-indigo-50 text-indigo-700 hover:bg-indigo-100" />
            <QuickAction to="/admin/statistics" icon={BarChart3} label="Estadísticas completas" color="bg-gray-50 text-gray-700 hover:bg-gray-100" />
            <QuickAction to="/admin/calculator" icon={Calculator} label="Configurar calculadora" color="bg-yellow-50 text-yellow-700 hover:bg-yellow-100" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============= SUB-COMPONENTS =============

const KPICard = ({ title, value, change, subtitle, icon: Icon, iconColor, iconBg }: {
  title: string; value: string; change?: number; subtitle: string;
  icon: any; iconColor: string; iconBg: string;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 truncate">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <div className="flex items-center gap-1 mt-1">
          {change !== undefined && change !== 0 && (
            <span className={`inline-flex items-center text-xs font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
              {change > 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
          )}
          <span className="text-xs text-gray-400">{subtitle}</span>
        </div>
      </div>
      <div className={`p-2.5 rounded-xl ${iconBg} flex-shrink-0`}>
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
      </div>
    </div>
  </div>
);

const AlertItem = ({ type, icon: Icon, title, subtitle, link }: {
  type: 'danger' | 'warning' | 'info'; icon: any; title: string; subtitle: string; link?: string;
}) => {
  const colors = {
    danger: 'border-l-red-500 bg-red-50/50',
    warning: 'border-l-yellow-500 bg-yellow-50/50',
    info: 'border-l-blue-500 bg-blue-50/50',
  };
  const iconColors = {
    danger: 'text-red-500',
    warning: 'text-yellow-600',
    info: 'text-blue-500',
  };

  const content = (
    <div className={`p-3 rounded-r-lg border-l-4 ${colors[type]} hover:shadow-sm transition-shadow`}>
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconColors[type]}`} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 leading-tight">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
};

const PipelineBar = ({ value, max, color }: { value: number; max: number; color: string }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const QuickAction = ({ to, icon: Icon, label, color }: { to: string; icon: any; label: string; color: string }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${color}`}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    <span className="text-sm font-medium">{label}</span>
    <ArrowRight className="w-4 h-4 ml-auto opacity-50" />
  </Link>
);

export default SmartDashboard;
