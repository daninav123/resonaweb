import { useState, useEffect } from 'react';
import { DollarSign, Plus, Loader2, Edit, Trash2, CheckCircle2, AlertTriangle, RefreshCw, Calendar } from 'lucide-react';
import { recurringExpenseFrontendService } from '../../services/adminModules.service';
import toast from 'react-hot-toast';

const formatCurrency = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`;
const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

const FREQ_LABELS: Record<string, string> = { monthly: 'Mensual', quarterly: 'Trimestral', yearly: 'Anual' };
const CAT_LABELS: Record<string, string> = { alquiler: 'Alquiler', seguros: 'Seguros', leasing: 'Leasing', servicios: 'Servicios', otros: 'Otros' };

const RecurringExpensesManager = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', amount: '', frequency: 'monthly', category: 'servicios', dueDay: '1', nextDueDate: '' });

  const loadData = async () => { try { setLoading(true); const [r, s]: any[] = await Promise.all([recurringExpenseFrontendService.list(), recurringExpenseFrontendService.getStats()]); setExpenses(r.data || []); setStats(s); } catch { toast.error('Error'); } finally { setLoading(false); } };
  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.amount) return toast.error('Nombre e importe obligatorios');
    try { await recurringExpenseFrontendService.create({ ...form, amount: form.amount, dueDay: parseInt(form.dueDay) || 1, nextDueDate: form.nextDueDate || undefined }); toast.success('Gasto creado'); setShowCreate(false); loadData(); } catch { toast.error('Error'); }
  };
  const handleUpdate = async (id: string) => { try { await recurringExpenseFrontendService.update(id, { ...form, amount: form.amount, dueDay: parseInt(form.dueDay) || 1 }); toast.success('Actualizado'); setEditingId(null); loadData(); } catch { toast.error('Error'); } };
  const handleDelete = async (id: string) => { if (!confirm('¿Eliminar?')) return; try { await recurringExpenseFrontendService.delete(id); toast.success('Eliminado'); loadData(); } catch { toast.error('Error'); } };
  const handleMarkPaid = async (id: string) => { try { await recurringExpenseFrontendService.markPaid(id); toast.success('Marcado como pagado'); loadData(); } catch { toast.error('Error'); } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Gastos Recurrentes</h1><p className="text-gray-500 mt-1">Control de gastos fijos</p></div>
        <div className="flex gap-2"><button onClick={loadData} className="p-2 rounded-lg border hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button><button onClick={() => { setShowCreate(true); setForm({ name: '', description: '', amount: '', frequency: 'monthly', category: 'servicios', dueDay: '1', nextDueDate: '' }); }} className="px-4 py-2 bg-resona text-white rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Nuevo</button></div>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Activos</p><p className="text-2xl font-bold text-blue-600">{stats.active}</p></div>
          <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Coste mensual</p><p className="text-2xl font-bold text-green-600">{formatCurrency(stats.monthlyTotal)}</p></div>
          <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Vencidos</p><p className="text-2xl font-bold text-red-600">{stats.overdue}</p></div>
        </div>
      )}

      {(showCreate || editingId) && (
        <div className="bg-white rounded-xl border p-5 space-y-3">
          <h3 className="font-semibold">{editingId ? 'Editar' : 'Nuevo'} gasto</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nombre *" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="Importe (€) *" className="px-3 py-2 border rounded-lg text-sm" />
            <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm bg-white"><option value="monthly">Mensual</option><option value="quarterly">Trimestral</option><option value="yearly">Anual</option></select>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm bg-white">{Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <input type="number" value={form.dueDay} onChange={e => setForm(p => ({ ...p, dueDay: e.target.value }))} placeholder="Día vencimiento" min={1} max={31} className="px-3 py-2 border rounded-lg text-sm" />
            <input type="date" value={form.nextDueDate} onChange={e => setForm(p => ({ ...p, nextDueDate: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descripción" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <div className="flex gap-2"><button onClick={editingId ? () => handleUpdate(editingId) : handleCreate} className="px-4 py-2 bg-resona text-white rounded-lg text-sm">Guardar</button><button onClick={() => { setShowCreate(false); setEditingId(null); }} className="px-4 py-2 text-gray-500 text-sm">Cancelar</button></div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-resona" /></div> : expenses.length === 0 ? <div className="bg-white rounded-xl border p-12 text-center"><DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No hay gastos recurrentes</p></div> : (
        <div className="space-y-2">
          {expenses.map(e => {
            const overdue = e.nextDueDate && new Date(e.nextDueDate) < new Date();
            return (
              <div key={e.id} className={`bg-white rounded-xl border p-4 ${overdue ? 'border-red-200 bg-red-50/30' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2"><h3 className="font-semibold text-gray-900">{e.name}</h3>{overdue && <AlertTriangle className="w-4 h-4 text-red-500" />}<span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{CAT_LABELS[e.category] || e.category}</span><span className="text-xs text-gray-400">{FREQ_LABELS[e.frequency]}</span></div>
                    <div className="text-xs text-gray-500 mt-0.5">{e.description}{e.nextDueDate && <span> · Próximo: {formatDate(e.nextDueDate)}</span>}{e.lastPaidAt && <span> · Último pago: {formatDate(e.lastPaidAt)}</span>}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{formatCurrency(Number(e.amount))}</span>
                    <button onClick={() => handleMarkPaid(e.id)} className="p-1.5 rounded hover:bg-green-50"><CheckCircle2 className="w-5 h-5 text-green-600" /></button>
                    <button onClick={() => { setEditingId(e.id); setForm({ name: e.name, description: e.description || '', amount: String(e.amount), frequency: e.frequency, category: e.category, dueDay: String(e.dueDay), nextDueDate: e.nextDueDate ? e.nextDueDate.slice(0, 10) : '' }); }} className="p-1.5 rounded hover:bg-gray-100"><Edit className="w-4 h-4 text-gray-400" /></button>
                    <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecurringExpensesManager;
