import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@resona/api-client';
import {
  Clock, FileText, CheckCircle, Calendar, Package, Loader2, RefreshCw, AlertTriangle,
  ArrowRight, Mail, Phone, Eye, Trash2, Plus, XCircle, CreditCard, Receipt, Truck
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============= TYPES =============
type Tab = 'presupuestos' | 'pedidos' | 'eventos';

const STATUS_QUOTE: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  CONTACTED: { label: 'Contactado', color: 'bg-blue-100 text-blue-800' },
  QUOTED: { label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  CONVERTED: { label: 'Aceptado', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rechazado', color: 'bg-red-100 text-red-800' },
};

const STATUS_ORDER: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
  IN_PROGRESS: { label: 'En curso', color: 'bg-orange-100 text-orange-800' },
  COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

const PHASE_LABELS: Record<string, string> = {
  INQUIRY: 'Consulta', PLANNING: 'Planificación', PREPARATION: 'Preparación',
  SETUP: 'Montaje', LIVE: 'En vivo', TEARDOWN: 'Desmontaje',
  REVIEW: 'Revisión', CLOSED: 'Cerrado',
};

const PHASE_COLOR: Record<string, string> = {
  INQUIRY: 'bg-gray-100 text-gray-700', PLANNING: 'bg-blue-100 text-blue-700',
  PREPARATION: 'bg-indigo-100 text-indigo-700', SETUP: 'bg-orange-100 text-orange-700',
  LIVE: 'bg-red-100 text-red-700', TEARDOWN: 'bg-amber-100 text-amber-700',
  REVIEW: 'bg-purple-100 text-purple-700', CLOSED: 'bg-green-100 text-green-700',
};

// ============= COMPONENT =============
const PipelinePage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('presupuestos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [quotes, setQuotes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError('');
      const [qR, oR, eR, cR]: any[] = await Promise.all([
        api.get('/quote-requests?limit=200').catch(() => ({ data: [] })),
        api.get('/orders?limit=200').catch(() => ({ data: [] })),
        api.get('/events?limit=200').catch(() => ({ data: [] })),
        api.get('/contracts-mgmt?limit=200').catch(() => ({ data: [] })),
      ]);
      setQuotes(Array.isArray(qR?.data || qR) ? (qR?.data || qR) : []);
      setOrders(Array.isArray(oR?.data) ? oR.data : Array.isArray(oR?.orders) ? oR.orders : []);
      setEvents(Array.isArray(eR?.data) ? eR.data : []);
      setContracts(Array.isArray(cR?.data) ? cR.data : []);
    } catch (err: any) {
      setError(err.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // Stats
  const quotesPending = quotes.filter(q => q.status === 'PENDING' || q.status === 'CONTACTED').length;
  const quotesQuoted = quotes.filter(q => q.status === 'QUOTED').length;
  const quotesAccepted = quotes.filter(q => q.status === 'CONVERTED').length;
  const ordersActive = orders.filter(o => o.status !== 'CANCELLED' && o.status !== 'COMPLETED').length;
  const ordersCompleted = orders.filter(o => o.status === 'COMPLETED').length;
  const eventsLive = events.filter(e => e.phase !== 'CLOSED').length;
  const eventsClosed = events.filter(e => e.phase === 'CLOSED').length;

  const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' }) : '-';

  const getContractForOrder = (o: any) => contracts.find(c => c.orderId === o.id || c.budgetRef === o.orderNumber);
  const getEventForOrder = (o: any) => o.event || events.find((e: any) => e.orderId === o.id);

  // ============= RENDER =============
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Cargando pipeline...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline Comercial</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona todo el ciclo: presupuesto → pedido → evento → factura</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadAll} className="px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 text-sm flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
          <button onClick={() => navigate('/admin/quote-requests/new')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1.5 font-medium">
            <Plus className="w-4 h-4" /> Nuevo presupuesto
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Flow Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200 shrink-0">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">{quotesPending} pendientes</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
          <div className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200 shrink-0">
            <FileText className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">{quotesQuoted} enviados</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
          <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 rounded-lg border border-green-200 shrink-0">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">{quotesAccepted} aceptados</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
          <div className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 shrink-0">
            <Package className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">{ordersActive} pedidos activos</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
          <div className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200 shrink-0">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">{eventsLive} eventos activos</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
          <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200 shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-900">{ordersCompleted + eventsClosed} completados</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {([
            { key: 'presupuestos' as Tab, label: 'Presupuestos', count: quotes.length, icon: FileText },
            { key: 'pedidos' as Tab, label: 'Pedidos', count: orders.length, icon: Package },
            { key: 'eventos' as Tab, label: 'Eventos', count: events.length, icon: Calendar },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`pb-3 text-sm font-medium flex items-center gap-2 border-b-2 transition ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              <span className={`text-xs rounded-full px-2 py-0.5 ${tab === t.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {tab === 'presupuestos' && (
        <div className="space-y-3">
          {quotes.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Sin presupuestos</p>
              <p className="text-sm mt-1">Crea uno nuevo o espera solicitudes de clientes</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Importe</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {quotes.map((q: any) => {
                    const st = STATUS_QUOTE[q.status] || { label: q.status, color: 'bg-gray-100 text-gray-700' };
                    return (
                      <tr key={q.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 text-sm">{q.customerName || 'Sin nombre'}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">{q.customerEmail && <><Mail className="w-3 h-3" />{q.customerEmail}</>}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">{q.eventType || '-'}</p>
                          <p className="text-xs text-gray-400">{q.attendees} pers. · {q.duration} {q.durationType === 'hours' ? 'h' : 'd'}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{q.eventDate ? fmtDate(q.eventDate) : fmtDate(q.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-sm text-gray-900">{q.estimatedTotal ? `${fmt(Number(q.estimatedTotal))}€` : '-'}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link to="/admin/quote-requests" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Gestionar
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'pedidos' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Sin pedidos</p>
              <p className="text-sm mt-1">Los pedidos se crean al aceptar un presupuesto</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha evento</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Vínculos</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o: any) => {
                    const st = STATUS_ORDER[o.status] || { label: o.status, color: 'bg-gray-100 text-gray-700' };
                    const ev = getEventForOrder(o);
                    const ct = getContractForOrder(o);
                    return (
                      <tr key={o.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <Link to={`/admin/orders/${o.id}`} className="font-mono text-sm font-medium text-blue-600 hover:underline">{o.orderNumber}</Link>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{o.contactPerson || `${o.user?.firstName || ''} ${o.user?.lastName || ''}`.trim() || 'Cliente'}</p>
                          <p className="text-xs text-gray-400">{o.user?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{fmtDate(o.startDate)}</td>
                        <td className="px-4 py-3 text-right font-bold text-sm text-gray-900">{fmt(Number(o.total || 0))}€</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {ev && (
                              <Link to={`/admin/events/${ev.id}`} title={`Evento: ${ev.eventNumber || ''}`} className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
                                <Calendar className="w-3.5 h-3.5" />
                              </Link>
                            )}
                            {ct && (
                              <span title={`Contrato: ${ct.contractNumber}`} className="p-1 rounded bg-purple-50 text-purple-600">
                                <FileText className="w-3.5 h-3.5" />
                              </span>
                            )}
                            {o.invoice && (
                              <span title="Factura generada" className="p-1 rounded bg-blue-50 text-blue-600">
                                <Receipt className="w-3.5 h-3.5" />
                              </span>
                            )}
                            {!ev && !ct && !o.invoice && <span className="text-xs text-gray-400">—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link to={`/admin/orders/${o.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Ver detalle
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'eventos' && (
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Sin eventos</p>
              <p className="text-sm mt-1">Los eventos se crean automáticamente al convertir un presupuesto</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lugar</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Fase</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {events.map((e: any) => {
                    const phColor = PHASE_COLOR[e.phase] || 'bg-gray-100 text-gray-700';
                    return (
                      <tr key={e.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <Link to={`/admin/events/${e.id}`} className="font-mono text-sm font-medium text-blue-600 hover:underline">{e.eventNumber}</Link>
                          <p className="text-xs text-gray-500 truncate max-w-[180px]">{e.name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{e.clientName}</p>
                          <p className="text-xs text-gray-400">{e.clientEmail}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{fmtDate(e.eventDate)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[150px]">{e.venueName || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${phColor}`}>
                            {PHASE_LABELS[e.phase] || e.phase}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link to={`/admin/events/${e.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Gestionar
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PipelinePage;
