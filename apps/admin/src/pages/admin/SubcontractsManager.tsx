import { useState, useEffect } from 'react';
import { api } from '@resona/api-client';
import { Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Subcontract {
  id: string; supplierName: string; description: string; category?: string;
  agreedAmount: number; paidAmount: number; invoiceRef?: string; status: string;
  startDate?: string; endDate?: string; notes?: string; eventId?: string; createdAt: string;
}
interface EventOption { id: string; name: string; eventNumber: string; }

const STATUSES = ['draft', 'confirmed', 'in_progress', 'completed', 'cancelled'];
const STATUS_LABELS: Record<string, string> = { draft: 'Borrador', confirmed: 'Confirmada', in_progress: 'En curso', completed: 'Completada', cancelled: 'Cancelada' };
const STATUS_COLORS: Record<string, string> = { draft: 'bg-gray-100 text-gray-600', confirmed: 'bg-blue-100 text-blue-700', in_progress: 'bg-yellow-100 text-yellow-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-500' };
const CATEGORIES = ['sonido', 'iluminación', 'transporte', 'personal', 'catering', 'seguridad', 'decoración', 'otro'];

const SubcontractsManager = () => {
  const [items, setItems] = useState<Subcontract[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ supplierName: '', description: '', category: '', agreedAmount: 0, paidAmount: 0, invoiceRef: '', status: 'draft', startDate: '', endDate: '', notes: '', eventId: '' });
  const [events, setEvents] = useState<EventOption[]>([]);
  const [filterEvent, setFilterEvent] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const [res, statsRes]: any[] = await Promise.all([
        api.get(`/subcontracts?search=${search}&status=${filterStatus}`),
        api.get('/subcontracts/stats'),
      ]);
      setItems(res?.data || []);
      setStats(statsRes);
    } catch { toast.error('Error cargando subcontrataciones'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, filterStatus]);
  useEffect(() => {
    api.get('/events?limit=100').then((res: any) => {
      const data = res?.data || res?.events || (Array.isArray(res) ? res : []);
      setEvents(data);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!form.supplierName || !form.description) { toast.error('Proveedor y descripción obligatorios'); return; }
    try {
      if (editingId) { await api.patch(`/subcontracts/${editingId}`, form); toast.success('Actualizada'); }
      else { await api.post('/subcontracts', form); toast.success('Creada'); }
      setShowForm(false); setEditingId(null); load();
    } catch { toast.error('Error al guardar'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar subcontratación?')) return;
    try { await api.delete(`/subcontracts/${id}`); toast.success('Eliminada'); load(); } catch { toast.error('Error'); }
  };

  const handleEdit = (s: Subcontract) => {
    setEditingId(s.id);
    setForm({
      supplierName: s.supplierName, description: s.description, category: s.category || '',
      agreedAmount: Number(s.agreedAmount), paidAmount: Number(s.paidAmount),
      invoiceRef: s.invoiceRef || '', status: s.status,
      startDate: s.startDate ? new Date(s.startDate).toISOString().split('T')[0] : '',
      endDate: s.endDate ? new Date(s.endDate).toISOString().split('T')[0] : '',
      notes: s.notes || '', eventId: s.eventId || '',
    });
    setShowForm(true);
  };

  const fmt = (n: number) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subcontrataciones</h1>
          <p className="text-gray-600">Servicios externalizados para eventos</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ supplierName: '', description: '', category: '', agreedAmount: 0, paidAmount: 0, invoiceRef: '', status: 'draft', startDate: '', endDate: '', notes: '', eventId: '' }); setShowForm(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva Subcontratación
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
          <div className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">Importe acordado</p><p className="text-2xl font-bold text-blue-600">{fmt(stats.totalAgreed)}€</p></div>
          <div className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">Pagado</p><p className="text-2xl font-bold text-green-600">{fmt(stats.totalPaid)}€</p></div>
          <div className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">Pendiente</p><p className="text-2xl font-bold text-orange-600">{fmt(stats.totalAgreed - stats.totalPaid)}€</p></div>
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg">
          <option value="">Todos los estados</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select value={filterEvent} onChange={e => setFilterEvent(e.target.value)} className="px-3 py-2 border rounded-lg">
          <option value="">Todos los eventos</option>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.eventNumber} - {ev.name}</option>)}
        </select>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div> : (filterEvent ? items.filter(i => i.eventId === filterEvent) : items).length === 0 ? (
        <div className="text-center py-12 text-gray-500">Sin subcontrataciones</div>
      ) : (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Proveedor</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Categoría</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Acordado</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Pagado</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Fechas</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
            </tr></thead>
            <tbody className="divide-y">
              {(filterEvent ? items.filter(i => i.eventId === filterEvent) : items).map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{s.supplierName}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{s.description}</p>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-600">{s.category || '-'}</td>
                  <td className="px-4 py-3 text-right font-medium">{fmt(Number(s.agreedAmount))}€</td>
                  <td className="px-4 py-3 text-right">
                    <span className={Number(s.paidAmount) >= Number(s.agreedAmount) ? 'text-green-600' : 'text-orange-600'}>{fmt(Number(s.paidAmount))}€</span>
                  </td>
                  <td className="px-4 py-3 text-center"><span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[s.status] || ''}`}>{STATUS_LABELS[s.status]}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {s.startDate ? new Date(s.startDate).toLocaleDateString('es-ES') : '-'}
                    {s.endDate ? ` → ${new Date(s.endDate).toLocaleDateString('es-ES')}` : ''}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(s)} className="p-1 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold">{editingId ? 'Editar' : 'Nueva'} Subcontratación</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Proveedor*</label><input value={form.supplierName} onChange={e => setForm({...form, supplierName: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Categoría</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border rounded"><option value="">-</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label className="text-xs text-gray-500">Importe acordado (€)*</label><input type="number" value={form.agreedAmount} onChange={e => setForm({...form, agreedAmount: Number(e.target.value)})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Importe pagado (€)</label><input type="number" value={form.paidAmount} onChange={e => setForm({...form, paidAmount: Number(e.target.value)})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Estado</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 border rounded">{STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</select></div>
              <div><label className="text-xs text-gray-500">Ref. Factura</label><input value={form.invoiceRef} onChange={e => setForm({...form, invoiceRef: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Fecha inicio</label><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Fecha fin</label><input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div className="md:col-span-2"><label className="text-xs text-gray-500">Descripción*</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded" rows={2} /></div>
              <div className="md:col-span-2">
                <label className="text-xs text-gray-500">Evento vinculado</label>
                <select value={form.eventId} onChange={e => setForm({...form, eventId: e.target.value})} className="w-full px-3 py-2 border rounded">
                  <option value="">Sin vincular</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.eventNumber} - {ev.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2"><label className="text-xs text-gray-500">Notas</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full px-3 py-2 border rounded" rows={2} /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Guardar</button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubcontractsManager;
