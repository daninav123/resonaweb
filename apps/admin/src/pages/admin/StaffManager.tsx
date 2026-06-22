import { useState, useEffect } from 'react';
import { Users, Plus, Search, Loader2, Phone, Mail, Clock, DollarSign, Edit, Trash2, Save, X, FileText, AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { staffFrontendService } from '../../services/staff.service';
import toast from 'react-hot-toast';

const formatCurrency = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`;

const TYPE_LABELS: Record<string, string> = { empleado: 'Empleado', freelancer: 'Freelancer', eventual: 'Eventual' };
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Activo', color: 'bg-green-100 text-green-700' },
  inactive: { label: 'Inactivo', color: 'bg-gray-100 text-gray-500' },
  vacation: { label: 'Vacaciones', color: 'bg-blue-100 text-blue-700' },
  sick_leave: { label: 'Baja', color: 'bg-red-100 text-red-700' },
};

const StaffManager = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', dni: '', type: 'freelancer', specialty: '', hourlyRate: '15', dailyRate: '120', status: 'active', hasContract: false, hasInsurance: false, hasPRL: false, notes: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [result, s]: any[] = await Promise.all([staffFrontendService.list({ search: search || undefined, type: typeFilter || undefined, status: statusFilter || undefined }), staffFrontendService.getStats()]);
      setStaff(result.data || []);
      setStats(s);
    } catch { toast.error('Error al cargar personal'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { const t = setTimeout(() => loadData(), 300); return () => clearTimeout(t); }, [search, typeFilter, statusFilter]);

  const resetForm = () => setForm({ name: '', email: '', phone: '', dni: '', type: 'freelancer', specialty: '', hourlyRate: '15', dailyRate: '120', status: 'active', hasContract: false, hasInsurance: false, hasPRL: false, notes: '' });

  const handleCreate = async () => {
    if (!form.name) return toast.error('Nombre obligatorio');
    try {
      await staffFrontendService.create({ ...form, hourlyRate: parseFloat(form.hourlyRate), dailyRate: parseFloat(form.dailyRate) });
      toast.success('Personal creado');
      setShowCreate(false); resetForm(); loadData();
    } catch { toast.error('Error'); }
  };

  const handleUpdate = async (id: string) => {
    try {
      await staffFrontendService.update(id, { ...form, hourlyRate: parseFloat(form.hourlyRate), dailyRate: parseFloat(form.dailyRate) });
      toast.success('Actualizado'); setEditingId(null); loadData();
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este trabajador?')) return;
    try { await staffFrontendService.delete(id); toast.success('Eliminado'); loadData(); } catch { toast.error('Error'); }
  };

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setForm({ name: s.name, email: s.email || '', phone: s.phone || '', dni: s.dni || '', type: s.type, specialty: s.specialty || '', hourlyRate: String(s.hourlyRate), dailyRate: String(s.dailyRate), status: s.status, hasContract: s.hasContract, hasInsurance: s.hasInsurance, hasPRL: s.hasPRL, notes: s.notes || '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Personal / RRHH</h1><p className="text-gray-500 mt-1">{stats?.total || 0} trabajadores</p></div>
        <div className="flex gap-2">
          <button onClick={loadData} className="p-2 rounded-lg border hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={() => { setShowCreate(true); resetForm(); }} className="px-4 py-2 bg-resona text-white rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Nuevo</button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Total</p><p className="text-2xl font-bold text-blue-600">{stats.total}</p></div>
          <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Empleados</p><p className="text-2xl font-bold text-green-600">{stats.byType?.empleado || 0}</p></div>
          <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Freelancers</p><p className="text-2xl font-bold text-purple-600">{stats.byType?.freelancer || 0}</p></div>
          <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Pagos pend.</p><p className="text-2xl font-bold text-red-600">{formatCurrency(stats.unpaid?.total || 0)}</p></div>
        </div>
      )}

      <div className="bg-white rounded-xl border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" /></div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white"><option value="">Todos los tipos</option><option value="empleado">Empleado</option><option value="freelancer">Freelancer</option><option value="eventual">Eventual</option></select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white"><option value="">Todos</option><option value="active">Activo</option><option value="inactive">Inactivo</option><option value="vacation">Vacaciones</option><option value="sick_leave">Baja</option></select>
        </div>
      </div>

      {(showCreate || editingId) && (
        <div className="bg-white rounded-xl border p-5 space-y-3">
          <h3 className="font-semibold text-gray-900">{editingId ? 'Editar' : 'Nuevo'} trabajador</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Nombre *" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Teléfono" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={form.dni} onChange={e => setForm(p => ({ ...p, dni: e.target.value }))} placeholder="DNI/NIE" className="px-3 py-2 border rounded-lg text-sm" />
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm bg-white"><option value="empleado">Empleado</option><option value="freelancer">Freelancer</option><option value="eventual">Eventual</option></select>
            <input type="text" value={form.specialty} onChange={e => setForm(p => ({ ...p, specialty: e.target.value }))} placeholder="Especialidad" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" value={form.hourlyRate} onChange={e => setForm(p => ({ ...p, hourlyRate: e.target.value }))} placeholder="€/hora" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" value={form.dailyRate} onChange={e => setForm(p => ({ ...p, dailyRate: e.target.value }))} placeholder="€/día" className="px-3 py-2 border rounded-lg text-sm" />
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm bg-white"><option value="active">Activo</option><option value="inactive">Inactivo</option><option value="vacation">Vacaciones</option><option value="sick_leave">Baja</option></select>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.hasContract} onChange={e => setForm(p => ({ ...p, hasContract: e.target.checked }))} /> Contrato</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.hasInsurance} onChange={e => setForm(p => ({ ...p, hasInsurance: e.target.checked }))} /> Seguro</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.hasPRL} onChange={e => setForm(p => ({ ...p, hasPRL: e.target.checked }))} /> PRL</label>
          </div>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Notas..." className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
          <div className="flex gap-2">
            <button onClick={editingId ? () => handleUpdate(editingId) : handleCreate} className="px-4 py-2 bg-resona text-white rounded-lg text-sm"><Save className="w-4 h-4 inline mr-1" /> Guardar</button>
            <button onClick={() => { setShowCreate(false); setEditingId(null); }} className="px-4 py-2 text-gray-500 text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-resona" /></div>
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center"><Users className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No hay personal registrado</p></div>
      ) : (
        <div className="space-y-2">
          {staff.map(s => {
            const st = STATUS_LABELS[s.status] || STATUS_LABELS.active;
            const isExpanded = expandedId === s.id;
            return (
              <div key={s.id} className="bg-white rounded-xl border p-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : s.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-resona/10 text-resona flex items-center justify-center font-bold text-sm">{s.name.charAt(0)}</div>
                    <div>
                      <div className="flex items-center gap-2"><h3 className="font-semibold text-gray-900">{s.name}</h3><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${st.color}`}>{st.label}</span><span className="text-xs text-gray-400">{TYPE_LABELS[s.type]}</span></div>
                      <div className="flex gap-3 text-xs text-gray-500">{s.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</span>}{s.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</span>}{s.specialty && <span>{s.specialty}</span>}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm"><p className="font-medium">{formatCurrency(Number(s.hourlyRate))}/h</p><p className="text-xs text-gray-400">{formatCurrency(Number(s.dailyRate))}/día</p></div>
                    <div className="flex gap-1">{!s.hasContract && <span title="Sin contrato"><AlertTriangle className="w-4 h-4 text-orange-400" /></span>}{!s.hasInsurance && <span title="Sin seguro"><AlertTriangle className="w-4 h-4 text-red-400" /></span>}</div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap gap-3 text-xs mb-3">
                      <span className={`px-2 py-1 rounded ${s.hasContract ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{s.hasContract ? '✓' : '✗'} Contrato</span>
                      <span className={`px-2 py-1 rounded ${s.hasInsurance ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{s.hasInsurance ? '✓' : '✗'} Seguro</span>
                      <span className={`px-2 py-1 rounded ${s.hasPRL ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{s.hasPRL ? '✓' : '✗'} PRL</span>
                      {s.dni && <span className="px-2 py-1 bg-gray-50 text-gray-600 rounded">DNI: {s.dni}</span>}
                    </div>
                    {s.notes && <p className="text-xs text-gray-500 bg-yellow-50 p-2 rounded mb-3">{s.notes}</p>}
                    <div className="flex gap-2">
                      <button onClick={e => { e.stopPropagation(); startEdit(s); }} className="text-xs text-resona hover:underline flex items-center gap-1"><Edit className="w-3 h-3" /> Editar</button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(s.id); }} className="text-xs text-red-500 hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" /> Eliminar</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StaffManager;
