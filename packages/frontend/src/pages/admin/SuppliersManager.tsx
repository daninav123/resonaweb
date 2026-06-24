import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Edit, Trash2, Search, Loader2, Phone, Mail, Globe, FileText, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Supplier { id: string; name: string; taxId?: string; contactName?: string; email?: string; phone?: string; address?: string; website?: string; category?: string; paymentTerms?: string; notes?: string; _count?: { purchases: number }; }

const CATEGORIES = ['audio', 'iluminación', 'vídeo', 'transporte', 'catering', 'decoración', 'mobiliario', 'técnico', 'otro'];

const SuppliersManager = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', taxId: '', contactName: '', email: '', phone: '', address: '', website: '', category: 'audio', paymentTerms: 'contado', notes: '' });
  const [purchaseForm, setPurchaseForm] = useState({ description: '', amount: 0, date: new Date().toISOString().split('T')[0], category: 'material', invoiceRef: '' });
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const load = async () => {
    try {
      setLoading(true);
      const [res, statsRes]: any[] = await Promise.all([
        api.get(`/suppliers?search=${search}`),
        api.get('/suppliers/stats'),
      ]);
      setSuppliers(res?.data || []);
      setStats(statsRes);
    } catch { toast.error('Error cargando proveedores'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const handleSave = async () => {
    try {
      if (editingId) { await api.patch(`/suppliers/${editingId}`, form); toast.success('Proveedor actualizado'); }
      else { await api.post('/suppliers', form); toast.success('Proveedor creado'); }
      setShowForm(false); setEditingId(null); load();
    } catch { toast.error('Error al guardar'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar proveedor?')) return;
    try { await api.delete(`/suppliers/${id}`); toast.success('Eliminado'); load(); } catch { toast.error('Error'); }
  };

  const handleEdit = (s: Supplier) => {
    setEditingId(s.id);
    setForm({ name: s.name, taxId: s.taxId || '', contactName: s.contactName || '', email: s.email || '', phone: s.phone || '', address: s.address || '', website: s.website || '', category: s.category || 'otro', paymentTerms: s.paymentTerms || 'contado', notes: s.notes || '' });
    setShowForm(true);
  };

  const loadPurchases = async (supplierId: string) => {
    try { const res: any = await api.get(`/suppliers/${supplierId}/purchases`); setPurchases(res || []); } catch { setPurchases([]); }
  };

  const handleAddPurchase = async () => {
    if (!selectedSupplier) return;
    try {
      await api.post(`/suppliers/${selectedSupplier.id}/purchases`, purchaseForm);
      toast.success('Compra registrada');
      setShowPurchaseForm(false);
      loadPurchases(selectedSupplier.id);
      load();
    } catch { toast.error('Error'); }
  };

  const viewSupplier = async (s: Supplier) => { setSelectedSupplier(s); await loadPurchases(s.id); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
          <p className="text-gray-600">Gestiona proveedores y compras</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ name: '', taxId: '', contactName: '', email: '', phone: '', address: '', website: '', category: 'audio', paymentTerms: 'contado', notes: '' }); setShowForm(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Proveedor
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">Proveedores</p><p className="text-2xl font-bold">{stats.total}</p></div>
          <div className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">Gasto total</p><p className="text-2xl font-bold">{stats.totalSpent?.toLocaleString('es-ES')}€</p></div>
          <div className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">Categorías</p><p className="text-2xl font-bold">{Object.keys(stats.byCategory || {}).length}</p></div>
        </div>
      )}

      <div className="relative"><Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map(s => (
            <div key={s.id} className="bg-white rounded-lg shadow border p-4 cursor-pointer hover:shadow-md transition" onClick={() => viewSupplier(s)}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{s.name}</h3>
                  {s.category && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{s.category}</span>}
                </div>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleEdit(s)} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                {s.contactName && <div className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {s.contactName}</div>}
                {s.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {s.phone}</div>}
                {s.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {s.email}</div>}
              </div>
              <div className="mt-2 text-xs text-gray-400">{s._count?.purchases || 0} compras · {s.paymentTerms || 'Sin condiciones'}</div>
            </div>
          ))}
        </div>
      )}

      {/* Detalle proveedor + compras */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between">
              <h2 className="text-lg font-bold">{selectedSupplier.name}</h2>
              <button onClick={() => setSelectedSupplier(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {selectedSupplier.taxId && <p><span className="text-gray-500">CIF:</span> {selectedSupplier.taxId}</p>}
              {selectedSupplier.phone && <p><span className="text-gray-500">Tel:</span> {selectedSupplier.phone}</p>}
              {selectedSupplier.email && <p><span className="text-gray-500">Email:</span> {selectedSupplier.email}</p>}
              {selectedSupplier.paymentTerms && <p><span className="text-gray-500">Pago:</span> {selectedSupplier.paymentTerms}</p>}
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <h3 className="font-semibold">Compras</h3>
              <button onClick={() => setShowPurchaseForm(true)} className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">+ Registrar Compra</button>
            </div>
            {purchases.length === 0 ? <p className="text-sm text-gray-400">Sin compras registradas</p> : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {purchases.map((p: any) => (
                  <div key={p.id} className="flex justify-between text-sm border-b pb-2">
                    <div><p className="font-medium">{p.description}</p><p className="text-xs text-gray-400">{new Date(p.date).toLocaleDateString('es-ES')} · {p.category}</p></div>
                    <p className="font-semibold">{Number(p.amount).toLocaleString('es-ES')}€</p>
                  </div>
                ))}
              </div>
            )}
            {showPurchaseForm && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-2 border">
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Descripción" value={purchaseForm.description} onChange={e => setPurchaseForm({...purchaseForm, description: e.target.value})} className="px-3 py-2 border rounded text-sm" />
                  <input type="number" placeholder="Importe" value={purchaseForm.amount} onChange={e => setPurchaseForm({...purchaseForm, amount: Number(e.target.value)})} className="px-3 py-2 border rounded text-sm" />
                  <input type="date" value={purchaseForm.date} onChange={e => setPurchaseForm({...purchaseForm, date: e.target.value})} className="px-3 py-2 border rounded text-sm" />
                  <input placeholder="Ref. factura" value={purchaseForm.invoiceRef} onChange={e => setPurchaseForm({...purchaseForm, invoiceRef: e.target.value})} className="px-3 py-2 border rounded text-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddPurchase} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Guardar</button>
                  <button onClick={() => setShowPurchaseForm(false)} className="px-3 py-1 bg-gray-200 rounded text-sm">Cancelar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal crear/editar */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-lg font-bold">{editingId ? 'Editar' : 'Nuevo'} Proveedor</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Nombre*</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">CIF/NIF</label><input value={form.taxId} onChange={e => setForm({...form, taxId: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Contacto</label><input value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Teléfono</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Email</label><input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Categoría</label><select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-3 py-2 border rounded">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label className="text-xs text-gray-500">Condiciones pago</label><input value={form.paymentTerms} onChange={e => setForm({...form, paymentTerms: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Web</label><input value={form.website} onChange={e => setForm({...form, website: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
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

export default SuppliersManager;
