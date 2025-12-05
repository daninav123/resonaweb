import { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Users, MapPin, Package, CheckCircle, Clock, XCircle, Trash2, Eye } from 'lucide-react';
import { api } from '../../services/api';

interface QuoteRequest {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  eventType: string;
  attendees: number;
  duration: number;
  durationType: string;
  eventDate: string | null;
  eventLocation: string | null;
  selectedPack: string | null;
  selectedExtras: any;
  estimatedTotal: number | null;
  status: string;
  notes: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

const QuoteRequestsManager = () => {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadQuoteRequests();
  }, []);

  const loadQuoteRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/quote-requests');
      setQuoteRequests(response.data || []);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      alert('Error al cargar las solicitudes de presupuesto');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/quote-requests/${id}`, { status: newStatus });
      await loadQuoteRequests();
      alert('✅ Estado actualizado correctamente');
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('❌ Error al actualizar el estado');
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta solicitud?')) return;
    
    try {
      await api.delete(`/quote-requests/${id}`);
      await loadQuoteRequests();
      alert('✅ Solicitud eliminada');
    } catch (error) {
      console.error('Error eliminando solicitud:', error);
      alert('❌ Error al eliminar la solicitud');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CONTACTED': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'QUOTED': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'ACCEPTED': return 'bg-green-100 text-green-800 border-green-300';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'CONTACTED': return <Phone className="w-4 h-4" />;
      case 'QUOTED': return <Mail className="w-4 h-4" />;
      case 'ACCEPTED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'CONTACTED': return 'Contactado';
      case 'QUOTED': return 'Presupuesto Enviado';
      case 'ACCEPTED': return 'Aceptado';
      case 'REJECTED': return 'Rechazado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Solicitudes de Presupuesto</h1>
        <p className="text-gray-600">
          Gestiona las solicitudes de contacto y presupuesto de los clientes
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900">
                {quoteRequests.filter(q => q.status === 'PENDING').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Contactados</p>
              <p className="text-2xl font-bold text-blue-900">
                {quoteRequests.filter(q => q.status === 'CONTACTED').length}
              </p>
            </div>
            <Phone className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Aceptados</p>
              <p className="text-2xl font-bold text-green-900">
                {quoteRequests.filter(q => q.status === 'ACCEPTED').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {quoteRequests.length}
              </p>
            </div>
            <Package className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Lista de solicitudes */}
      <div className="bg-white rounded-lg shadow">
        {quoteRequests.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No hay solicitudes de presupuesto</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Est.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quoteRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{request.customerName || 'Sin nombre'}</p>
                        {request.customerPhone && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {request.customerPhone}
                          </p>
                        )}
                        {request.customerEmail && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {request.customerEmail}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{request.eventType}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {request.attendees} personas
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{request.eventDate || 'Sin fecha'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-resona">
                        {request.estimatedTotal ? `€${Number(request.estimatedTotal).toFixed(2)}` : '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {getStatusText(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteRequest(request.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Detalle de Solicitud</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Información del cliente */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Información del Cliente</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium">{selectedRequest.customerName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium">{selectedRequest.customerPhone || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedRequest.customerEmail || '-'}</p>
                </div>
              </div>
            </div>

            {/* Información del evento */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Información del Evento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tipo de Evento</p>
                  <p className="font-medium">{selectedRequest.eventType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Asistentes</p>
                  <p className="font-medium">{selectedRequest.attendees} personas</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duración</p>
                  <p className="font-medium">{selectedRequest.duration} {selectedRequest.durationType === 'hours' ? 'horas' : 'días'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha del Evento</p>
                  <p className="font-medium">{selectedRequest.eventDate || 'No especificada'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Ubicación</p>
                  <p className="font-medium">{selectedRequest.eventLocation || 'No especificada'}</p>
                </div>
              </div>
            </div>

            {/* Total estimado */}
            {selectedRequest.estimatedTotal && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Total Estimado</p>
                <p className="text-3xl font-bold text-green-900">
                  €{Number(selectedRequest.estimatedTotal).toFixed(2)}
                </p>
              </div>
            )}

            {/* Notas */}
            {selectedRequest.notes && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">Notas</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedRequest.notes}</p>
              </div>
            )}

            {/* Cambiar estado */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Cambiar Estado</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'PENDING')}
                  className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                >
                  Pendiente
                </button>
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'CONTACTED')}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  Contactado
                </button>
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'QUOTED')}
                  className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  Presupuesto Enviado
                </button>
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'ACCEPTED')}
                  className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                >
                  Aceptado
                </button>
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'REJECTED')}
                  className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  Rechazado
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteRequestsManager;
