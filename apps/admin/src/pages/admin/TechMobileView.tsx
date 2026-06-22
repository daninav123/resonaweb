import { useState, useEffect } from 'react';
import { api } from '@resona/api-client';
import { Loader2, MapPin, Phone, Truck, ChevronRight, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

interface EventAssignment {
  id: string; name: string; eventType: string; eventDate: string; eventEndDate?: string;
  venueName?: string; venueAddress?: string; venuePhone?: string;
  phase: string; clientName: string; clientPhone?: string;
  briefing?: string; technicalNotes?: string;
}

const PHASE_COLORS: Record<string, string> = {
  SETUP: 'bg-blue-500', LIVE: 'bg-green-500', TEARDOWN: 'bg-orange-500',
  CONFIRMED: 'bg-emerald-500', IN_PROGRESS: 'bg-blue-500',
};

const TechMobileView = () => {
  const [events, setEvents] = useState<EventAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventAssignment | null>(null);
  const [view, setView] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const start = new Date(now); start.setDate(start.getDate() - 1);
        const end = new Date(now); end.setDate(end.getDate() + 14);
        const res: any = await api.get(`/events?dateFrom=${start.toISOString()}&dateTo=${end.toISOString()}&limit=20`);
        const data = Array.isArray(res) ? res : res?.data || res?.events || [];
        setEvents(data);
      } catch { toast.error('Error cargando eventos'); } finally { setLoading(false); }
    };
    load();
  }, []);

  const isToday = (d: string) => new Date(d).toDateString() === new Date().toDateString();
  const isTomorrow = (d: string) => {
    const t = new Date(); t.setDate(t.getDate() + 1);
    return new Date(d).toDateString() === t.toDateString();
  };
  const getDayLabel = (d: string) => {
    if (isToday(d)) return 'HOY';
    if (isTomorrow(d)) return 'MAÑANA';
    return new Date(d).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (view === 'detail' && selectedEvent) {
    const e = selectedEvent;
    return (
      <div className="space-y-4 pb-20">
        <button onClick={() => setView('list')} className="text-blue-600 text-sm font-medium">&larr; Volver</button>

        <div className="bg-white rounded-xl shadow-lg p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-xs font-bold px-2 py-0.5 rounded-full text-white inline-block ${PHASE_COLORS[e.phase] || 'bg-gray-500'}`}>{e.phase}</p>
              <h2 className="text-xl font-bold mt-1">{e.name}</h2>
              <p className="text-gray-500">{e.eventType}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">{getDayLabel(e.eventDate)}</p>
                <p className="text-sm text-gray-600">{new Date(e.eventDate).toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                {e.eventEndDate && <p className="text-xs text-gray-400">Hasta: {new Date(e.eventEndDate).toLocaleString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>}
              </div>
            </div>

            {e.venueName && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">{e.venueName}</p>
                  {e.venueAddress && <p className="text-sm text-gray-600">{e.venueAddress}</p>}
                  {e.venuePhone && (
                    <a href={`tel:${e.venuePhone}`} className="text-blue-600 text-sm flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {e.venuePhone}</a>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">{e.clientName}</p>
                {e.clientPhone && <a href={`tel:${e.clientPhone}`} className="text-blue-600 text-sm">{e.clientPhone}</a>}
              </div>
            </div>
          </div>

          {e.briefing && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Briefing</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{e.briefing}</p>
            </div>
          )}

          {e.technicalNotes && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Notas Técnicas</p>
              <p className="text-sm text-gray-700 whitespace-pre-line bg-yellow-50 p-3 rounded-lg">{e.technicalNotes}</p>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          {e.venueAddress && (
            <a href={`https://maps.google.com/?q=${encodeURIComponent(e.venueAddress)}`} target="_blank" rel="noreferrer"
              className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-medium">
              <MapPin className="w-4 h-4" /> Navegar
            </a>
          )}
          {e.clientPhone && (
            <a href={`tel:${e.clientPhone}`}
              className="flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-medium">
              <Phone className="w-4 h-4" /> Llamar cliente
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Mis Eventos</h1>
        <p className="text-sm text-gray-500">Próximos 14 días</p>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No hay eventos próximos</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEvents.map(e => (
            <button key={e.id} onClick={() => { setSelectedEvent(e); setView('detail'); }}
              className="w-full text-left bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${isToday(e.eventDate) ? 'bg-red-500 animate-pulse' : isTomorrow(e.eventDate) ? 'bg-orange-500' : 'bg-blue-500'}`} />
                    <span className={`text-xs font-bold ${isToday(e.eventDate) ? 'text-red-600' : 'text-gray-500'}`}>{getDayLabel(e.eventDate)}</span>
                    <span className="text-xs text-gray-400">{new Date(e.eventDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="font-semibold text-gray-900 truncate">{e.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> {e.eventType}</span>
                    {e.venueName && <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3" /> {e.venueName}</span>}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechMobileView;
