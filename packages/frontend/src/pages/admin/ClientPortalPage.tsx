import { useState } from 'react';
import { api } from '../../services/api';
import { Search, Loader2, User, FileText, ShoppingCart, Calendar, Receipt, FileSignature } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700', APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600', COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-gray-100 text-gray-500', PAID: 'bg-green-100 text-green-700',
  DRAFT: 'bg-gray-100 text-gray-600', draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700', signed: 'bg-green-100 text-green-700',
  active: 'bg-emerald-100 text-emerald-700', completed: 'bg-blue-100 text-blue-700',
  INQUIRY: 'bg-purple-100 text-purple-700', CONFIRMED: 'bg-green-100 text-green-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
};

const ClientPortalPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState('quotes');

  const search = async () => {
    if (!email) return;
    try {
      setLoading(true);
      const res = await api.get(`/client-portal/admin/${encodeURIComponent(email)}`);
      setData(res);
      setTab('quotes');
    } catch { toast.error('Error buscando datos del cliente'); } finally { setLoading(false); }
  };

  const fmt = (n: number) => Number(n || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 });
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('es-ES') : '-';
  const Badge = ({ status }: { status: string }) => (
    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
  );

  const tabs = [
    { key: 'quotes', label: 'Presupuestos', icon: FileText, count: data?.quotes?.length },
    { key: 'orders', label: 'Pedidos', icon: ShoppingCart, count: data?.orders?.length },
    { key: 'invoices', label: 'Facturas', icon: Receipt, count: data?.invoices?.length },
    { key: 'events', label: 'Eventos', icon: Calendar, count: data?.events?.length },
    { key: 'contracts', label: 'Contratos', icon: FileSignature, count: data?.contracts?.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Portal del Cliente</h1>
        <p className="text-gray-600">Consulta toda la información asociada a un cliente</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Introduce el email del cliente..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
        </div>
        <button onClick={search} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Buscar
        </button>
      </div>

      {data && (
        <>
          <div className="bg-white rounded-lg border p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><User className="w-6 h-6 text-blue-600" /></div>
            <div>
              <p className="font-bold text-lg">{data.customer?.firstName} {data.customer?.lastName}</p>
              <p className="text-gray-500">{data.customer?.email}</p>
              {data.customer?.phone && <p className="text-sm text-gray-400">{data.customer.phone}</p>}
            </div>
          </div>

          <div className="flex gap-2 border-b overflow-x-auto">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2 font-medium border-b-2 whitespace-nowrap flex items-center gap-1.5 ${tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                <t.icon className="w-4 h-4" /> {t.label} {t.count > 0 && <span className="text-xs bg-gray-100 px-1.5 rounded">{t.count}</span>}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow border overflow-hidden">
            {tab === 'quotes' && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b"><tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha evento</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total est.</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Creado</th>
                </tr></thead>
                <tbody className="divide-y">
                  {(data.quotes || []).length === 0 ? <tr><td colSpan={5} className="text-center py-6 text-gray-400">Sin presupuestos</td></tr> :
                    data.quotes.map((q: any) => (
                      <tr key={q.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{q.eventType || '-'}</td>
                        <td className="px-4 py-2">{fmtDate(q.eventDate)}</td>
                        <td className="px-4 py-2 text-right">{fmt(q.estimatedTotal)}€</td>
                        <td className="px-4 py-2 text-center"><Badge status={q.status} /></td>
                        <td className="px-4 py-2 text-xs text-gray-500">{fmtDate(q.createdAt)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {tab === 'orders' && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b"><tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nº Pedido</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fechas</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                </tr></thead>
                <tbody className="divide-y">
                  {(data.orders || []).length === 0 ? <tr><td colSpan={4} className="text-center py-6 text-gray-400">Sin pedidos</td></tr> :
                    data.orders.map((o: any) => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono">{o.orderNumber}</td>
                        <td className="px-4 py-2 text-xs">{fmtDate(o.startDate)} → {fmtDate(o.endDate)}</td>
                        <td className="px-4 py-2 text-right font-medium">{fmt(o.total)}€</td>
                        <td className="px-4 py-2 text-center"><Badge status={o.status} /></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {tab === 'invoices' && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b"><tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nº Factura</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Vencimiento</th>
                </tr></thead>
                <tbody className="divide-y">
                  {(data.invoices || []).length === 0 ? <tr><td colSpan={4} className="text-center py-6 text-gray-400">Sin facturas</td></tr> :
                    data.invoices.map((i: any) => (
                      <tr key={i.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono">{i.invoiceNumber}</td>
                        <td className="px-4 py-2 text-right font-medium">{fmt(i.total)}€</td>
                        <td className="px-4 py-2 text-center"><Badge status={i.status} /></td>
                        <td className="px-4 py-2 text-xs text-gray-500">{fmtDate(i.dueDate)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {tab === 'events' && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b"><tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Evento</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Lugar</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Fase</th>
                </tr></thead>
                <tbody className="divide-y">
                  {(data.events || []).length === 0 ? <tr><td colSpan={5} className="text-center py-6 text-gray-400">Sin eventos</td></tr> :
                    data.events.map((e: any) => (
                      <tr key={e.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{e.name}</td>
                        <td className="px-4 py-2">{e.eventType}</td>
                        <td className="px-4 py-2">{fmtDate(e.eventDate)}</td>
                        <td className="px-4 py-2 text-gray-500">{e.venueName || '-'}</td>
                        <td className="px-4 py-2 text-center"><Badge status={e.phase} /></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}

            {tab === 'contracts' && (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b"><tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Título</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Importe</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Firmado</th>
                </tr></thead>
                <tbody className="divide-y">
                  {(data.contracts || []).length === 0 ? <tr><td colSpan={4} className="text-center py-6 text-gray-400">Sin contratos</td></tr> :
                    data.contracts.map((c: any) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{c.title}</td>
                        <td className="px-4 py-2 text-right">{c.totalAmount ? `${fmt(c.totalAmount)}€` : '-'}</td>
                        <td className="px-4 py-2 text-center"><Badge status={c.status} /></td>
                        <td className="px-4 py-2 text-xs text-gray-500">{c.signedAt ? fmtDate(c.signedAt) : 'No firmado'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ClientPortalPage;
