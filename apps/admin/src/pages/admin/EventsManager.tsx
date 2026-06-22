import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Plus, Search, Filter, ChevronRight, MapPin, Users as UsersIcon,
  Clock, AlertTriangle, CheckCircle2, Package, X, Loader2, MoreHorizontal,
  Eye, Trash2, Edit, ArrowRight, CircleDot, RefreshCw,
} from 'lucide-react';
import { eventService } from '../../services/event.service';
import toast from 'react-hot-toast';

// ============= TYPES =============
interface EventItem {
  id: string;
  eventNumber: string;
  name: string;
  eventType: string;
  priority: string;
  eventDate: string;
  eventEndDate: string | null;
  setupDate: string | null;
  teardownDate: string | null;
  venueName: string | null;
  clientName: string;
  clientPhone: string | null;
  attendees: number | null;
  phase: string;
  estimatedRevenue: number | null;
  estimatedCost: number | null;
  checklistProgress: number;
  totalChecklist: number;
  completedChecklist: number;
  staffCount: number;
  confirmedStaff: number;
  equipmentCount: number;
  pickedUpCount: number;
  openIncidents: number;
  _count: { timeline: number; notes: number; documents: number };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============= CONSTANTS =============
const PHASE_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  INQUIRY: { label: 'Consulta', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  PLANNING: { label: 'Planificación', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  PREPARATION: { label: 'Preparación', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  SETUP: { label: 'Montaje', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
  LIVE: { label: 'En curso', color: 'text-green-700', bgColor: 'bg-green-100' },
  TEARDOWN: { label: 'Desmontaje', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  REVIEW: { label: 'Revisión', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  CLOSED: { label: 'Cerrado', color: 'text-gray-500', bgColor: 'bg-gray-200' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Baja', color: 'text-gray-500' },
  MEDIUM: { label: 'Media', color: 'text-blue-600' },
  HIGH: { label: 'Alta', color: 'text-orange-600' },
  URGENT: { label: 'Urgente', color: 'text-red-600' },
};

const EVENT_TYPES = ['Boda', 'Concierto', 'Festival', 'Corporativo', 'Cumpleaños', 'Comunión', 'Fiesta privada', 'Otro'];

const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
const formatCurrency = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`;

// ============= MAIN COMPONENT =============
const EventsManager = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const loadEvents = async (page = 1) => {
    try {
      setLoading(true);
      const result: any = await eventService.list({
        page,
        limit: 20,
        search: search || undefined,
        phase: phaseFilter || undefined,
        eventType: typeFilter || undefined,
      });
      setEvents(result.data || []);
      setPagination(result.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await eventService.getStats();
      setStats(result);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => { loadEvents(); loadStats(); }, []);
  useEffect(() => { const timeout = setTimeout(() => loadEvents(), 300); return () => clearTimeout(timeout); }, [search, phaseFilter, typeFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar el evento "${name}"?`)) return;
    try {
      await eventService.delete(id);
      toast.success('Evento eliminado');
      loadEvents(pagination.page);
      loadStats();
    } catch (error) {
      toast.error('Error al eliminar evento');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Eventos</h1>
          <p className="text-gray-500 mt-1">
            {pagination.total} evento{pagination.total !== 1 ? 's' : ''} en total
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-resona text-white rounded-lg hover:bg-resona/90 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" /> Nuevo evento
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total eventos</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Este mes</p>
            <p className="text-2xl font-bold text-blue-600">{stats.thisMonth}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">En curso</p>
            <p className="text-2xl font-bold text-green-600">{stats.byPhase?.LIVE || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Incidencias abiertas</p>
            <p className="text-2xl font-bold text-red-600">{stats.openIncidents}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, número, cliente..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-resona/20 focus:border-resona"
            />
          </div>
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value="">Todas las fases</option>
            {Object.entries(PHASE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value="">Todos los tipos</option>
            {EVENT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-resona text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-2 text-sm ${viewMode === 'kanban' ? 'bg-resona text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Kanban
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-resona" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay eventos</p>
          <p className="text-sm text-gray-400 mt-1">Crea tu primer evento para empezar</p>
          <button onClick={() => setShowCreateModal(true)} className="mt-4 px-4 py-2 bg-resona text-white rounded-lg text-sm hover:bg-resona/90">
            <Plus className="w-4 h-4 inline mr-1" /> Crear evento
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <EventListView events={events} onDelete={handleDelete} navigate={navigate} />
      ) : (
        <EventKanbanView events={events} navigate={navigate} />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => loadEvents(page)}
              className={`px-3 py-1.5 rounded-lg text-sm ${page === pagination.page ? 'bg-resona text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateEventModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => { setShowCreateModal(false); loadEvents(); loadStats(); }}
        />
      )}
    </div>
  );
};

// ============= LIST VIEW =============
const EventListView = ({ events, onDelete, navigate }: { events: EventItem[]; onDelete: (id: string, name: string) => void; navigate: any }) => (
  <div className="space-y-3">
    {events.map(event => {
      const phase = PHASE_CONFIG[event.phase] || PHASE_CONFIG.INQUIRY;
      const priority = PRIORITY_CONFIG[event.priority] || PRIORITY_CONFIG.MEDIUM;
      return (
        <div
          key={event.id}
          className="bg-white rounded-xl border border-gray-200 p-4 hover:border-resona/30 hover:shadow-sm transition-all cursor-pointer"
          onClick={() => navigate(`/admin/events/${event.id}`)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs text-gray-400 font-mono">{event.eventNumber}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${phase.bgColor} ${phase.color}`}>
                  {phase.label}
                </span>
                <span className={`text-xs font-medium ${priority.color}`}>
                  {priority.label}
                </span>
                {event.openIncidents > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    <AlertTriangle className="w-3 h-3" /> {event.openIncidents}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 truncate">{event.name}</h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {formatDate(event.eventDate)}
                </span>
                <span className="flex items-center gap-1">
                  <UsersIcon className="w-3 h-3" /> {event.clientName}
                </span>
                {event.venueName && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {event.venueName}
                  </span>
                )}
                {event.attendees && (
                  <span className="flex items-center gap-1">
                    <UsersIcon className="w-3 h-3" /> {event.attendees} asistentes
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CircleDot className="w-3 h-3" /> {event.eventType}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0 space-y-1">
              {event.estimatedRevenue && (
                <p className="font-semibold text-gray-900">{formatCurrency(Number(event.estimatedRevenue))}</p>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>{event.checklistProgress}%</span>
                <span className="mx-1">·</span>
                <UsersIcon className="w-3 h-3" />
                <span>{event.confirmedStaff}/{event.staffCount}</span>
                <span className="mx-1">·</span>
                <Package className="w-3 h-3" />
                <span>{event.equipmentCount}</span>
              </div>
              {/* Progress bar */}
              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${event.checklistProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

// ============= KANBAN VIEW =============
const EventKanbanView = ({ events, navigate }: { events: EventItem[]; navigate: any }) => {
  const phases = ['INQUIRY', 'PLANNING', 'PREPARATION', 'SETUP', 'LIVE', 'TEARDOWN', 'REVIEW', 'CLOSED'];
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {phases.map(phase => {
        const config = PHASE_CONFIG[phase];
        const phaseEvents = events.filter(e => e.phase === phase);
        return (
          <div key={phase} className="min-w-[280px] max-w-[280px]">
            <div className={`rounded-lg px-3 py-1.5 mb-3 ${config.bgColor}`}>
              <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
              <span className="text-xs text-gray-500 ml-2">{phaseEvents.length}</span>
            </div>
            <div className="space-y-2">
              {phaseEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => navigate(`/admin/events/${event.id}`)}
                  className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-sm transition-shadow"
                >
                  <p className="text-xs text-gray-400 font-mono">{event.eventNumber}</p>
                  <p className="font-medium text-gray-900 text-sm mt-0.5 line-clamp-2">{event.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{event.clientName}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{formatDate(event.eventDate)}</span>
                    <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${event.checklistProgress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              {phaseEvents.length === 0 && (
                <div className="text-center py-4 text-xs text-gray-400">Sin eventos</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============= CREATE MODAL =============
const CreateEventModal = ({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    eventType: 'Boda',
    priority: 'MEDIUM',
    eventDate: '',
    eventEndDate: '',
    setupDate: '',
    teardownDate: '',
    venueName: '',
    venueAddress: '',
    venuePhone: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCompany: '',
    attendees: '',
    briefing: '',
    estimatedRevenue: '',
    estimatedCost: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.eventDate || !form.clientName) {
      toast.error('Nombre, fecha y cliente son obligatorios');
      return;
    }
    try {
      setSaving(true);
      await eventService.create({
        ...form,
        attendees: form.attendees ? parseInt(form.attendees) : undefined,
        estimatedRevenue: form.estimatedRevenue ? parseFloat(form.estimatedRevenue) : undefined,
        estimatedCost: form.estimatedCost ? parseFloat(form.estimatedCost) : undefined,
        eventEndDate: form.eventEndDate || undefined,
        setupDate: form.setupDate || undefined,
        teardownDate: form.teardownDate || undefined,
      });
      toast.success('Evento creado');
      onCreated();
    } catch (error) {
      toast.error('Error al crear evento');
    } finally {
      setSaving(false);
    }
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Nuevo evento</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Evento */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Información del evento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Nombre del evento *</label>
                <input type="text" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Boda María y Juan - Finca El Olivo" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-resona/20" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tipo de evento</label>
                <select value={form.eventType} onChange={e => update('eventType', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Prioridad</label>
                <select value={form.priority} onChange={e => update('priority', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fecha del evento *</label>
                <input type="datetime-local" value={form.eventDate} onChange={e => update('eventDate', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fecha fin (si multi-día)</label>
                <input type="datetime-local" value={form.eventEndDate} onChange={e => update('eventEndDate', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fecha montaje</label>
                <input type="datetime-local" value={form.setupDate} onChange={e => update('setupDate', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Asistentes</label>
                <input type="number" value={form.attendees} onChange={e => update('attendees', e.target.value)} placeholder="150" className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Ubicación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre del venue</label>
                <input type="text" value={form.venueName} onChange={e => update('venueName', e.target.value)} placeholder="Finca El Olivo" className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Teléfono venue</label>
                <input type="text" value={form.venuePhone} onChange={e => update('venuePhone', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Dirección</label>
                <input type="text" value={form.venueAddress} onChange={e => update('venueAddress', e.target.value)} placeholder="Carretera CV-365, km 12, Valencia" className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
          </div>

          {/* Cliente */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nombre *</label>
                <input type="text" value={form.clientName} onChange={e => update('clientName', e.target.value)} placeholder="María García" className="w-full px-3 py-2 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <input type="email" value={form.clientEmail} onChange={e => update('clientEmail', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Teléfono</label>
                <input type="text" value={form.clientPhone} onChange={e => update('clientPhone', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Empresa</label>
                <input type="text" value={form.clientCompany} onChange={e => update('clientCompany', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
          </div>

          {/* Financiero */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Estimaciones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Ingresos estimados (€)</label>
                <input type="number" step="0.01" value={form.estimatedRevenue} onChange={e => update('estimatedRevenue', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Coste estimado (€)</label>
                <input type="number" step="0.01" value={form.estimatedCost} onChange={e => update('estimatedCost', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
          </div>

          {/* Briefing */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Briefing / Descripción</label>
            <textarea value={form.briefing} onChange={e => update('briefing', e.target.value)} rows={3} placeholder="Descripción general del evento, requisitos especiales..." className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button type="submit" disabled={saving} className="px-6 py-2 text-sm bg-resona text-white rounded-lg hover:bg-resona/90 disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Crear evento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventsManager;
