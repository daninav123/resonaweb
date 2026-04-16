import { useState, useEffect } from 'react';
import { Package, Plus, Loader2, Edit, Trash2, Save, MapPin, RefreshCw } from 'lucide-react';
import { warehouseFrontendService } from '../../services/adminModules.service';
import toast from 'react-hot-toast';

const WarehouseManager = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ zone: '', shelf: '', position: '', description: '', maxItems: '100' });

  const loadData = async () => { try { setLoading(true); setLocations(await warehouseFrontendService.listLocations() as any[]); } catch { toast.error('Error'); } finally { setLoading(false); } };
  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    if (!form.zone || !form.shelf) return toast.error('Zona y estantería obligatorios');
    try { await warehouseFrontendService.createLocation({ ...form, maxItems: parseInt(form.maxItems) || 100, position: form.position || null }); toast.success('Ubicación creada'); setShowCreate(false); loadData(); } catch { toast.error('Error'); }
  };
  const handleUpdate = async (id: string) => { try { await warehouseFrontendService.updateLocation(id, { ...form, maxItems: parseInt(form.maxItems) || 100 }); toast.success('Actualizado'); setEditingId(null); loadData(); } catch { toast.error('Error'); } };
  const handleDelete = async (id: string) => { if (!confirm('¿Eliminar?')) return; try { await warehouseFrontendService.deleteLocation(id); toast.success('Eliminado'); loadData(); } catch { toast.error('Error'); } };

  const grouped = locations.reduce((acc: Record<string, any[]>, l: any) => { if (!acc[l.zone]) acc[l.zone] = []; acc[l.zone].push(l); return acc; }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Almacén - Ubicaciones</h1><p className="text-gray-500 mt-1">{locations.length} ubicaciones en {Object.keys(grouped).length} zonas</p></div>
        <div className="flex gap-2"><button onClick={loadData} className="p-2 rounded-lg border hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button><button onClick={() => { setShowCreate(true); setForm({ zone: '', shelf: '', position: '', description: '', maxItems: '100' }); }} className="px-4 py-2 bg-resona text-white rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Nueva</button></div>
      </div>

      {(showCreate || editingId) && (
        <div className="bg-white rounded-xl border p-5 space-y-3">
          <h3 className="font-semibold">{editingId ? 'Editar' : 'Nueva'} ubicación</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input type="text" value={form.zone} onChange={e => setForm(p => ({ ...p, zone: e.target.value.toUpperCase() }))} placeholder="Zona (A, B...)" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={form.shelf} onChange={e => setForm(p => ({ ...p, shelf: e.target.value }))} placeholder="Estantería (1, 2...)" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} placeholder="Posición (A1...)" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" value={form.maxItems} onChange={e => setForm(p => ({ ...p, maxItems: e.target.value }))} placeholder="Capacidad" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descripción" className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="flex gap-2"><button onClick={editingId ? () => handleUpdate(editingId) : handleCreate} className="px-4 py-2 bg-resona text-white rounded-lg text-sm">Guardar</button><button onClick={() => { setShowCreate(false); setEditingId(null); }} className="px-4 py-2 text-gray-500 text-sm">Cancelar</button></div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-resona" /></div> : locations.length === 0 ? <div className="bg-white rounded-xl border p-12 text-center"><Package className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No hay ubicaciones</p></div> : (
        <div className="space-y-4">
          {Object.entries(grouped).sort().map(([zone, locs]: [string, any[]]) => (
            <div key={zone}>
              <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2"><MapPin className="w-5 h-5 text-resona" /> Zona {zone}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {locs.map(loc => {
                  const pct = loc.maxItems > 0 ? Math.round((loc.currentItems / loc.maxItems) * 100) : 0;
                  const color = pct >= 90 ? 'bg-red-200' : pct >= 60 ? 'bg-yellow-200' : 'bg-green-200';
                  return (
                    <div key={loc.id} className="bg-white rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-1"><span className="font-mono font-bold text-sm">{zone}-{loc.shelf}{loc.position ? `-${loc.position}` : ''}</span></div>
                      <div className="w-full h-2 bg-gray-100 rounded-full mb-1"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>
                      <p className="text-xs text-gray-500">{loc.currentItems}/{loc.maxItems} ({pct}%)</p>
                      {loc.description && <p className="text-xs text-gray-400 mt-1 truncate">{loc.description}</p>}
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => { setEditingId(loc.id); setForm({ zone: loc.zone, shelf: loc.shelf, position: loc.position || '', description: loc.description || '', maxItems: String(loc.maxItems) }); }} className="text-xs text-resona"><Edit className="w-3 h-3 inline" /></button>
                        <button onClick={() => handleDelete(loc.id)} className="text-xs text-red-500"><Trash2 className="w-3 h-3 inline" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WarehouseManager;
