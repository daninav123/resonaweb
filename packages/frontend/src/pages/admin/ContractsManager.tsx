import { useState, useEffect } from 'react';
import { FileText, Plus, Search, Loader2, Send, Eye, CheckCircle2, Clock, Edit, Trash2, Save, X, RefreshCw, ExternalLink, Copy } from 'lucide-react';
import { contractFrontendService } from '../../services/adminModules.service';
import toast from 'react-hot-toast';

const formatCurrency = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`;
const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-600' },
  sent: { label: 'Enviado', color: 'bg-blue-100 text-blue-700' },
  viewed: { label: 'Visto', color: 'bg-yellow-100 text-yellow-700' },
  signed: { label: 'Firmado', color: 'bg-green-100 text-green-700' },
  active: { label: 'Vigente', color: 'bg-emerald-100 text-emerald-700' },
  completed: { label: 'Completado', color: 'bg-purple-100 text-purple-700' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};

const ContractsManager = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', clientName: '', clientEmail: '', content: '', totalAmount: '', budgetRef: '' });

  const loadData = async () => {
    try { setLoading(true); const [r, s]: any[] = await Promise.all([contractFrontendService.list({ search: search || undefined, status: statusFilter || undefined }), contractFrontendService.getStats()]); setContracts(r.data || []); setStats(s); } catch { toast.error('Error'); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { const t = setTimeout(() => loadData(), 300); return () => clearTimeout(t); }, [search, statusFilter]);

  const handleCreate = async () => {
    if (!form.title || !form.clientName) return toast.error('Título y cliente obligatorios');
    try { await contractFrontendService.create({ ...form, totalAmount: form.totalAmount ? parseFloat(form.totalAmount) : null }); toast.success('Contrato creado'); setShowCreate(false); loadData(); } catch { toast.error('Error'); }
  };

  const handleUpdate = async (id: string) => {
    try { await contractFrontendService.update(id, { ...form, totalAmount: form.totalAmount ? parseFloat(form.totalAmount) : null }); toast.success('Actualizado'); setEditingId(null); loadData(); } catch { toast.error('Error'); }
  };

  const handleSend = async (id: string) => { try { await contractFrontendService.send(id); toast.success('Contrato enviado'); loadData(); } catch { toast.error('Error'); } };
  const handleDelete = async (id: string) => { if (!confirm('¿Eliminar contrato?')) return; try { await contractFrontendService.delete(id); toast.success('Eliminado'); loadData(); } catch { toast.error('Error'); } };
  const copyLink = (token: string) => { navigator.clipboard.writeText(`${window.location.origin}/contrato/${token}`); toast.success('Enlace copiado'); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Contratos</h1><p className="text-gray-500 mt-1">{stats?.total || 0} contratos</p></div>
        <div className="flex gap-2"><button onClick={loadData} className="p-2 rounded-lg border hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button><button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-resona text-white rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Nuevo</button></div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(stats.byStatus || {}).map(([k, v]) => {
            const cfg = STATUS_CONFIG[k]; if (!cfg) return null;
            return <div key={k} className="bg-white rounded-xl border p-3"><p className="text-xs text-gray-500">{cfg.label}</p><p className="text-xl font-bold">{v as number}</p></div>;
          })}
        </div>
      )}

      <div className="bg-white rounded-xl border p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm" /></div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white"><option value="">Todos</option>{Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl border p-5 space-y-3">
          <h3 className="font-semibold">Nuevo contrato</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Título *" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={form.clientName} onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))} placeholder="Nombre cliente *" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="email" value={form.clientEmail} onChange={e => setForm(p => ({ ...p, clientEmail: e.target.value }))} placeholder="Email cliente" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" value={form.totalAmount} onChange={e => setForm(p => ({ ...p, totalAmount: e.target.value }))} placeholder="Importe total (€)" className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={6} placeholder="Contenido del contrato (HTML)..." className="w-full px-3 py-2 border rounded-lg text-sm resize-none font-mono" />
          <div className="flex gap-2"><button onClick={handleCreate} className="px-4 py-2 bg-resona text-white rounded-lg text-sm">Crear</button><button onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-500 text-sm">Cancelar</button></div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-resona" /></div> : contracts.length === 0 ? <div className="bg-white rounded-xl border p-12 text-center"><FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No hay contratos</p></div> : (
        <div className="space-y-2">
          {contracts.map(c => {
            const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.draft;
            return (
              <div key={c.id} className="bg-white rounded-xl border p-4 hover:border-resona/30 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5"><span className="font-mono text-xs text-gray-400">{c.contractNumber}</span><span className={`px-1.5 py-0.5 rounded text-xs font-medium ${st.color}`}>{st.label}</span></div>
                    <h3 className="font-semibold text-gray-900">{c.title}</h3>
                    <p className="text-xs text-gray-500">{c.clientName} · {c.clientEmail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.totalAmount && <span className="font-semibold">{formatCurrency(Number(c.totalAmount))}</span>}
                    {c.status === 'draft' && <button onClick={() => handleSend(c.id)} className="p-1.5 rounded hover:bg-blue-50"><Send className="w-4 h-4 text-blue-600" /></button>}
                    <button onClick={() => copyLink(c.publicToken)} className="p-1.5 rounded hover:bg-gray-100"><Copy className="w-4 h-4 text-gray-400" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </div>
                <div className="flex gap-3 text-xs text-gray-400 mt-1">
                  <span>Creado: {formatDate(c.createdAt)}</span>
                  {c.sentAt && <span>Enviado: {formatDate(c.sentAt)}</span>}
                  {c.viewedAt && <span>Visto: {formatDate(c.viewedAt)}</span>}
                  {c.signedAt && <span>Firmado: {formatDate(c.signedAt)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContractsManager;
