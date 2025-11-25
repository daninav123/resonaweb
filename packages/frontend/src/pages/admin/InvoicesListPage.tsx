import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Search, Filter, X, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const InvoicesListPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadPeriod, setDownloadPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch invoices
  const { data, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const result = await api.get('/invoices/');
      return result || [];
    },
  });

  // Extract invoices array from response
  const invoices: any[] = Array.isArray(data) ? data : ((data as any)?.invoices || []);

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice: any) => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.order?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((invoice.metadata as any)?.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Download PDF
  const handleDownloadPDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      toast.loading('Descargando PDF...');
      const blob = await api.get(`/invoices/download/${invoiceId}`, {
        responseType: 'blob'
      }) as any;
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.dismiss();
      toast.success('PDF descargado');
    } catch (error) {
      toast.dismiss();
      toast.error('Error al descargar PDF');
    }
  };

  // Generate Facturae
  const handleGenerateFacturae = async (invoiceId: string) => {
    try {
      toast.loading('Generando Facturae XML...');
      await api.post(`/invoices/${invoiceId}/facturae`);
      toast.dismiss();
      toast.success('Facturae XML generado');
    } catch (error) {
      toast.dismiss();
      toast.error('Error al generar Facturae');
    }
  };

  // Get date range based on period
  const getDateRange = () => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (downloadPeriod) {
      case 'today':
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        break;
      case 'week':
        const firstDay = today.getDate() - today.getDay();
        start = new Date(today.getFullYear(), today.getMonth(), firstDay);
        end = new Date(today.getFullYear(), today.getMonth(), firstDay + 7);
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        break;
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        start = new Date(today.getFullYear(), quarter * 3, 1);
        end = new Date(today.getFullYear(), quarter * 3 + 3, 1);
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear() + 1, 0, 1);
        break;
      case 'custom':
        if (startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
          end.setDate(end.getDate() + 1);
        }
        break;
    }

    return { start, end };
  };

  // Download all invoices as ZIP
  const handleDownloadAllInvoices = async () => {
    try {
      if (downloadPeriod === 'custom' && (!startDate || !endDate)) {
        toast.error('Por favor selecciona las fechas de inicio y fin');
        return;
      }

      setIsDownloading(true);
      toast.loading('Preparando descarga de facturas...');

      const { start, end } = getDateRange();

      const blob = await api.get('/invoices/download-all', {
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
        responseType: 'blob'
      }) as any;

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `facturas_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss();
      toast.success('Facturas descargadas correctamente');
      setShowDownloadModal(false);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error?.response?.data?.message || 'Error al descargar facturas');
    } finally {
      setIsDownloading(false);
    }
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'Pagada';
      case 'PENDING': return 'Pendiente';
      case 'OVERDUE': return 'Vencida';
      case 'CANCELLED': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Todas las Facturas</h1>
              <p className="text-gray-600 mt-1">Gestiona todas las facturas del sistema</p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/admin/invoices/manual')}
            className="flex items-center gap-2 px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark transition"
          >
            <FileText className="w-5 h-5" />
            Crear Factura Manual
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por número, cliente, email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
              >
                <option value="ALL">Todos los estados</option>
                <option value="PENDING">Pendientes</option>
                <option value="PAID">Pagadas</option>
                <option value="OVERDUE">Vencidas</option>
                <option value="CANCELLED">Canceladas</option>
              </select>
            </div>

            {/* Download All Button */}
            <button
              onClick={() => setShowDownloadModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
            >
              <Download className="w-5 h-5" />
              Descargar Todas
            </button>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
            <span>Total: {filteredInvoices.length} facturas</span>
            <span>•</span>
            <span>Web: {filteredInvoices.filter((i: any) => i.orderId).length}</span>
            <span>•</span>
            <span>Manuales: {filteredInvoices.filter((i: any) => !i.orderId).length}</span>
          </div>
        </div>

        {/* Invoices List */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-600">Cargando facturas...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron facturas</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice: any) => {
                    const isManual = !invoice.orderId;
                    const customerName = isManual 
                      ? (invoice.metadata as any)?.customer?.name 
                      : `${invoice.order?.user?.firstName || ''} ${invoice.order?.user?.lastName || ''}`.trim();
                    const customerEmail = isManual
                      ? (invoice.metadata as any)?.customer?.email
                      : invoice.order?.user?.email;

                    return (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isManual ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Manual
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Web
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{customerName || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{customerEmail || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.createdAt).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {Number(invoice.total).toFixed(2)} €
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {getStatusText(invoice.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDownloadPDF(invoice.id, invoice.invoiceNumber)}
                              className="text-resona hover:text-resona-dark"
                              title="Descargar PDF"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleGenerateFacturae(invoice.id)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Generar Facturae XML"
                            >
                              <FileText className="w-5 h-5" />
                            </button>
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

        {/* Download Modal */}
        {showDownloadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-resona" />
                  <h2 className="text-xl font-bold text-gray-900">Descargar Facturas</h2>
                </div>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Period Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona el período
                  </label>
                  <select
                    value={downloadPeriod}
                    onChange={(e) => setDownloadPeriod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  >
                    <option value="today">Hoy</option>
                    <option value="week">Esta Semana</option>
                    <option value="month">Este Mes</option>
                    <option value="quarter">Este Trimestre</option>
                    <option value="year">Este Año</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>

                {/* Custom Date Range */}
                {downloadPeriod === 'custom' && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de inicio
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de fin
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Info */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📦 Se descargarán todas las facturas en formato ZIP con sus PDFs correspondientes.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDownloadAllInvoices}
                  disabled={isDownloading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
                >
                  <Download className="w-5 h-5" />
                  {isDownloading ? 'Descargando...' : 'Descargar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesListPage;
