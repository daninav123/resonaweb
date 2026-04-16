import { useState, useEffect } from 'react';
import { Truck, Plus, Loader2, Edit, Trash2, Save, AlertTriangle, RefreshCw } from 'lucide-react';
import { vehicleFrontendService } from '../../services/adminModules.service';
import toast from 'react-hot-toast';

const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
const STATUS_LABELS: Record<string, { label: string; color: string }> = { available: { label: 'Disponible', color: 'bg-green-100 text-green-700' }, on_route: { label: 'En ruta', color: 'bg-blue-100 text-blue-700' }, maintenance: { label: 'Taller', color: 'bg-orange-100 text-orange-700' }, inactive: { label: 'Inactivo', color: 'bg-gray-100 text-gray-500' } };

const VehiclesManager = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ plate: '', brand: '', model: '', type: 'furgoneta', capacity: '', status: 'available', itvDate: '', insuranceDate: '', notes: '' });

  const loadData = async () => { try { setLoading(true); const [v, a] = await Promise.all([vehicleFrontendService.list(), vehicleFrontendService.getAlerts()]); setVehicles(v as any[]); setAlerts(a); } catch { toast.error('Error'); } finally { setLoading(false); } };
  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    if (!form.plate || !form.brand) return toast.error('Matrícula y marca obligatorios');
    const data: any = { ...form }; if (data.itvDate) data.itvDate = new Date(data.itvDate).toISOString(); else delete data.itvDate; if (data.insuranceDate) data.insuranceDate = new Date(data.insuranceDate).toISOString(); else delete data.insuranceDate;
    try { await vehicleFrontendService.create(data); toast.success('Vehículo creado'); setShowCreate(false); loadData(); } catch { toast.error('Error'); }
  };
  const handleUpdate = async (id: string) => {
    const data: any = { ...form }; if (data.itvDate) data.itvDate = new Date(data.itvDate).toISOString(); else delete data.itvDate; if (data.insuranceDate) data.insuranceDate = new Date(data.insuranceDate).toISOString(); else delete data.insuranceDate;
    try { await vehicleFrontendService.update(id, data); toast.success('Actualizado'); setEditingId(null); loadData(); } catch { toast.error('Error'); }
  };
  const handleDelete = async (id: string) => { if (!confirm('¿Eliminar?')) return; try { await vehicleFrontendService.delete(id); toast.success('Eliminado'); loadData(); } catch { toast.error('Error'); } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Flota de Vehículos</h1><p className="text-gray-500 mt-1">{vehicles.length} vehículos</p></div>
        <div className="flex gap-2"><button onClick={loadData} className="p-2 rounded-lg border hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button><button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-resona text-white rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Nuevo</button></div>
      </div>

      {alerts && (alerts.itvExpiring?.length > 0 || alerts.insuranceExpiring?.length > 0) && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-5 h-5 text-orange-600" /><h3 className="font-semibold text-orange-800">Alertas</h3></div>
          {alerts.itvExpiring?.map((v: any) => <p key={v.id} className="text-sm text-orange-700">ITV: {v.plate} ({v.brand} {v.model}) - {v.itvDate ? formatDate(v.itvDate) : 'Sin fecha'}</p>)}
          {alerts.insuranceExpiring?.map((v: any) => <p key={v.id} className="text-sm text-orange-700">Seguro: {v.plate} ({v.brand} {v.model}) - {v.insuranceDate ? formatDate(v.insuranceDate) : 'Sin fecha'}</p>)}
        </div>
      )}

      {(showCreate || editingId) && (
        <div className="bg-white rounded-xl border p-5 space-y-3">
          <h3 className="font-semibold">{editingId ? 'Editar' : 'Nuevo'} vehículo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input type="text" value={form.plate} onChange={e => setForm(p => ({ ...p, plate: e.target.value.toUpperCase() }))} placeholder="Matrícula *" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} placeholder="Marca *" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} placeholder="Modelo" className="px-3 py-2 border rounded-lg text-sm" />
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm bg-white"><option value="furgoneta">Furgoneta</option><option value="camion">Camión</option><option value="coche">Coche</option><option value="remolque">Remolque</option></select>
            <input type="text" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} placeholder="Capacidad" className="px-3 py-2 border rounded-lg text-sm" />
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm bg-white"><option value="available">Disponible</option><option value="on_route">En ruta</option><option value="maintenance">Taller</option><option value="inactive">Inactivo</option></select>
            <input type="date" value={form.itvDate} onChange={e => setForm(p => ({ ...p, itvDate: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
            <input type="date" value={form.insuranceDate} onChange={e => setForm(p => ({ ...p, insuranceDate: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Notas..." className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
          <div className="flex gap-2"><button onClick={editingId ? () => handleUpdate(editingId) : handleCreate} className="px-4 py-2 bg-resona text-white rounded-lg text-sm">Guardar</button><button onClick={() => { setShowCreate(false); setEditingId(null); }} className="px-4 py-2 text-gray-500 text-sm">Cancelar</button></div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-resona" /></div> : vehicles.length === 0 ? <div className="bg-white rounded-xl border p-12 text-center"><Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No hay vehículos</p></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map(v => {
            const st = STATUS_LABELS[v.status] || STATUS_LABELS.available;
            return (
              <div key={v.id} className="bg-white rounded-xl border p-4">
                <div className="flex items-center justify-between mb-2"><span className="font-mono font-bold text-lg">{v.plate}</span><span className={`px-2 py-0.5 rounded text-xs font-medium ${st.color}`}>{st.label}</span></div>
                <p className="text-sm text-gray-700">{v.brand} {v.model}</p>
                <p className="text-xs text-gray-400 mb-2">{v.type}{v.capacity ? ` · ${v.capacity}` : ''}</p>
                <div className="flex gap-3 text-xs text-gray-400 mb-3">
                  {v.itvDate && <span>ITV: {formatDate(v.itvDate)}</span>}
                  {v.insuranceDate && <span>Seguro: {formatDate(v.insuranceDate)}</span>}
                  <span>{v.kmTotal.toLocaleString()} km</span>
                </div>
                <div className="flex gap-2 border-t pt-2">
                  <button onClick={() => { setEditingId(v.id); setForm({ plate: v.plate, brand: v.brand, model: v.model, type: v.type, capacity: v.capacity || '', status: v.status, itvDate: v.itvDate ? v.itvDate.slice(0, 10) : '', insuranceDate: v.insuranceDate ? v.insuranceDate.slice(0, 10) : '', notes: v.notes || '' }); }} className="text-xs text-resona hover:underline flex items-center gap-1"><Edit className="w-3 h-3" /> Editar</button>
                  <button onClick={() => handleDelete(v.id)} className="text-xs text-red-500 hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" /> Eliminar</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VehiclesManager;
