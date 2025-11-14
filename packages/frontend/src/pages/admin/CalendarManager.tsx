import { Link } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';

const CalendarManager = () => {
  const events = [
    { id: 1, title: 'Boda - Sala Principal', date: '2024-11-15', time: '18:00', client: 'Juan & María', equipment: 'Sonido + Iluminación' },
    { id: 2, title: 'Concierto - Auditorio', date: '2024-11-20', time: '20:00', client: 'Banda XYZ', equipment: 'Sonido Pro + Luces' },
    { id: 3, title: 'Evento Corporativo', date: '2024-11-25', time: '10:00', client: 'Empresa ABC', equipment: 'Proyector + Micros' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/admin" className="text-resona hover:text-resona-dark mb-4 inline-block">
            ← Volver al Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Calendario de Eventos</h1>
            <button className="bg-resona text-white px-4 py-2 rounded-lg hover:bg-resona-dark transition-colors flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nuevo Evento
            </button>
          </div>
        </div>

        {/* Calendar View Placeholder */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Vista de Calendario</p>
              <p className="text-sm text-gray-500 mt-2">Integrar componente de calendario aquí</p>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Próximos Eventos</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {events.map((event) => (
              <div key={event.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">Cliente: {event.client}</p>
                    <p className="text-sm text-gray-600">Equipo: {event.equipment}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-resona">{event.date}</p>
                    <p className="text-sm text-gray-600">{event.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Esta es una versión demo. Puedes integrar librerías como FullCalendar o React Big Calendar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CalendarManager;
