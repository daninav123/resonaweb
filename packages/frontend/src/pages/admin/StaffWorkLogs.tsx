import { useState, useEffect } from 'react';
import { Clock, Plus, ChevronLeft, ChevronRight, DollarSign, Check, X, Users } from 'lucide-react';
import { staffFrontendService } from '../../services/staff.service';
import toast from 'react-hot-toast';

const formatCurrency = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`;

const StaffWorkLogs = () => {
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddLog, setShowAddLog] = useState(false);
  const [logForm, setLogForm] = useState({
    eventRef: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    hoursWorked: '8',
    hourlyRate: '15',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    if (selectedStaff) loadReport();
  }, [selectedStaff, currentDate]);

  const loadStaff = async () => {
    try {
      const res: any = await staffFrontendService.list({ limit: 100 });
      const data = res.data || res || [];
      setAllStaff(Array.isArray(data) ? data : data.data || []);
    } catch {
      toast.error('Error al cargar personal');
    }
  };

  const loadReport = async () => {
    if (!selectedStaff) return;
    setLoading(true);
    try {
      const res: any = await staffFrontendService.getMonthlyReport(selectedStaff, year, month);
      setReport(res.data || res);
    } catch {
      toast.error('Error al cargar informe');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async () => {
    if (!selectedStaff) return toast.error('Selecciona un trabajador');
    try {
      await staffFrontendService.addWorkLog(selectedStaff, {
        ...logForm,
        hoursWorked: parseFloat(logForm.hoursWorked),
        hourlyRate: parseFloat(logForm.hourlyRate),
      });
      toast.success('Registro añadido');
      setShowAddLog(false);
      loadReport();
    } catch {
      toast.error('Error al registrar horas');
    }
  };

  const handleTogglePaid = async (logId: string) => {
    try {
      await staffFrontendService.toggleWorkLogPaid(selectedStaff, logId);
      toast.success('Estado actualizado');
      loadReport();
    } catch {
      toast.error('Error');
    }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month, 1));
  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const selectedStaffData = allStaff.find((s) => s.id === selectedStaff);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          Registro de Horas
        </h2>
      </div>

      {/* Staff selector + month nav */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap items-center gap-4">
        <select
          value={selectedStaff}
          onChange={(e) => setSelectedStaff(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
        >
          <option value="">Seleccionar trabajador...</option>
          {allStaff.map((s) => (
            <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium capitalize min-w-[140px] text-center">{monthName}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {selectedStaff && (
          <button
            onClick={() => {
              setLogForm({
                eventRef: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                hoursWorked: '8',
                hourlyRate: String(selectedStaffData?.hourlyRate || '15'),
              });
              setShowAddLog(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> Añadir registro
          </button>
        )}
      </div>

      {!selectedStaff && (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          Selecciona un trabajador para ver su registro de horas
        </div>
      )}

      {selectedStaff && report && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Horas totales</div>
              <div className="text-2xl font-bold text-blue-600">{report.totalHours}h</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Total devengado</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(report.totalAmount)}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Pagado</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(report.totalPaid)}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Pendiente</div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(report.pending)}</div>
            </div>
          </div>

          {/* Logs table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-left">Fecha</th>
                  <th className="p-3 text-left">Evento/Ref</th>
                  <th className="p-3 text-left">Descripción</th>
                  <th className="p-3 text-center">Horas</th>
                  <th className="p-3 text-center">€/h</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {(report.logs || []).map((log: any) => (
                  <tr key={log.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{new Date(log.date).toLocaleDateString('es-ES')}</td>
                    <td className="p-3 text-gray-600">{log.eventRef || '-'}</td>
                    <td className="p-3 text-gray-600">{log.description || '-'}</td>
                    <td className="p-3 text-center font-medium">{Number(log.hoursWorked)}h</td>
                    <td className="p-3 text-center">{formatCurrency(Number(log.hourlyRate))}</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(Number(log.totalAmount))}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleTogglePaid(log.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          log.paid
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {log.paid ? '✓ Pagado' : 'Pendiente'}
                      </button>
                    </td>
                  </tr>
                ))}
                {(report.logs || []).length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      No hay registros de horas este mes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {/* Add log modal */}
      {showAddLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddLog(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Registrar horas</h3>
              <button onClick={() => setShowAddLog(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Trabajador: <strong>{selectedStaffData?.name}</strong>
            </p>

            <input
              type="date"
              value={logForm.date}
              onChange={(e) => setLogForm((p) => ({ ...p, date: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={logForm.eventRef}
              onChange={(e) => setLogForm((p) => ({ ...p, eventRef: e.target.value }))}
              placeholder="Referencia evento / pedido"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={logForm.description}
              onChange={(e) => setLogForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Descripción del trabajo"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Horas</label>
                <input
                  type="number"
                  step="0.5"
                  value={logForm.hoursWorked}
                  onChange={(e) => setLogForm((p) => ({ ...p, hoursWorked: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">€/hora</label>
                <input
                  type="number"
                  step="0.5"
                  value={logForm.hourlyRate}
                  onChange={(e) => setLogForm((p) => ({ ...p, hourlyRate: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              Total: <strong>{formatCurrency(parseFloat(logForm.hoursWorked || '0') * parseFloat(logForm.hourlyRate || '0'))}</strong>
            </p>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAddLog(false)} className="px-4 py-2 text-gray-500 text-sm">
                Cancelar
              </button>
              <button
                onClick={handleAddLog}
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

export default StaffWorkLogs;
