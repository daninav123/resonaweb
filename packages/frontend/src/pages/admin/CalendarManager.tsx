import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, Plus, Loader2, Package, MapPin, DollarSign, User, Phone, Download, ExternalLink } from 'lucide-react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { calendarService, CalendarEvent, CalendarStats } from '../../services/calendar.service';
import toast from 'react-hot-toast';

// Configurar moment para español
moment.locale('es');
const localizer = momentLocalizer(moment);

const CalendarManager = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [stats, setStats] = useState<CalendarStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  // Cargar eventos y estadísticas
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calcular rango de fechas basado en la vista
      const startDate = moment(date).startOf(view === 'month' ? 'month' : view === 'week' ? 'week' : 'day').toISOString();
      const endDate = moment(date).endOf(view === 'month' ? 'month' : view === 'week' ? 'week' : 'day').toISOString();
      
      const [eventsData, statsData] = await Promise.all([
        calendarService.getEvents(startDate, endDate),
        calendarService.getStats(date.getMonth() + 1, date.getFullYear()),
      ]);
      
      // Convertir strings de fecha a objetos Date
      const eventsWithDates = eventsData.events.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
      
      setEvents(eventsWithDates);
      setStats(statsData);
    } catch (error: any) {
      console.error('Error loading calendar:', error);
      toast.error('Error al cargar el calendario');
    } finally {
      setLoading(false);
    }
  }, [date, view]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Estilo personalizado para eventos
  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.resource.color,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  // Manejar selección de evento
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  // Cerrar modal de detalles
  const closeModal = () => {
    setSelectedEvent(null);
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  // Manejar exportación a iCalendar
  const handleExportCalendar = () => {
    try {
      const startDate = moment(date).startOf('month').toISOString();
      const endDate = moment(date).endOf('month').toISOString();
      
      calendarService.exportCalendar(startDate, endDate);
      toast.success('Calendario exportado correctamente');
    } catch (error) {
      console.error('Error exporting calendar:', error);
      toast.error('Error al exportar el calendario');
    }
  };

  // Abrir en Google Calendar
  const handleOpenInGoogleCalendar = () => {
    const url = calendarService.getExportUrl();
    toast.success('Usa este archivo para importar en Google Calendar');
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-resona mx-auto mb-4" />
          <p className="text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/admin" className="text-resona hover:text-resona-dark mb-4 inline-block">
            ← Volver al Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendario de Eventos</h1>
              <p className="text-gray-600 mt-1">{events.length} eventos este mes</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportCalendar}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                title="Descargar archivo .ics"
              >
                <Download className="w-5 h-5" />
                Exportar .ics
              </button>
              <button
                onClick={handleOpenInGoogleCalendar}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                title="Abrir en Google Calendar"
              >
                <ExternalLink className="w-5 h-5" />
                Google Calendar
              </button>
              <Link
                to="/admin/orders"
                className="bg-resona text-white px-4 py-2 rounded-lg hover:bg-resona-dark transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Nuevo Pedido
              </Link>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Total Eventos</p>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Confirmados</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.ordersByStatus.CONFIRMED || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.ordersByStatus.PENDING || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-resona">
                €{stats.monthRevenue.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Calendar View */}
        <div className="bg-white rounded-lg shadow p-6 mb-6" style={{ height: '700px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            view={view}
            onView={handleViewChange}
            date={date}
            onNavigate={handleNavigate}
            messages={{
              next: 'Siguiente',
              previous: 'Anterior',
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              agenda: 'Agenda',
              date: 'Fecha',
              time: 'Hora',
              event: 'Evento',
              noEventsInRange: 'No hay eventos en este rango de fechas',
              showMore: (total) => `+ Ver más (${total})`,
            }}
          />
        </div>

        {/* Upcoming Events */}
        {stats && stats.upcomingEvents.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Próximos Eventos (7 días)</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {stats.upcomingEvents.map((event) => (
                <div key={event.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {event.orderNumber}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            event.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-800'
                              : event.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Cliente: {event.client}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        Productos: {event.products}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <DollarSign className="w-4 h-4" />
                        Total: €{event.total.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-resona">
                        {moment(event.startDate).format('DD/MM/YYYY')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {moment(event.startDate).format('HH:mm')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.eventType || 'Evento'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de detalles del evento */}
        {selectedEvent && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedEvent.resource.orderNumber}
                  </h2>
                  <p className="text-gray-600 mt-1">{selectedEvent.resource.eventType || 'Evento'}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Estado */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Estado</p>
                    <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded mt-1 ${
                        selectedEvent.resource.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : selectedEvent.resource.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : selectedEvent.resource.status === 'COMPLETED'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedEvent.resource.status}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Estado de Pago</p>
                    <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded mt-1 ${
                        selectedEvent.resource.paymentStatus === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {selectedEvent.resource.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Inicio</p>
                    <p className="font-medium">{moment(selectedEvent.start).format('DD/MM/YYYY HH:mm')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fin</p>
                    <p className="font-medium">{moment(selectedEvent.end).format('DD/MM/YYYY HH:mm')}</p>
                  </div>
                </div>

                {/* Cliente */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Cliente</p>
                  <div className="space-y-1">
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{selectedEvent.resource.client}</span>
                    </p>
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{selectedEvent.resource.clientEmail}</span>
                    </p>
                  </div>
                </div>

                {/* Contacto del evento */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Contacto del Evento</p>
                  <div className="space-y-1">
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{selectedEvent.resource.contactPerson}</span>
                    </p>
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedEvent.resource.contactPhone}</span>
                    </p>
                  </div>
                </div>

                {/* Productos */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Productos ({selectedEvent.resource.itemCount})</p>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm">{selectedEvent.resource.products}</p>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total:</span>
                    <span className="text-2xl font-bold text-resona">
                      €{selectedEvent.resource.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Notas */}
                {selectedEvent.resource.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Notas</p>
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                      <p className="text-sm">{selectedEvent.resource.notes}</p>
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4">
                  <Link
                    to={`/admin/orders/${selectedEvent.id}`}
                    className="flex-1 bg-resona text-white py-2 px-4 rounded-lg hover:bg-resona-dark transition-colors text-center"
                  >
                    Ver Detalles Completos
                  </Link>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarManager;
