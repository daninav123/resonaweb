import { useState, useEffect } from 'react';
import { DollarSign, Calendar, CheckCircle, Clock, XCircle, Download } from 'lucide-react';
import { api } from '../../services/api';

interface Commission {
  id: string;
  quoteValue: number;
  commissionValue: number;
  commissionRate: number;
  status: string;
  paidAt?: string;
  createdAt: string;
  quoteRequest: {
    id: string;
    customerName?: string;
    customerEmail?: string;
    eventType: string;
    eventDate?: string;
    estimatedTotal?: number;
  };
}

const CommissionsPage = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [summary, setSummary] = useState({
    month: { total: 0, count: 0 },
    quarter: { total: 0, count: 0 },
    year: { total: 0, count: 0 },
    pending: { total: 0, count: 0 },
  });

  useEffect(() => {
    loadCommissions();
    loadSummary();
  }, [statusFilter]);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/commercial/commissions', { params });
      setCommissions(response as Commission[]);
    } catch (error) {
      console.error('Error cargando comisiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await api.get('/commercial/commissions/summary');
      setSummary(response as typeof summary);
    } catch (error) {
      console.error('Error cargando resumen:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      GENERATED: 'bg-green-100 text-green-800',
      PAID: 'bg-blue-100 text-blue-800',
      LOST: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      PENDING: Clock,
      GENERATED: CheckCircle,
      PAID: DollarSign,
      LOST: XCircle,
    };
    const Icon = icons[status] || Clock;
    return <Icon size={16} />;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      GENERATED: 'Generada',
      PAID: 'Pagada',
      LOST: 'Perdida',
    };
    return labels[status] || status;
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Cliente', 'Evento', 'Presupuesto', 'Comisión', 'Estado'];
    const rows = commissions.map((c) => [
      formatDate(c.createdAt),
      c.quoteRequest.customerName || 'Sin nombre',
      c.quoteRequest.eventType,
      formatCurrency(Number(c.quoteValue)),
      formatCurrency(Number(c.commissionValue)),
      getStatusLabel(c.status),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comisiones-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Comisiones</h1>
          <p className="text-gray-600 mt-1">Historial de comisiones (10% por presupuesto ganado)</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Download size={20} />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Este Mes</p>
            <Calendar className="text-blue-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.month.total)}</p>
          <p className="text-sm text-gray-500 mt-1">{summary.month.count} comisiones</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Este Trimestre</p>
            <Calendar className="text-purple-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.quarter.total)}</p>
          <p className="text-sm text-gray-500 mt-1">{summary.quarter.count} comisiones</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Este Año</p>
            <Calendar className="text-green-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(summary.year.total)}</p>
          <p className="text-sm text-gray-500 mt-1">{summary.year.count} comisiones</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Pendiente de Pago</p>
            <DollarSign className="text-orange-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-orange-600">{formatCurrency(summary.pending.total)}</p>
          <p className="text-sm text-gray-500 mt-1">{summary.pending.count} generadas</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="GENERATED">Generada</option>
            <option value="PAID">Pagada</option>
            <option value="LOST">Perdida</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente / Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Presupuesto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comisión (10%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Cargando comisiones...
                  </td>
                </tr>
              ) : commissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No hay comisiones disponibles
                  </td>
                </tr>
              ) : (
                commissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-900">{formatDate(commission.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {commission.quoteRequest.customerName || 'Sin nombre'}
                        </p>
                        <p className="text-sm text-gray-600">{commission.quoteRequest.eventType}</p>
                        {commission.quoteRequest.eventDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Evento: {formatDate(commission.quoteRequest.eventDate)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(Number(commission.quoteValue))}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(Number(commission.commissionValue))}
                      </p>
                      <p className="text-xs text-gray-500">{commission.commissionRate}%</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          commission.status
                        )}`}
                      >
                        {getStatusIcon(commission.status)}
                        <span>{getStatusLabel(commission.status)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{formatDate(commission.paidAt)}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-sm font-bold">i</span>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">¿Cómo funcionan las comisiones?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Recibes el <strong>10% del valor del presupuesto</strong> cuando un cliente acepta</li>
              <li>• Estado <strong>Pendiente</strong>: Presupuesto enviado, esperando respuesta</li>
              <li>• Estado <strong>Generada</strong>: Cliente aceptó, comisión lista para pago</li>
              <li>• Estado <strong>Pagada</strong>: Comisión cobrada por el admin</li>
              <li>• Estado <strong>Perdida</strong>: Cliente rechazó el presupuesto</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionsPage;
