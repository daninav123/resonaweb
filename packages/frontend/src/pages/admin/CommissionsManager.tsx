import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Loader2, DollarSign, CheckCircle2, Clock, XCircle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface Commission {
  id: string;
  userId: string;
  quoteRequestId: string;
  quoteValue: number;
  commissionValue: number;
  commissionRate: number;
  status: string;
  paidAt?: string;
  paidBy?: string;
  paymentMethod?: string;
  paymentNotes?: string;
  createdAt: string;
  user?: { id: string; firstName: string; lastName: string; email: string };
  quoteRequest?: { id: string; customerName: string; eventType?: string; eventDate?: string; estimatedTotal?: number };
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  GENERATED: { label: 'Generada', color: 'bg-blue-100 text-blue-700', icon: DollarSign },
  PAID: { label: 'Pagada', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  LOST: { label: 'Perdida', color: 'bg-gray-100 text-gray-500', icon: XCircle },
  REJECTED: { label: 'Rechazada', color: 'bg-red-100 text-red-600', icon: XCircle },
};

const CommissionsManager = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payForm, setPayForm] = useState({ paymentMethod: 'transferencia', paymentNotes: '' });

  const load = async () => {
    try {
      setLoading(true);
      const res: any = await api.get(`/commissions?status=${filterStatus}`);
      setCommissions(Array.isArray(res) ? res : []);
    } catch { toast.error('Error cargando comisiones'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus]);

  const handlePay = async (id: string) => {
    try {
      await api.post(`/commissions/${id}/pay`, payForm);
      toast.success('Comisión marcada como pagada');
      setPayingId(null);
      load();
    } catch { toast.error('Error al pagar'); }
  };

  const totals = {
    pending: commissions.filter(c => c.status === 'GENERATED').reduce((s, c) => s + Number(c.commissionValue), 0),
    paid: commissions.filter(c => c.status === 'PAID').reduce((s, c) => s + Number(c.commissionValue), 0),
    total: commissions.reduce((s, c) => s + Number(c.commissionValue), 0),
  };

  const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Comisiones Comerciales</h1>
        <p className="text-gray-600">Gestiona las comisiones de los comerciales</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500">Pendientes de pago</p>
          <p className="text-2xl font-bold text-yellow-600">{fmt(totals.pending)}€</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500">Pagadas</p>
          <p className="text-2xl font-bold text-green-600">{fmt(totals.paid)}€</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500">Total comisiones</p>
          <p className="text-2xl font-bold">{fmt(totals.total)}€</p>
          <p className="text-xs text-gray-400">{commissions.length} registros</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-gray-400" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg">
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div> : commissions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay comisiones</div>
      ) : (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Comercial</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Presupuesto</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Valor</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Comisión</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {commissions.map(c => {
                const st = STATUS_MAP[c.status] || STATUS_MAP.PENDING;
                const Icon = st.icon;
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{c.user?.firstName} {c.user?.lastName}</p>
                      <p className="text-xs text-gray-400">{c.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{c.quoteRequest?.customerName || '-'}</p>
                      <p className="text-xs text-gray-400">{c.quoteRequest?.eventType}</p>
                    </td>
                    <td className="px-4 py-3 text-right">{fmt(Number(c.quoteValue))}€</td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(Number(c.commissionValue))}€ <span className="text-xs text-gray-400">({Number(c.commissionRate)}%)</span></td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${st.color}`}>
                        <Icon className="w-3 h-3" /> {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString('es-ES')}
                      {c.paidAt && <p className="text-green-600">Pagada: {new Date(c.paidAt).toLocaleDateString('es-ES')}</p>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.status === 'GENERATED' && (
                        <button onClick={() => setPayingId(c.id)} className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                          Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal pagar comisión */}
      {payingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4">
            <h2 className="text-lg font-bold">Registrar Pago de Comisión</h2>
            <div>
              <label className="text-xs text-gray-500">Método de pago</label>
              <select value={payForm.paymentMethod} onChange={e => setPayForm({ ...payForm, paymentMethod: e.target.value })} className="w-full px-3 py-2 border rounded">
                <option>transferencia</option>
                <option>efectivo</option>
                <option>nómina</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Notas</label>
              <textarea value={payForm.paymentNotes} onChange={e => setPayForm({ ...payForm, paymentNotes: e.target.value })} className="w-full px-3 py-2 border rounded" rows={2} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => handlePay(payingId)} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Confirmar Pago</button>
              <button onClick={() => setPayingId(null)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionsManager;
