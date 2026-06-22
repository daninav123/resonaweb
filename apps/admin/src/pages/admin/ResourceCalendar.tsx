import { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, Users, Package, AlertTriangle,
  Loader2, Eye, RefreshCw, Filter,
} from 'lucide-react';
import { eventService } from '../../services/event.service';
import toast from 'react-hot-toast';

// ============= TYPES =============
interface EventData {
  id: string;
  eventNumber: string;
  name: string;
  eventType: string;
  phase: string;
  eventDate: string;
  eventEndDate: string | null;
  setupDate: string | null;
  teardownDate: string | null;
  clientName: string;
  staff: { id: string; staffName: string; role: string; confirmed: boolean; startTime: string | null; endTime: string | null }[];
  equipment: { id: string; productName: string; quantity: number; pickedUp: boolean; returned: boolean }[];
}

interface DayCell {
  date: Date;
  isToday: boolean;
  isWeekend: boolean;
  events: EventData[];
}

// ============= HELPERS =============
const EVENT_COLORS: Record<string, string> = {
  Boda: 'bg-pink-200 border-pink-400 text-pink-800',
  Concierto: 'bg-purple-200 border-purple-400 text-purple-800',
  Festival: 'bg-indigo-200 border-indigo-400 text-indigo-800',
  Corporativo: 'bg-blue-200 border-blue-400 text-blue-800',
  'Cumpleaños': 'bg-yellow-200 border-yellow-400 text-yellow-800',
  'Comunión': 'bg-teal-200 border-teal-400 text-teal-800',
  'Fiesta privada': 'bg-orange-200 border-orange-400 text-orange-800',
  Otro: 'bg-gray-200 border-gray-400 text-gray-800',
};

const PHASE_LABELS: Record<string, string> = {
  INQUIRY: 'Consulta', PLANNING: 'Planif.', PREPARATION: 'Prepar.',
  SETUP: 'Montaje', LIVE: 'En curso', TEARDOWN: 'Desmont.',
  REVIEW: 'Revisión', CLOSED: 'Cerrado',
};

const formatDate = (d: Date) => d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const isDateInRange = (date: Date, start: Date, end: Date) => date >= start && date <= end;

// ============= MAIN COMPONENT =============
const ResourceCalendar = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'timeline' | 'staff' | 'equipment'>('timeline');
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const result: any = await eventService.list({ limit: 100, page: 1 });
      setEvents(result.data || []);
    } catch { toast.error('Error al cargar eventos'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadEvents(); }, []);

  // Generar dias del mes
  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const result: DayCell[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dayEvents = events.filter(ev => {
        const evStart = new Date(ev.setupDate || ev.eventDate);
        const evEnd = new Date(ev.teardownDate || ev.eventEndDate || ev.eventDate);
        evStart.setHours(0, 0, 0, 0);
        evEnd.setHours(23, 59, 59, 999);
        return isDateInRange(date, evStart, evEnd);
      });
      result.push({
        date,
        isToday: isSameDay(date, today),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        events: dayEvents,
      });
    }
    return result;
  }, [currentDate, events]);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthLabel = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  // Detectar conflictos
  const conflicts = useMemo(() => {
    const issues: { date: Date; type: string; resource: string; events: string[] }[] = [];
    days.forEach(day => {
      if (day.events.length < 2) return;
      // Detectar conflictos de personal (misma persona en dos eventos)
      const staffMap: Record<string, string[]> = {};
      day.events.forEach(ev => {
        (ev.staff || []).forEach(s => {
          const key = s.staffName.toLowerCase();
          if (!staffMap[key]) staffMap[key] = [];
          staffMap[key].push(ev.eventNumber);
        });
      });
      Object.entries(staffMap).forEach(([name, evts]) => {
        if (evts.length > 1) {
          issues.push({ date: day.date, type: 'personal', resource: name, events: evts });
        }
      });
      // Detectar conflictos de equipos (mismo equipo en dos eventos)
      const eqMap: Record<string, string[]> = {};
      day.events.forEach(ev => {
        (ev.equipment || []).forEach(eq => {
          const key = eq.productName.toLowerCase();
          if (!eqMap[key]) eqMap[key] = [];
          eqMap[key].push(ev.eventNumber);
        });
      });
      Object.entries(eqMap).forEach(([name, evts]) => {
        if (evts.length > 1) {
          issues.push({ date: day.date, type: 'equipo', resource: name, events: evts });
        }
      });
    });
    return issues;
  }, [days]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-resona" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario de Recursos</h1>
          <p className="text-gray-500 mt-1">{events.length} eventos cargados</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {(['timeline', 'staff', 'equipment'] as const).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`px-3 py-2 text-sm ${viewMode === mode ? 'bg-resona text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                {mode === 'timeline' ? 'Timeline' : mode === 'staff' ? 'Personal' : 'Equipos'}
              </button>
            ))}
          </div>
          <button onClick={loadEvents} className="p-2 rounded-lg border hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-800">{conflicts.length} conflictos detectados</h3>
          </div>
          <div className="space-y-1">
            {conflicts.slice(0, 5).map((c, i) => (
              <p key={i} className="text-sm text-red-700">
                <span className="font-medium">{formatDate(c.date)}</span>: {c.type} "{c.resource}" en {c.events.join(' y ')}
              </p>
            ))}
            {conflicts.length > 5 && <p className="text-xs text-red-500">...y {conflicts.length - 5} más</p>}
          </div>
        </div>
      )}

      {/* Month Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100"><ChevronLeft className="w-5 h-5" /></button>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900 capitalize">{monthLabel}</h2>
            <button onClick={goToToday} className="text-xs px-2 py-1 text-resona border border-resona/30 rounded hover:bg-resona/5">Hoy</button>
          </div>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100"><ChevronRight className="w-5 h-5" /></button>
        </div>

        {/* View Content */}
        {viewMode === 'timeline' && <TimelineView days={days} conflicts={conflicts} onEventClick={setSelectedEvent} />}
        {viewMode === 'staff' && <StaffView events={events} days={days} />}
        {viewMode === 'equipment' && <EquipmentView events={events} days={days} />}
      </div>

      {/* Event Detail Popup */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 text-lg mb-2">{selectedEvent.name}</h3>
            <p className="text-sm text-gray-500 mb-1">{selectedEvent.eventNumber} · {selectedEvent.eventType}</p>
            <p className="text-sm text-gray-500 mb-3">{selectedEvent.clientName} · {PHASE_LABELS[selectedEvent.phase]}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded"><p className="text-xs text-gray-500">Evento</p><p>{new Date(selectedEvent.eventDate).toLocaleDateString('es-ES')}</p></div>
              {selectedEvent.setupDate && <div className="bg-gray-50 p-2 rounded"><p className="text-xs text-gray-500">Montaje</p><p>{new Date(selectedEvent.setupDate).toLocaleDateString('es-ES')}</p></div>}
              <div className="bg-gray-50 p-2 rounded"><p className="text-xs text-gray-500">Personal</p><p>{selectedEvent.staff?.length || 0}</p></div>
              <div className="bg-gray-50 p-2 rounded"><p className="text-xs text-gray-500">Equipos</p><p>{selectedEvent.equipment?.length || 0}</p></div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setSelectedEvent(null)} className="px-3 py-1.5 text-sm text-gray-500">Cerrar</button>
              <a href={`/admin/events/${selectedEvent.id}`} className="px-3 py-1.5 text-sm bg-resona text-white rounded-lg">Ver detalle</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============= TIMELINE VIEW =============
const TimelineView = ({ days, conflicts, onEventClick }: { days: DayCell[]; conflicts: any[]; onEventClick: (e: EventData) => void }) => {
  const DAYS_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Day headers */}
        <div className="grid gap-px bg-gray-200" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(30px, 1fr))` }}>
          {days.map((day) => (
            <div key={day.date.toISOString()}
              className={`text-center py-1.5 text-xs font-medium ${day.isToday ? 'bg-resona text-white' : day.isWeekend ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-600'}`}>
              <div>{DAYS_LABELS[day.date.getDay()]}</div>
              <div className="text-sm font-bold">{day.date.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Event rows */}
        <div className="grid gap-px bg-gray-200 mt-px" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(30px, 1fr))` }}>
          {days.map((day) => {
            const hasConflict = conflicts.some(c => isSameDay(c.date, day.date));
            return (
              <div key={day.date.toISOString()}
                className={`min-h-[60px] p-0.5 ${hasConflict ? 'bg-red-50' : day.isWeekend ? 'bg-gray-50' : 'bg-white'}`}>
                {day.events.map(ev => {
                  const colors = EVENT_COLORS[ev.eventType] || EVENT_COLORS.Otro;
                  return (
                    <button key={ev.id} onClick={() => onEventClick(ev)}
                      className={`w-full text-left px-1 py-0.5 rounded text-[10px] font-medium truncate border mb-0.5 ${colors}`}>
                      {ev.name.slice(0, 12)}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============= STAFF VIEW =============
const StaffView = ({ events, days }: { events: EventData[]; days: DayCell[] }) => {
  const allStaff = useMemo(() => {
    const staffMap: Record<string, { name: string; events: { eventId: string; eventNumber: string; eventName: string; date: string }[] }> = {};
    events.forEach(ev => {
      (ev.staff || []).forEach(s => {
        const key = s.staffName.toLowerCase();
        if (!staffMap[key]) staffMap[key] = { name: s.staffName, events: [] };
        staffMap[key].events.push({ eventId: ev.id, eventNumber: ev.eventNumber, eventName: ev.name, date: ev.eventDate });
      });
    });
    return Object.values(staffMap).sort((a, b) => b.events.length - a.events.length);
  }, [events]);

  if (allStaff.length === 0) {
    return <p className="text-center text-gray-400 py-8">No hay personal asignado a eventos</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-2 font-semibold text-gray-700 w-40 sticky left-0 bg-gray-50">Personal</th>
            {days.map(d => (
              <th key={d.date.toISOString()} className={`text-center p-1 text-xs min-w-[28px] ${d.isToday ? 'bg-resona text-white' : d.isWeekend ? 'text-gray-400' : 'text-gray-600'}`}>
                {d.date.getDate()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allStaff.map(person => (
            <tr key={person.name} className="border-t border-gray-100">
              <td className="p-2 font-medium text-gray-900 sticky left-0 bg-white">{person.name}</td>
              {days.map(d => {
                const busy = events.some(ev => {
                  const evStart = new Date(ev.setupDate || ev.eventDate);
                  const evEnd = new Date(ev.teardownDate || ev.eventEndDate || ev.eventDate);
                  evStart.setHours(0, 0, 0, 0);
                  evEnd.setHours(23, 59, 59, 999);
                  return isDateInRange(d.date, evStart, evEnd) && (ev.staff || []).some(s => s.staffName.toLowerCase() === person.name.toLowerCase());
                });
                return (
                  <td key={d.date.toISOString()} className={`text-center p-0 ${d.isWeekend ? 'bg-gray-50' : ''}`}>
                    {busy && <div className="w-full h-6 bg-blue-200 rounded-sm" title="Ocupado" />}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============= EQUIPMENT VIEW =============
const EquipmentView = ({ events, days }: { events: EventData[]; days: DayCell[] }) => {
  const allEquipment = useMemo(() => {
    const eqMap: Record<string, { name: string; totalQty: number; events: string[] }> = {};
    events.forEach(ev => {
      (ev.equipment || []).forEach(eq => {
        const key = eq.productName.toLowerCase();
        if (!eqMap[key]) eqMap[key] = { name: eq.productName, totalQty: eq.quantity, events: [] };
        eqMap[key].events.push(ev.id);
      });
    });
    return Object.values(eqMap).sort((a, b) => b.events.length - a.events.length);
  }, [events]);

  if (allEquipment.length === 0) {
    return <p className="text-center text-gray-400 py-8">No hay equipos asignados a eventos</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-2 font-semibold text-gray-700 w-48 sticky left-0 bg-gray-50">Equipo</th>
            {days.map(d => (
              <th key={d.date.toISOString()} className={`text-center p-1 text-xs min-w-[28px] ${d.isToday ? 'bg-resona text-white' : d.isWeekend ? 'text-gray-400' : 'text-gray-600'}`}>
                {d.date.getDate()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allEquipment.map(eq => (
            <tr key={eq.name} className="border-t border-gray-100">
              <td className="p-2 font-medium text-gray-900 sticky left-0 bg-white">
                <div>{eq.name}</div>
              </td>
              {days.map(d => {
                const usedBy = events.filter(ev => {
                  const evStart = new Date(ev.setupDate || ev.eventDate);
                  const evEnd = new Date(ev.teardownDate || ev.eventEndDate || ev.eventDate);
                  evStart.setHours(0, 0, 0, 0);
                  evEnd.setHours(23, 59, 59, 999);
                  return isDateInRange(d.date, evStart, evEnd) && (ev.equipment || []).some(e => e.productName.toLowerCase() === eq.name.toLowerCase());
                });
                const conflict = usedBy.length > 1;
                return (
                  <td key={d.date.toISOString()} className={`text-center p-0 ${d.isWeekend ? 'bg-gray-50' : ''}`}>
                    {usedBy.length > 0 && (
                      <div className={`w-full h-6 rounded-sm ${conflict ? 'bg-red-300' : 'bg-green-200'}`}
                        title={usedBy.map(e => e.eventNumber).join(', ')} />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResourceCalendar;
