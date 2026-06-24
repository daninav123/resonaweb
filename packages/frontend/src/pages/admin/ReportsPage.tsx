import { useState } from 'react';
import { BarChart3, Download, Calendar, DollarSign, Package, Users, TrendingUp, Loader2, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const formatCurrency = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`;
const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES');

type ReportType = 'financial' | 'equipment' | 'events' | 'staff';

const ReportsPage = () => {
  const [reportType, setReportType] = useState<ReportType>('financial');
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchReport = async (): Promise<any> => {
    switch (reportType) {
      case 'financial': {
        const res: any = await api.get('/contabilidad/summary', { params: { period } });
        return res.data || res;
      }
      case 'equipment': {
        const res: any = await api.get('/availability/global', {
          params: { startDate: new Date(startDate).toISOString(), endDate: new Date(endDate).toISOString() },
        });
        return res.data || res;
      }
      case 'events': {
        const res: any = await api.get('/events', { params: { limit: 100 } });
        return res.data || res;
      }
      case 'staff': {
        const res: any = await api.get('/staff/stats');
        return res.data || res;
      }
    }
  };

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ['admin-report', reportType, period, startDate, endDate],
    queryFn: fetchReport,
    staleTime: 30_000,
  });

  const exportCSV = () => {
    if (!data) return;
    let csv = '';
    let filename = `informe-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;

    switch (reportType) {
      case 'financial':
        csv = 'Concepto,Valor\n';
        csv += `Ingresos,${data.ingresos || 0}\n`;
        csv += `Gastos,${data.gastos || 0}\n`;
        csv += `Beneficio,${data.beneficio || 0}\n`;
        csv += `Gastos recurrentes,${data.gastosRecurrentes || 0}\n`;
        csv += `Pedidos,${data.pedidos || 0}\n`;
        break;
      case 'equipment': {
        csv = 'Producto,Categoría,Stock,Mín. Disponible,Reservas\n';
        (data.products || []).forEach((p: any) => {
          csv += `"${p.name}","${p.category}",${p.stock},${p.minAvailable},${p.bookings?.length || 0}\n`;
        });
        break;
      }
      case 'events': {
        csv = 'Evento,Tipo,Fecha,Fase,Cliente,Ingresos Est.\n';
        const events = data.events || data || [];
        (Array.isArray(events) ? events : []).forEach((e: any) => {
          csv += `"${e.title}","${e.eventType}","${formatDate(e.eventDate)}","${e.phase}","${e.clientName}",${e.estimatedRevenue || 0}\n`;
        });
        break;
      }
      case 'staff':
        csv = 'Métrica,Valor\n';
        csv += `Total personal,${data.total || 0}\n`;
        Object.entries(data.byType || {}).forEach(([k, v]) => { csv += `Tipo: ${k},${v}\n`; });
        csv += `Pagos pendientes,${data.unpaid?.total || 0}\n`;
        break;
    }

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado');
  };

  const reportTabs = [
    { id: 'financial' as ReportType, label: 'Financiero', icon: DollarSign },
    { id: 'equipment' as ReportType, label: 'Equipos', icon: Package },
    { id: 'events' as ReportType, label: 'Eventos', icon: Calendar },
    { id: 'staff' as ReportType, label: 'Personal', icon: Users },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            Informes
          </h1>
          <p className="text-gray-500 mt-1">Informes avanzados exportables</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={!data}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-green-700 disabled:bg-gray-300"
        >
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  reportType === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4 flex-wrap">
        {reportType === 'financial' && (
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
          </select>
        )}
        {reportType === 'equipment' && (
          <>
            <div>
              <label className="text-xs text-gray-500">Desde</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm ml-2" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Hasta</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm ml-2" />
            </div>
          </>
        )}
        <button onClick={() => refetch()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          Generar
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : !data ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">Selecciona un tipo de informe y pulsa Generar</div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          {reportType === 'financial' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Resumen Financiero</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600">Ingresos</div>
                  <div className="text-2xl font-bold text-green-700">{formatCurrency(data.ingresos || 0)}</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-sm text-red-600">Gastos</div>
                  <div className="text-2xl font-bold text-red-700">{formatCurrency(data.gastos || 0)}</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600">Beneficio</div>
                  <div className="text-2xl font-bold text-blue-700">{formatCurrency(data.beneficio || 0)}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-purple-600">Pedidos</div>
                  <div className="text-2xl font-bold text-purple-700">{data.pedidos || 0}</div>
                </div>
              </div>
              {data.cambio && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className={`w-4 h-4 ${data.cambio >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={data.cambio >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {data.cambio >= 0 ? '+' : ''}{data.cambio?.toFixed(1)}% vs período anterior
                  </span>
                </div>
              )}
            </div>
          )}

          {reportType === 'equipment' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Utilización de Equipos ({data.totalProducts || 0} productos)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 text-left">Producto</th>
                      <th className="p-3 text-left">Categoría</th>
                      <th className="p-3 text-center">Stock</th>
                      <th className="p-3 text-center">Mín. Disponible</th>
                      <th className="p-3 text-center">Reservas</th>
                      <th className="p-3 text-center">% Uso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.products || []).map((p: any) => {
                      const usage = p.stock > 0 ? Math.round(((p.stock - p.minAvailable) / p.stock) * 100) : 0;
                      return (
                        <tr key={p.id} className="border-t hover:bg-gray-50">
                          <td className="p-3 font-medium">{p.name}</td>
                          <td className="p-3 text-gray-500">{p.category}</td>
                          <td className="p-3 text-center">{p.stock}</td>
                          <td className="p-3 text-center">{p.minAvailable}</td>
                          <td className="p-3 text-center">{p.bookings?.length || 0}</td>
                          <td className="p-3 text-center">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                                <div
                                  className={`h-2 rounded-full ${usage > 80 ? 'bg-red-500' : usage > 50 ? 'bg-orange-500' : 'bg-green-500'}`}
                                  style={{ width: `${Math.min(usage, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium w-10 text-right">{usage}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportType === 'events' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Resumen de Eventos</h3>
              {(() => {
                const events = Array.isArray(data.events || data) ? (data.events || data) : [];
                const byPhase = events.reduce((acc: any, e: any) => { acc[e.phase] = (acc[e.phase] || 0) + 1; return acc; }, {});
                const totalRevenue = events.reduce((s: number, e: any) => s + Number(e.estimatedRevenue || 0), 0);
                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-sm text-gray-500">Total eventos</div>
                        <div className="text-2xl font-bold">{events.length}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-green-600">Ingresos estimados</div>
                        <div className="text-2xl font-bold text-green-700">{formatCurrency(totalRevenue)}</div>
                      </div>
                      {Object.entries(byPhase).slice(0, 2).map(([phase, count]) => (
                        <div key={phase} className="bg-blue-50 rounded-lg p-4">
                          <div className="text-sm text-blue-600">{phase}</div>
                          <div className="text-2xl font-bold text-blue-700">{count as number}</div>
                        </div>
                      ))}
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-3 text-left">Evento</th>
                          <th className="p-3 text-left">Tipo</th>
                          <th className="p-3 text-left">Fecha</th>
                          <th className="p-3 text-left">Fase</th>
                          <th className="p-3 text-right">Ingresos est.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.slice(0, 20).map((e: any) => (
                          <tr key={e.id} className="border-t hover:bg-gray-50">
                            <td className="p-3 font-medium">{e.title}</td>
                            <td className="p-3 text-gray-500">{e.eventType}</td>
                            <td className="p-3">{formatDate(e.eventDate)}</td>
                            <td className="p-3"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{e.phase}</span></td>
                            <td className="p-3 text-right">{formatCurrency(Number(e.estimatedRevenue || 0))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                );
              })()}
            </div>
          )}

          {reportType === 'staff' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Resumen de Personal</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600">Total personal</div>
                  <div className="text-2xl font-bold text-blue-700">{data.total || 0}</div>
                </div>
                {Object.entries(data.byType || {}).map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 capitalize">{k}</div>
                    <div className="text-2xl font-bold">{v as number}</div>
                  </div>
                ))}
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-sm text-red-600">Pagos pendientes</div>
                  <div className="text-2xl font-bold text-red-700">{formatCurrency(data.unpaid?.total || 0)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
