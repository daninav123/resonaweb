import { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Users, Clock, AlertTriangle, Plus, X } from 'lucide-react';
import { staffFrontendService } from '../../services/staff.service';
import toast from 'react-hot-toast';

interface AvailabilityEntry {
  id: string;
  staffId: string;
  date: string;
  type: string;
  notes: string | null;
  eventRef: string | null;
  staff: { id: string; name: string; specialty: string | null };
}

const TYPE_COLORS: Record<string, { bg: string; label: string }> = {
  available: { bg: 'bg-green-200 text-green-800', label: 'Disponible' },
  unavailable: { bg: 'bg-red-200 text-red-800', label: 'No disponible' },
  vacation: { bg: 'bg-blue-200 text-blue-800', label: 'Vacaciones' },
  sick: { bg: 'bg-orange-200 text-orange-800', label: 'Baja' },
  assigned: { bg: 'bg-purple-200 text-purple-800', label: 'Asignado' },
};

const StaffAvailabilityCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<AvailabilityEntry[]>([]);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [blockForm, setBlockForm] = useState({
    staffId: '',
    startDate: '',
    endDate: '',
    type: 'unavailable',
    notes: '',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [calRes, staffRes]: any[] = await Promise.all([
        staffFrontendService.getAvailabilityCalendar(year, month),
        staffFrontendService.list({ limit: 100, status: 'active' }),
      ]);
      setEntries(calRes.data || calRes || []);
      setAllStaff((staffRes.data || staffRes || []).data || staffRes.data || []);
    } catch {
      toast.error('Error al cargar calendario');
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = useMemo(() => {
    const first = new Date(year, month - 1, 1);
    const last = new Date(year, month, 0);
    const days: Date[] = [];
    for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  }, [year, month]);

  const staffMembers = useMemo(() => {
    const staffFromEntries = entries.map((e) => e.staff);
    const allIds = new Set([
      ...staffFromEntries.map((s) => s.id),
      ...(Array.isArray(allStaff) ? allStaff.map((s: any) => s.id) : []),
    ]);
    const staffMap = new Map<string, { id: string; name: string; specialty: string | null }>();
    staffFromEntries.forEach((s) => staffMap.set(s.id, s));
    if (Array.isArray(allStaff)) {
      allStaff.forEach((s: any) => {
        if (!staffMap.has(s.id)) staffMap.set(s.id, { id: s.id, name: s.name, specialty: s.specialty });
      });
    }
    return Array.from(staffMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [entries, allStaff]);

  const getEntriesForDay = (staffId: string, day: Date) => {
    const dayStr = day.toISOString().split('T')[0];
    return entries.filter((e) => {
      const entryDate = new Date(e.date).toISOString().split('T')[0];
      return e.staffId === staffId && entryDate === dayStr;
    });
  };

  const handleBlockDates = async () => {
    if (!blockForm.staffId || !blockForm.startDate || !blockForm.endDate) {
      toast.error('Completa todos los campos');
      return;
    }
    try {
      await staffFrontendService.bulkAddAvailability(blockForm.staffId, {
        startDate: blockForm.startDate,
        endDate: blockForm.endDate,
        type: blockForm.type,
        notes: blockForm.notes,
      });
      toast.success('Fechas registradas');
      setShowAddModal(false);
      setBlockForm({ staffId: '', startDate: '', endDate: '', type: 'unavailable', notes: '' });
      loadData();
    } catch {
      toast.error('Error al registrar fechas');
    }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month, 1));
  const goToday = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Calendario de Disponibilidad
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Bloquear fechas
        </button>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow p-3 flex items-center justify-center gap-3">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={goToday} className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg font-medium">
          Hoy
        </button>
        <h3 className="text-lg font-semibold capitalize min-w-[180px] text-center">{monthName}</h3>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
        {Object.entries(TYPE_COLORS).map(([key, val]) => (
          <span key={key} className="flex items-center gap-1">
            <span className={`w-3 h-3 rounded ${val.bg.split(' ')[0]}`} />
            {val.label}
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 z-10 bg-gray-50 p-2 text-left min-w-[160px] border-b border-r">
                Personal ({staffMembers.length})
              </th>
              {daysInMonth.map((day) => {
                const isToday = day.getTime() === today.getTime();
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <th
                    key={day.toISOString()}
                    className={`p-1 text-center border-b min-w-[30px] ${isToday ? 'bg-blue-100 font-bold' : ''} ${isWeekend ? 'bg-gray-100' : ''}`}
                  >
                    <div className="text-[10px] text-gray-400">
                      {day.toLocaleDateString('es-ES', { weekday: 'narrow' })}
                    </div>
                    <div className={isToday ? 'text-blue-700' : ''}>{day.getDate()}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {staffMembers.map((staff) => (
              <tr key={staff.id} className="hover:bg-gray-50/50 group">
                <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 p-2 border-b border-r">
                  <div className="font-medium text-gray-900 truncate">{staff.name}</div>
                  <div className="text-[10px] text-gray-400">{staff.specialty || '-'}</div>
                </td>
                {daysInMonth.map((day) => {
                  const dayEntries = getEntriesForDay(staff.id, day);
                  const isToday = day.getTime() === today.getTime();
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const mainEntry = dayEntries[0];
                  const typeInfo = mainEntry ? TYPE_COLORS[mainEntry.type] || TYPE_COLORS.unavailable : null;

                  return (
                    <td
                      key={day.toISOString()}
                      className={`p-0 border-b text-center ${
                        typeInfo ? typeInfo.bg : isWeekend ? 'bg-gray-50' : 'bg-green-50'
                      } ${isToday ? 'ring-2 ring-blue-400 ring-inset' : ''}`}
                      title={
                        mainEntry
                          ? `${staff.name}: ${typeInfo?.label || mainEntry.type}${mainEntry.eventRef ? ` (${mainEntry.eventRef})` : ''}${mainEntry.notes ? ` - ${mainEntry.notes}` : ''}`
                          : `${staff.name}: Disponible`
                      }
                    >
                      {mainEntry && (
                        <div className="text-[10px] font-medium py-0.5">
                          {mainEntry.type === 'assigned' ? '★' : mainEntry.type.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {staffMembers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            No hay personal registrado
          </div>
        )}
      </div>

      {/* Block dates modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Bloquear fechas</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <select
              value={blockForm.staffId}
              onChange={(e) => setBlockForm((p) => ({ ...p, staffId: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Seleccionar trabajador...</option>
              {staffMembers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Desde</label>
                <input
                  type="date"
                  value={blockForm.startDate}
                  onChange={(e) => setBlockForm((p) => ({ ...p, startDate: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Hasta</label>
                <input
                  type="date"
                  value={blockForm.endDate}
                  onChange={(e) => setBlockForm((p) => ({ ...p, endDate: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <select
              value={blockForm.type}
              onChange={(e) => setBlockForm((p) => ({ ...p, type: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="unavailable">No disponible</option>
              <option value="vacation">Vacaciones</option>
              <option value="sick">Baja médica</option>
              <option value="assigned">Asignado a evento</option>
            </select>

            <input
              type="text"
              value={blockForm.notes}
              onChange={(e) => setBlockForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Notas opcionales..."
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-500 text-sm">
                Cancelar
              </button>
              <button
                onClick={handleBlockDates}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAvailabilityCalendar;
