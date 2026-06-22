import { useState, useEffect } from 'react';
import { api } from '@resona/api-client';
import { Plus, Edit, Trash2, Copy, Loader2, Search, Calendar, Package, Users as UsersIcon, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface EventTemplate {
  id: string;
  name: string;
  eventType: string;
  description?: string;
  defaultEquipment?: any[];
  defaultStaff?: any[];
  defaultChecklist?: any[];
  defaultTimeline?: any[];
  estimatedCost?: number;
  estimatedDuration?: number;
  isActive: boolean;
}

const EVENT_TYPES = ['Boda', 'Corporativo', 'Festival', 'Concierto', 'Conferencia', 'Feria', 'Cumpleaños', 'Otro'];

const EventTemplatesManager = () => {
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCreateEvent, setShowCreateEvent] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', eventType: 'Boda', description: '', estimatedCost: 0, estimatedDuration: 8,
    defaultEquipment: '[]', defaultStaff: '[]', defaultChecklist: '[]', defaultTimeline: '[]',
  });
  const [eventForm, setEventForm] = useState({ eventDate: '', clientName: '', clientEmail: '', clientPhone: '', venueName: '', venueAddress: '', attendees: 100, briefing: '' });

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res: any = await api.get(`/event-templates?search=${search}`);
      setTemplates(res?.data || []);
    } catch { toast.error('Error cargando plantillas'); } finally { setLoading(false); }
  };

  useEffect(() => { loadTemplates(); }, [search]);

  const handleSave = async () => {
    try {
      const data = {
        name: form.name,
        eventType: form.eventType,
        description: form.description || null,
        estimatedCost: form.estimatedCost || null,
        estimatedDuration: form.estimatedDuration || null,
        defaultEquipment: JSON.parse(form.defaultEquipment || '[]'),
        defaultStaff: JSON.parse(form.defaultStaff || '[]'),
        defaultChecklist: JSON.parse(form.defaultChecklist || '[]'),
        defaultTimeline: JSON.parse(form.defaultTimeline || '[]'),
      };
      if (editingId) {
        await api.patch(`/event-templates/${editingId}`, data);
        toast.success('Plantilla actualizada');
      } else {
        await api.post('/event-templates', data);
        toast.success('Plantilla creada');
      }
      resetForm();
      loadTemplates();
    } catch (err: any) {
      toast.error(err?.message || 'Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta plantilla?')) return;
    try {
      await api.delete(`/event-templates/${id}`);
      toast.success('Plantilla eliminada');
      loadTemplates();
    } catch { toast.error('Error al eliminar'); }
  };

  const handleEdit = (t: EventTemplate) => {
    setEditingId(t.id);
    setForm({
      name: t.name, eventType: t.eventType, description: t.description || '',
      estimatedCost: Number(t.estimatedCost || 0), estimatedDuration: t.estimatedDuration || 8,
      defaultEquipment: JSON.stringify(t.defaultEquipment || [], null, 2),
      defaultStaff: JSON.stringify(t.defaultStaff || [], null, 2),
      defaultChecklist: JSON.stringify(t.defaultChecklist || [], null, 2),
      defaultTimeline: JSON.stringify(t.defaultTimeline || [], null, 2),
    });
    setShowForm(true);
  };

  const handleCreateEvent = async () => {
    if (!showCreateEvent || !eventForm.clientName || !eventForm.eventDate) { toast.error('Nombre y fecha obligatorios'); return; }
    try {
      await api.post(`/event-templates/create-event/${showCreateEvent}`, eventForm);
      toast.success('Evento creado desde plantilla');
      setShowCreateEvent(null);
      setEventForm({ eventDate: '', clientName: '', clientEmail: '', clientPhone: '', venueName: '', venueAddress: '', attendees: 100, briefing: '' });
    } catch (err: any) { toast.error(err?.message || 'Error al crear evento'); }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: '', eventType: 'Boda', description: '', estimatedCost: 0, estimatedDuration: 8, defaultEquipment: '[]', defaultStaff: '[]', defaultChecklist: '[]', defaultTimeline: '[]' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plantillas de Evento</h1>
          <p className="text-gray-600">Reutiliza configuraciones para crear eventos más rápido</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva Plantilla
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar plantillas..." className="w-full pl-10 pr-4 py-2 border rounded-lg" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay plantillas. Crea la primera.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t.id} className="bg-white rounded-lg shadow border p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{t.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{t.eventType}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(t)} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {t.description && <p className="text-sm text-gray-500">{t.description}</p>}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-1"><Package className="w-3 h-3" /> {(t.defaultEquipment as any[])?.length || 0} equipos</div>
                <div className="flex items-center gap-1"><UsersIcon className="w-3 h-3" /> {(t.defaultStaff as any[])?.length || 0} roles</div>
                <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {(t.defaultChecklist as any[])?.length || 0} checks</div>
                <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {t.estimatedDuration || '-'}h</div>
              </div>
              {t.estimatedCost && <p className="text-sm font-medium text-gray-700">Coste est.: {Number(t.estimatedCost).toLocaleString('es-ES')}€</p>}
              <button
                onClick={() => setShowCreateEvent(t.id)}
                className="w-full mt-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" /> Crear Evento desde Plantilla
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear/editar plantilla */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="text-lg font-bold">{editingId ? 'Editar Plantilla' : 'Nueva Plantilla'}</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Nombre*</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Tipo Evento</label><select value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})} className="w-full px-3 py-2 border rounded">{EVENT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              <div className="md:col-span-2"><label className="text-xs text-gray-500">Descripción</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded" rows={2} /></div>
              <div><label className="text-xs text-gray-500">Coste estimado (€)</label><input type="number" value={form.estimatedCost} onChange={e => setForm({...form, estimatedCost: Number(e.target.value)})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Duración (horas)</label><input type="number" value={form.estimatedDuration} onChange={e => setForm({...form, estimatedDuration: Number(e.target.value)})} className="w-full px-3 py-2 border rounded" /></div>
            </div>
            <div><label className="text-xs text-gray-500">Equipos (JSON)</label><textarea value={form.defaultEquipment} onChange={e => setForm({...form, defaultEquipment: e.target.value})} className="w-full px-3 py-2 border rounded font-mono text-xs" rows={3} placeholder='[{"productName": "Mesa mezclas", "quantity": 1}]' /></div>
            <div><label className="text-xs text-gray-500">Checklist (JSON)</label><textarea value={form.defaultChecklist} onChange={e => setForm({...form, defaultChecklist: e.target.value})} className="w-full px-3 py-2 border rounded font-mono text-xs" rows={3} placeholder='[{"text": "Comprobar cables", "category": "montaje"}]' /></div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Guardar</button>
              <button onClick={resetForm} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear evento desde plantilla */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-lg font-bold">Crear Evento desde Plantilla</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Cliente*</label><input value={eventForm.clientName} onChange={e => setEventForm({...eventForm, clientName: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Fecha Evento*</label><input type="date" value={eventForm.eventDate} onChange={e => setEventForm({...eventForm, eventDate: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Email</label><input value={eventForm.clientEmail} onChange={e => setEventForm({...eventForm, clientEmail: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Teléfono</label><input value={eventForm.clientPhone} onChange={e => setEventForm({...eventForm, clientPhone: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Venue</label><input value={eventForm.venueName} onChange={e => setEventForm({...eventForm, venueName: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Asistentes</label><input type="number" value={eventForm.attendees} onChange={e => setEventForm({...eventForm, attendees: Number(e.target.value)})} className="w-full px-3 py-2 border rounded" /></div>
              <div className="md:col-span-2"><label className="text-xs text-gray-500">Briefing</label><textarea value={eventForm.briefing} onChange={e => setEventForm({...eventForm, briefing: e.target.value})} className="w-full px-3 py-2 border rounded" rows={2} /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreateEvent} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">Crear Evento</button>
              <button onClick={() => setShowCreateEvent(null)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventTemplatesManager;
