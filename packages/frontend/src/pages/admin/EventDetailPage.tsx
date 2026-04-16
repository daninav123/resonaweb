import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Users as UsersIcon, Phone, Mail, Building2,
  Clock, CheckCircle2, Circle, Plus, Trash2, Edit, X, Loader2, AlertTriangle,
  Package, FileText, MessageSquare, Camera, Save, ChevronDown, MoreHorizontal,
  CircleDot, DollarSign, Wrench,
} from 'lucide-react';
import { eventService } from '../../services/event.service';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

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

const PHASES_ORDER = ['INQUIRY', 'PLANNING', 'PREPARATION', 'SETUP', 'LIVE', 'TEARDOWN', 'REVIEW', 'CLOSED'];
const TABS = [
  { id: 'resumen', label: 'Resumen', icon: CircleDot },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'checklist', label: 'Checklist', icon: CheckCircle2 },
  { id: 'equipo', label: 'Equipos', icon: Package },
  { id: 'personal', label: 'Personal', icon: UsersIcon },
  { id: 'incidencias', label: 'Incidencias', icon: AlertTriangle },
  { id: 'notas', label: 'Notas', icon: MessageSquare },
  { id: 'documentos', label: 'Docs', icon: FileText },
];

const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
const formatDateTime = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const formatCurrency = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`;

// ============= COMPONENT =============
const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumen');
  const [saving, setSaving] = useState(false);

  const loadEvent = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const result = await eventService.getById(id);
      setEvent(result);
    } catch (error) {
      toast.error('Error al cargar evento');
      navigate('/admin/events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvent(); }, [id]);

  const handlePhaseChange = async (newPhase: string) => {
    if (!id) return;
    try {
      setSaving(true);
      await eventService.changePhase(id, newPhase);
      toast.success(`Fase cambiada a ${PHASE_CONFIG[newPhase]?.label}`);
      loadEvent();
    } catch (error) {
      toast.error('Error al cambiar fase');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-resona" />
      </div>
    );
  }

  if (!event) return null;

  const phase = PHASE_CONFIG[event.phase] || PHASE_CONFIG.INQUIRY;
  const currentPhaseIndex = PHASES_ORDER.indexOf(event.phase);
  const totalChecklist = event.checklist?.length || 0;
  const completedChecklist = event.checklist?.filter((c: any) => c.completed).length || 0;
  const checklistProgress = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/admin/events" className="p-2 rounded-lg hover:bg-gray-100 mt-1">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm text-gray-400 font-mono">{event.eventNumber}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${phase.bgColor} ${phase.color}`}>
              {phase.label}
            </span>
            <span className="text-xs text-gray-400">{event.eventType}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 truncate">{event.name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(event.eventDate)}</span>
            <span className="flex items-center gap-1"><UsersIcon className="w-4 h-4" /> {event.clientName}</span>
            {event.venueName && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.venueName}</span>}
            {event.attendees && <span className="flex items-center gap-1"><UsersIcon className="w-4 h-4" /> {event.attendees} asistentes</span>}
          </div>
        </div>
      </div>

      {/* Phase Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {PHASES_ORDER.map((p, i) => {
            const conf = PHASE_CONFIG[p];
            const isActive = p === event.phase;
            const isPast = i < currentPhaseIndex;
            const isFuture = i > currentPhaseIndex;
            return (
              <button
                key={p}
                onClick={() => handlePhaseChange(p)}
                disabled={saving}
                className={`flex-1 min-w-[90px] py-2 px-2 rounded-lg text-xs font-medium text-center transition-all
                  ${isActive ? `${conf.bgColor} ${conf.color} ring-2 ring-offset-1 ring-current` : ''}
                  ${isPast ? 'bg-green-50 text-green-700' : ''}
                  ${isFuture ? 'bg-gray-50 text-gray-400 hover:bg-gray-100' : ''}
                  ${!isActive && !isFuture ? 'hover:opacity-80' : ''}
                `}
              >
                {isPast && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                {conf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-100 overflow-x-auto">
          <div className="flex">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                    ${activeTab === tab.id ? 'border-resona text-resona' : 'border-transparent text-gray-500 hover:text-gray-700'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'checklist' && totalChecklist > 0 && (
                    <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">{checklistProgress}%</span>
                  )}
                  {tab.id === 'incidencias' && event.incidents?.filter((i: any) => !i.resolved).length > 0 && (
                    <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                      {event.incidents.filter((i: any) => !i.resolved).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5">
          {activeTab === 'resumen' && <TabResumen event={event} />}
          {activeTab === 'timeline' && <TabTimeline event={event} onRefresh={loadEvent} />}
          {activeTab === 'checklist' && <TabChecklist event={event} onRefresh={loadEvent} />}
          {activeTab === 'equipo' && <TabEquipment event={event} onRefresh={loadEvent} />}
          {activeTab === 'personal' && <TabStaff event={event} onRefresh={loadEvent} />}
          {activeTab === 'incidencias' && <TabIncidents event={event} onRefresh={loadEvent} />}
          {activeTab === 'notas' && <TabNotes event={event} onRefresh={loadEvent} />}
          {activeTab === 'documentos' && <TabDocuments event={event} onRefresh={loadEvent} />}
        </div>
      </div>
    </div>
  );
};

// ============= TAB: RESUMEN =============
const TabResumen = ({ event }: { event: any }) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="space-y-4">
      <Section title="Cliente">
        <InfoRow icon={UsersIcon} label="Nombre" value={event.clientName} />
        {event.clientEmail && <InfoRow icon={Mail} label="Email" value={event.clientEmail} />}
        {event.clientPhone && <InfoRow icon={Phone} label="Teléfono" value={event.clientPhone} />}
        {event.clientCompany && <InfoRow icon={Building2} label="Empresa" value={event.clientCompany} />}
      </Section>
      <Section title="Ubicación">
        {event.venueName && <InfoRow icon={MapPin} label="Venue" value={event.venueName} />}
        {event.venueAddress && <InfoRow icon={MapPin} label="Dirección" value={event.venueAddress} />}
        {event.venuePhone && <InfoRow icon={Phone} label="Tel. venue" value={event.venuePhone} />}
      </Section>
    </div>
    <div className="space-y-4">
      <Section title="Fechas">
        <InfoRow icon={Calendar} label="Evento" value={formatDate(event.eventDate)} />
        {event.eventEndDate && <InfoRow icon={Calendar} label="Fin" value={formatDate(event.eventEndDate)} />}
        {event.setupDate && <InfoRow icon={Clock} label="Montaje" value={formatDateTime(event.setupDate)} />}
        {event.teardownDate && <InfoRow icon={Clock} label="Desmontaje" value={formatDateTime(event.teardownDate)} />}
      </Section>
      <Section title="Financiero">
        {event.estimatedRevenue && <InfoRow icon={DollarSign} label="Ingresos est." value={formatCurrency(Number(event.estimatedRevenue))} />}
        {event.estimatedCost && <InfoRow icon={DollarSign} label="Coste est." value={formatCurrency(Number(event.estimatedCost))} />}
        {event.estimatedRevenue && event.estimatedCost && (
          <InfoRow icon={DollarSign} label="Margen est." value={formatCurrency(Number(event.estimatedRevenue) - Number(event.estimatedCost))} />
        )}
      </Section>
      {event.briefing && (
        <Section title="Briefing">
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.briefing}</p>
        </Section>
      )}
    </div>
  </div>
);

// ============= TAB: TIMELINE =============
const TabTimeline = ({ event, onRefresh }: { event: any; onRefresh: () => void }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ time: '', endTime: '', title: '', description: '', responsible: '' });

  const handleAdd = async () => {
    if (!form.time || !form.title) { toast.error('Hora y título son obligatorios'); return; }
    try {
      await eventService.addTimelineItem(event.id, form);
      toast.success('Añadido al timeline');
      setShowForm(false);
      setForm({ time: '', endTime: '', title: '', description: '', responsible: '' });
      onRefresh();
    } catch { toast.error('Error'); }
  };

  const handleToggle = async (itemId: string) => {
    try {
      await eventService.toggleTimelineItem(event.id, itemId);
      onRefresh();
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await eventService.deleteTimelineItem(event.id, itemId);
      onRefresh();
    } catch { toast.error('Error'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Timeline del evento</h3>
        <button onClick={() => setShowForm(!showForm)} className="text-sm text-resona hover:underline flex items-center gap-1">
          <Plus className="w-4 h-4" /> Añadir
        </button>
      </div>
      {showForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <input type="time" value={form.time} onChange={e => setForm(p => ({...p, time: e.target.value}))} className="px-3 py-2 border rounded-lg text-sm" placeholder="Hora inicio" />
            <input type="time" value={form.endTime} onChange={e => setForm(p => ({...p, endTime: e.target.value}))} className="px-3 py-2 border rounded-lg text-sm" placeholder="Hora fin" />
            <input type="text" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className="px-3 py-2 border rounded-lg text-sm" placeholder="Actividad" />
            <input type="text" value={form.responsible} onChange={e => setForm(p => ({...p, responsible: e.target.value}))} className="px-3 py-2 border rounded-lg text-sm" placeholder="Responsable" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-3 py-1.5 text-sm bg-resona text-white rounded-lg">Guardar</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {(event.timeline || []).map((item: any) => (
          <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border ${item.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
            <button onClick={() => handleToggle(item.id)} className="flex-shrink-0">
              {item.completed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-gray-300" />}
            </button>
            <div className="flex-shrink-0 text-sm font-mono text-gray-500 w-20">
              {item.time}{item.endTime ? ` - ${item.endTime}` : ''}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${item.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>{item.title}</p>
              {item.responsible && <p className="text-xs text-gray-400">{item.responsible}</p>}
            </div>
            <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        {(event.timeline || []).length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sin items en el timeline</p>}
      </div>
    </div>
  );
};

// ============= TAB: CHECKLIST =============
const TabChecklist = ({ event, onRefresh }: { event: any; onRefresh: () => void }) => {
  const [newItem, setNewItem] = useState('');

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    try {
      await eventService.addChecklistItem(event.id, { text: newItem });
      setNewItem('');
      onRefresh();
    } catch { toast.error('Error'); }
  };

  const handleToggle = async (itemId: string) => {
    try { await eventService.toggleChecklistItem(event.id, itemId); onRefresh(); } catch { toast.error('Error'); }
  };

  const handleDelete = async (itemId: string) => {
    try { await eventService.deleteChecklistItem(event.id, itemId); onRefresh(); } catch { toast.error('Error'); }
  };

  const total = event.checklist?.length || 0;
  const completed = event.checklist?.filter((c: any) => c.completed).length || 0;
  const categories: string[] = [...new Set((event.checklist || []).map((c: any) => c.category || 'General'))] as string[];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Checklist</h3>
          <p className="text-sm text-gray-500">{completed}/{total} completados ({total > 0 ? Math.round((completed/total)*100) : 0}%)</p>
        </div>
        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${total > 0 ? (completed/total)*100 : 0}%` }} />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <input type="text" value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="Nuevo item..." className="flex-1 px-3 py-2 border rounded-lg text-sm" />
        <button onClick={handleAdd} className="px-3 py-2 bg-resona text-white rounded-lg text-sm"><Plus className="w-4 h-4" /></button>
      </div>
      {categories.map(cat => (
        <div key={cat} className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{cat}</p>
          <div className="space-y-1">
            {(event.checklist || []).filter((c: any) => (c.category || 'General') === cat).map((item: any) => (
              <div key={item.id} className="flex items-center gap-2 py-1.5">
                <button onClick={() => handleToggle(item.id)}>
                  {item.completed ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Circle className="w-5 h-5 text-gray-300" />}
                </button>
                <span className={`text-sm flex-1 ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {item.text}
                  {item.isRequired && <span className="text-red-500 ml-1">*</span>}
                </span>
                {item.completedBy && <span className="text-xs text-gray-400">{item.completedBy}</span>}
                <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============= TAB: EQUIPMENT =============
const TabEquipment = ({ event, onRefresh }: { event: any; onRefresh: () => void }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productName: '', quantity: '1', notes: '' });

  const handleAdd = async () => {
    if (!form.productName) return;
    try {
      await eventService.addEquipment(event.id, { ...form, quantity: parseInt(form.quantity) || 1 });
      setForm({ productName: '', quantity: '1', notes: '' });
      setShowForm(false);
      onRefresh();
    } catch { toast.error('Error'); }
  };

  const handleToggle = async (itemId: string, field: 'pickedUp' | 'returned', current: boolean) => {
    try {
      await eventService.updateEquipment(event.id, itemId, { [field]: !current });
      onRefresh();
    } catch { toast.error('Error'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Equipos asignados ({event.equipment?.length || 0})</h3>
        <button onClick={() => setShowForm(!showForm)} className="text-sm text-resona hover:underline flex items-center gap-1">
          <Plus className="w-4 h-4" /> Añadir
        </button>
      </div>
      {showForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg flex gap-3">
          <input type="text" value={form.productName} onChange={e => setForm(p => ({...p, productName: e.target.value}))} placeholder="Nombre del equipo" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
          <input type="number" value={form.quantity} onChange={e => setForm(p => ({...p, quantity: e.target.value}))} className="w-20 px-3 py-2 border rounded-lg text-sm" />
          <button onClick={handleAdd} className="px-3 py-2 bg-resona text-white rounded-lg text-sm">Añadir</button>
        </div>
      )}
      <div className="space-y-2">
        {(event.equipment || []).map((eq: any) => (
          <div key={eq.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
            <Package className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{eq.productName}</p>
              <p className="text-xs text-gray-400">Qty: {eq.quantity}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleToggle(eq.id, 'pickedUp', eq.pickedUp)}
                className={`px-2 py-1 rounded text-xs font-medium ${eq.pickedUp ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {eq.pickedUp ? '✓ Preparado' : 'Preparar'}
              </button>
              <button onClick={() => handleToggle(eq.id, 'returned', eq.returned)}
                className={`px-2 py-1 rounded text-xs font-medium ${eq.returned ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {eq.returned ? '✓ Devuelto' : 'Devolver'}
              </button>
            </div>
          </div>
        ))}
        {(event.equipment || []).length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sin equipos asignados</p>}
      </div>
    </div>
  );
};

// ============= TAB: STAFF =============
const TabStaff = ({ event, onRefresh }: { event: any; onRefresh: () => void }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ staffName: '', role: '', staffPhone: '', startTime: '', endTime: '', hourlyRate: '' });

  const handleAdd = async () => {
    if (!form.staffName || !form.role) { toast.error('Nombre y rol obligatorios'); return; }
    try {
      await eventService.addStaff(event.id, { ...form, hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : undefined });
      setForm({ staffName: '', role: '', staffPhone: '', startTime: '', endTime: '', hourlyRate: '' });
      setShowForm(false);
      onRefresh();
    } catch { toast.error('Error'); }
  };

  const handleConfirm = async (itemId: string, current: boolean) => {
    try { await eventService.updateStaff(event.id, itemId, { confirmed: !current }); onRefresh(); } catch { toast.error('Error'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Personal ({event.staff?.length || 0})</h3>
        <button onClick={() => setShowForm(!showForm)} className="text-sm text-resona hover:underline flex items-center gap-1">
          <Plus className="w-4 h-4" /> Añadir
        </button>
      </div>
      {showForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input type="text" value={form.staffName} onChange={e => setForm(p => ({...p, staffName: e.target.value}))} placeholder="Nombre" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))} placeholder="Rol (DJ, Técnico...)" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={form.staffPhone} onChange={e => setForm(p => ({...p, staffPhone: e.target.value}))} placeholder="Teléfono" className="px-3 py-2 border rounded-lg text-sm" />
            <input type="time" value={form.startTime} onChange={e => setForm(p => ({...p, startTime: e.target.value}))} className="px-3 py-2 border rounded-lg text-sm" />
            <input type="time" value={form.endTime} onChange={e => setForm(p => ({...p, endTime: e.target.value}))} className="px-3 py-2 border rounded-lg text-sm" />
            <input type="number" value={form.hourlyRate} onChange={e => setForm(p => ({...p, hourlyRate: e.target.value}))} placeholder="€/hora" className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <button onClick={handleAdd} className="px-3 py-1.5 text-sm bg-resona text-white rounded-lg">Guardar</button>
        </div>
      )}
      <div className="space-y-2">
        {(event.staff || []).map((s: any) => (
          <div key={s.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s.confirmed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {s.staffName.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{s.staffName}</p>
              <p className="text-xs text-gray-500">{s.role} {s.startTime && `· ${s.startTime}${s.endTime ? ` - ${s.endTime}` : ''}`}</p>
            </div>
            <button onClick={() => handleConfirm(s.id, s.confirmed)}
              className={`px-2 py-1 rounded text-xs font-medium ${s.confirmed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {s.confirmed ? '✓ Confirmado' : 'Pendiente'}
            </button>
          </div>
        ))}
        {(event.staff || []).length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sin personal asignado</p>}
      </div>
    </div>
  );
};

// ============= TAB: INCIDENTS =============
const TabIncidents = ({ event, onRefresh }: { event: any; onRefresh: () => void }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', severity: 'medium', category: '' });

  const handleAdd = async () => {
    if (!form.title || !form.description) return;
    try {
      await eventService.addIncident(event.id, form);
      setForm({ title: '', description: '', severity: 'medium', category: '' });
      setShowForm(false);
      onRefresh();
      toast.success('Incidencia registrada');
    } catch { toast.error('Error'); }
  };

  const handleResolve = async (itemId: string) => {
    const resolution = prompt('Descripción de la resolución:');
    if (!resolution) return;
    try {
      await eventService.resolveIncident(event.id, itemId, { resolution });
      onRefresh();
      toast.success('Incidencia resuelta');
    } catch { toast.error('Error'); }
  };

  const SEVERITY_COLORS: Record<string, string> = {
    low: 'bg-blue-100 text-blue-700', medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700', critical: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Incidencias</h3>
        <button onClick={() => setShowForm(!showForm)} className="text-sm text-red-600 hover:underline flex items-center gap-1">
          <AlertTriangle className="w-4 h-4" /> Reportar
        </button>
      </div>
      {showForm && (
        <div className="mb-4 p-4 bg-red-50 rounded-lg space-y-3">
          <input type="text" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Título" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Descripción..." rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
          <div className="flex gap-3">
            <select value={form.severity} onChange={e => setForm(p => ({...p, severity: e.target.value}))} className="px-3 py-2 border rounded-lg text-sm bg-white">
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
            <button onClick={handleAdd} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg">Registrar</button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {(event.incidents || []).map((inc: any) => (
          <div key={inc.id} className={`p-3 rounded-lg border ${inc.resolved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className={`w-4 h-4 mt-0.5 ${inc.resolved ? 'text-green-500' : 'text-red-500'}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900">{inc.title}</p>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${SEVERITY_COLORS[inc.severity] || SEVERITY_COLORS.medium}`}>{inc.severity}</span>
                </div>
                <p className="text-xs text-gray-600">{inc.description}</p>
                {inc.resolved && <p className="text-xs text-green-600 mt-1">Resuelto: {inc.resolution}</p>}
              </div>
              {!inc.resolved && (
                <button onClick={() => handleResolve(inc.id)} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">Resolver</button>
              )}
            </div>
          </div>
        ))}
        {(event.incidents || []).length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sin incidencias</p>}
      </div>
    </div>
  );
};

// ============= TAB: NOTES =============
const TabNotes = ({ event, onRefresh }: { event: any; onRefresh: () => void }) => {
  const [newNote, setNewNote] = useState('');

  const handleAdd = async () => {
    if (!newNote.trim()) return;
    try {
      await eventService.addNote(event.id, { content: newNote });
      setNewNote('');
      onRefresh();
    } catch { toast.error('Error'); }
  };

  return (
    <div>
      <div className="mb-4">
        <textarea value={newNote} onChange={e => setNewNote(e.target.value)} rows={3} placeholder="Escribir nota..." className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
        <button onClick={handleAdd} disabled={!newNote.trim()} className="mt-2 px-4 py-2 text-sm bg-resona text-white rounded-lg disabled:opacity-50">
          <Plus className="w-4 h-4 inline mr-1" /> Añadir nota
        </button>
      </div>
      <div className="space-y-3">
        {(event.notes || []).map((note: any) => (
          <div key={note.id} className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-yellow-800">{note.authorName}</span>
              <span className="text-xs text-yellow-600">{formatDateTime(note.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
          </div>
        ))}
        {(event.notes || []).length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sin notas</p>}
      </div>
    </div>
  );
};

// ============= TAB: DOCUMENTS =============
const TabDocuments = ({ event, onRefresh }: { event: any; onRefresh: () => void }) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-gray-900">Documentos ({event.documents?.length || 0})</h3>
    </div>
    <div className="space-y-2">
      {(event.documents || []).map((doc: any) => (
        <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50">
          <FileText className="w-5 h-5 text-blue-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
            <p className="text-xs text-gray-400">{doc.type} {doc.uploadedBy && `· ${doc.uploadedBy}`}</p>
          </div>
        </a>
      ))}
      {(event.documents || []).length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sin documentos</p>}
    </div>
  </div>
);

// ============= HELPERS =============
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-center gap-2 text-sm">
    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
    <span className="text-gray-500 w-24 flex-shrink-0">{label}</span>
    <span className="text-gray-900">{value}</span>
  </div>
);

export default EventDetailPage;
