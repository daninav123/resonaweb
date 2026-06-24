import { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { Plus, ChevronLeft, ChevronRight, Loader2, Trash2, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

interface Vehicle { id: string; plate: string; brand?: string; model?: string; status: string; }
interface Assignment { id: string; vehicleId: string; eventId?: string; orderId?: string; purpose?: string; startDate: string; endDate: string; driverName?: string; notes?: string; kmStart?: number; kmEnd?: number; }
interface EventOption { id: string; name: string; eventNumber: string; eventDate: string; }

const PURPOSES = ['entrega', 'recogida', 'montaje', 'desmontaje', 'transporte personal', 'otro'];
const COLORS = ['bg-blue-200 text-blue-800', 'bg-green-200 text-green-800', 'bg-purple-200 text-purple-800', 'bg-orange-200 text-orange-800', 'bg-pink-200 text-pink-800', 'bg-teal-200 text-teal-800', 'bg-red-200 text-red-800'];

const VehicleCalendarPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicleId: '', eventId: '', purpose: 'entrega', startDate: '', endDate: '', driverName: '', notes: '', kmStart: 0, kmEnd: 0 });
  const [events, setEvents] = useState<EventOption[]>([]);

  const weekStart = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - d.getDay() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const load = async () => {
    try {
      setLoading(true);
      const start = weekDays[0].toISOString();
      const end = weekDays[6].toISOString();
      const res: any = await api.get(`/vehicles/calendar/range?start=${start}&end=${end}`);
      setVehicles(res?.vehicles || []);
      setAssignments(res?.assignments || []);
    } catch { toast.error('Error cargando calendario'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [weekStart]);
  useEffect(() => {
    api.get('/events?limit=50&phase=PLANNING,PREPARATION,SETUP').then((res: any) => {
      const data = res?.data || res?.events || (Array.isArray(res) ? res : []);
      setEvents(data);
    }).catch(() => {});
  }, []);

  const prevWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); };
  const nextWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); };
  const today = () => setCurrentDate(new Date());

  const getAssignmentsForVehicleDay = (vehicleId: string, day: Date) => {
    const dayStr = day.toISOString().split('T')[0];
    return assignments.filter(a => {
      const start = new Date(a.startDate).toISOString().split('T')[0];
      const end = new Date(a.endDate).toISOString().split('T')[0];
      return a.vehicleId === vehicleId && start <= dayStr && end >= dayStr;
    });
  };

  const handleCreate = async () => {
    if (!form.vehicleId || !form.startDate || !form.endDate) { toast.error('Vehículo y fechas obligatorios'); return; }
    try {
      await api.post('/vehicles/assignments', form);
      toast.success('Asignación creada');
      setShowForm(false);
      load();
    } catch (err: any) { toast.error(err?.message || 'Error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar asignación?')) return;
    try { await api.delete(`/vehicles/assignments/${id}`); toast.success('Eliminada'); load(); } catch { toast.error('Error'); }
  };

  const formatDay = (d: Date) => d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
  const isToday = (d: Date) => d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario de Vehículos</h1>
          <p className="text-gray-600">Asignaciones semanales de la flota</p>
        </div>
        <button onClick={() => { setForm({ vehicleId: vehicles[0]?.id || '', eventId: '', purpose: 'entrega', startDate: '', endDate: '', driverName: '', notes: '', kmStart: 0, kmEnd: 0 }); setShowForm(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva Asignación
        </button>
      </div>

      {/* Nav semana */}
      <div className="flex items-center gap-3 bg-white rounded-lg border p-3">
        <button onClick={prevWeek} className="p-1.5 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5" /></button>
        <button onClick={today} className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200">Hoy</button>
        <button onClick={nextWeek} className="p-1.5 hover:bg-gray-100 rounded"><ChevronRight className="w-5 h-5" /></button>
        <span className="font-medium text-gray-700">
          {weekDays[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} — {weekDays[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div> : (
        <div className="bg-white rounded-lg shadow border overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b">
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 w-40">Vehículo</th>
                {weekDays.map(d => (
                  <th key={d.toISOString()} className={`text-center px-2 py-2 text-xs font-medium ${isToday(d) ? 'bg-blue-50 text-blue-700' : 'text-gray-500'}`}>
                    {formatDay(d)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {vehicles.map((v, vi) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-sm">{v.plate}</p>
                        <p className="text-xs text-gray-400">{v.brand} {v.model}</p>
                      </div>
                    </div>
                  </td>
                  {weekDays.map(d => {
                    const dayAssignments = getAssignmentsForVehicleDay(v.id, d);
                    return (
                      <td key={d.toISOString()} className={`px-1 py-1 align-top ${isToday(d) ? 'bg-blue-50' : ''}`}>
                        {dayAssignments.map(a => (
                          <div key={a.id} className={`text-xs rounded px-1.5 py-1 mb-1 cursor-pointer group relative ${COLORS[vi % COLORS.length]}`}>
                            <p className="font-medium truncate">{a.purpose || 'Asignado'}</p>
                            {a.driverName && <p className="truncate opacity-75">{a.driverName}</p>}
                            <button onClick={() => handleDelete(a.id)} className="absolute top-0.5 right-0.5 hidden group-hover:block p-0.5 bg-white rounded shadow">
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No hay vehículos registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear asignación */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-lg font-bold">Nueva Asignación de Vehículo</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Vehículo*</label>
                <select value={form.vehicleId} onChange={e => setForm({ ...form, vehicleId: e.target.value })} className="w-full px-3 py-2 border rounded">
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Propósito</label>
                <select value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} className="w-full px-3 py-2 border rounded">
                  {PURPOSES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-gray-500">Fecha inicio*</label><input type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Fecha fin*</label><input type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 border rounded" /></div>
              <div>
                <label className="text-xs text-gray-500">Evento vinculado</label>
                <select value={form.eventId} onChange={e => setForm({ ...form, eventId: e.target.value })} className="w-full px-3 py-2 border rounded">
                  <option value="">Sin vincular</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.eventNumber} - {ev.name}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-gray-500">Conductor</label><input value={form.driverName} onChange={e => setForm({ ...form, driverName: e.target.value })} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Km inicio</label><input type="number" value={form.kmStart} onChange={e => setForm({ ...form, kmStart: Number(e.target.value) })} className="w-full px-3 py-2 border rounded" /></div>
              <div className="md:col-span-2"><label className="text-xs text-gray-500">Notas</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border rounded" rows={2} /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Crear</button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleCalendarPage;
