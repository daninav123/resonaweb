import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Edit, Trash2, Search, Loader2, Wrench, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface MaintenanceRecord {
  id: string;
  productName: string;
  productId?: string;
  unitId?: string;
  type: string;
  description?: string;
  severity: string;
  supplierName?: string;
  cost?: number;
  invoiceRef?: string;
  status: string;
  scheduledDate?: string;
  completedDate?: string;
  eventId?: string;
  notes?: string;
  createdAt: string;
}

const TYPES = ['reparación', 'calibración', 'limpieza', 'revisión'];
const SEVERITIES = ['baja', 'normal', 'alta', 'urgente'];
const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];
const STATUS_LABELS: Record<string, string> = { pending: 'Pendiente', in_progress: 'En curso', completed: 'Completado', cancelled: 'Cancelado' };
const STATUS_COLORS: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700', in_progress: 'bg-blue-100 text-blue-700', completed: 'bg-green-100 text-green-700', cancelled: 'bg-gray-100 text-gray-500' };
const SEVERITY_COLORS: Record<string, string> = { baja: 'text-gray-500', normal: 'text-blue-600', alta: 'text-orange-600', urgente: 'text-red-600' };

const MaintenanceManager = () => {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [form, setForm] = useState({
    productName: '', type: 'revisión', description: '', severity: 'normal',
    supplierName: '', cost: 0, invoiceRef: '', status: 'pending',
    scheduledDate: '', notes: '',
  });

  const load = async () => {
    try {
      setLoading(true);
      const [res, statsRes]: any[] = await Promise.all([
        api.get(`/maintenance?search=${search}&status=${filterStatus}`),
        api.get('/maintenance/stats'),
      ]);
      setRecords(res?.data || []);
      setStats(statsRes);
    } catch { toast.error('Error cargando mantenimientos'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search, filterStatus]);

  const handleSave = async () => {
    if (!form.productName) { toast.error('Nombre de equipo obligatorio'); return; }
    try {
      const data = { ...form, cost: form.cost || null, scheduledDate: form.scheduledDate || null };
      if (editingId) { await api.patch(`/maintenance/${editingId}`, data); toast.success('Actualizado'); }
      else { await api.post('/maintenance', data); toast.success('Registro creado'); }
      setShowForm(false); setEditingId(null); load();
    } catch { toast.error('Error al guardar'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar registro?')) return;
    try { await api.delete(`/maintenance/${id}`); toast.success('Eliminado'); load(); } catch { toast.error('Error'); }
  };

  const handleEdit = (r: MaintenanceRecord) => {
    setEditingId(r.id);
    setForm({
      productName: r.productName, type: r.type, description: r.description || '',
      severity: r.severity, supplierName: r.supplierName || '', cost: Number(r.cost || 0),
      invoiceRef: r.invoiceRef || '', status: r.status,
      scheduledDate: r.scheduledDate ? new Date(r.scheduledDate).toISOString().split('T')[0] : '',
      notes: r.notes || '',
    });
    setShowForm(true);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const data: any = { status };
      if (status === 'completed') data.completedDate = new Date().toISOString();
      await api.patch(`/maintenance/${id}`, data);
      toast.success('Estado actualizado');
      load();
    } catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mantenimiento de Equipos</h1>
          <p className="text-gray-600">Reparaciones, calibraciones y revisiones</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ productName: '', type: 'revisión', description: '', severity: 'normal', supplierName: '', cost: 0, invoiceRef: '', status: 'pending', scheduledDate: '', notes: '' }); setShowForm(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Registro
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
          <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4"><p className="text-xs text-yellow-600">Pendientes</p><p className="text-2xl font-bold text-yellow-700">{stats.pending}</p></div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4"><p className="text-xs text-blue-600">En curso</p><p className="text-2xl font-bold text-blue-700">{stats.inProgress}</p></div>
          <div className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">Por tipo</p><div className="text-xs mt-1">{Object.entries(stats.byType || {}).map(([k, v]) => <span key={k} className="mr-2">{k}: {v as number}</span>)}</div></div>
        </div>
      )}

      <div className="flex gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar equipo..." className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg">
          <option value="">Todos</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div> : records.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Sin registros de mantenimiento</div>
      ) : (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Equipo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Severidad</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Coste</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
            </tr></thead>
            <tbody className="divide-y">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.productName}</p>
                    {r.supplierName && <p className="text-xs text-gray-400">{r.supplierName}</p>}
                  </td>
                  <td className="px-4 py-3 capitalize">{r.type}</td>
                  <td className="px-4 py-3"><span className={`font-medium capitalize ${SEVERITY_COLORS[r.severity] || ''}`}>{r.severity}</span></td>
                  <td className="px-4 py-3">
                    <select value={r.status} onChange={e => handleStatusChange(r.id, e.target.value)} className={`text-xs px-2 py-1 rounded-full border-0 ${STATUS_COLORS[r.status] || ''}`}>
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">{r.cost ? `${Number(r.cost).toLocaleString('es-ES')}€` : '-'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString('es-ES') : new Date(r.createdAt).toLocaleDateString('es-ES')}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEdit(r)} className="p-1 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(r.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-lg font-bold">{editingId ? 'Editar' : 'Nuevo'} Mantenimiento</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Equipo*</label><input value={form.productName} onChange={e => setForm({...form, productName: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Tipo</label><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full px-3 py-2 border rounded">{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label className="text-xs text-gray-500">Severidad</label><select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})} className="w-full px-3 py-2 border rounded">{SEVERITIES.map(s => <option key={s}>{s}</option>)}</select></div>
              <div><label className="text-xs text-gray-500">Estado</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 border rounded">{STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</select></div>
              <div><label className="text-xs text-gray-500">Proveedor/Taller</label><input value={form.supplierName} onChange={e => setForm({...form, supplierName: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Coste (€)</label><input type="number" value={form.cost} onChange={e => setForm({...form, cost: Number(e.target.value)})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Fecha programada</label><input type="date" value={form.scheduledDate} onChange={e => setForm({...form, scheduledDate: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Ref. Factura</label><input value={form.invoiceRef} onChange={e => setForm({...form, invoiceRef: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div className="md:col-span-2"><label className="text-xs text-gray-500">Descripción</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded" rows={2} /></div>
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

export default MaintenanceManager;
